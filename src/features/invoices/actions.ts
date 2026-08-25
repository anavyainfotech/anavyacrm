"use server";

import { db } from "@/lib/db";
import { invoices, clients, users } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth/auth";
import { eq, desc } from "drizzle-orm";

export async function getInvoicesAction() {
  try {
    const session = await auth();
    const orgId = (session?.user as any)?.orgId
      ? parseInt((session?.user as any).orgId, 10)
      : 1;

    const allInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        clientId: invoices.clientId,
        clientName: clients.name,
        clientCompany: clients.company,
        clientPhone: clients.phone,
        clientEmail: clients.email,
        status: invoices.status,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        subtotal: invoices.subtotal,
        taxTotal: invoices.taxTotal,
        discountTotal: invoices.discountTotal,
        total: invoices.total,
        amountPaid: invoices.amountPaid,
        amountDue: invoices.amountDue,
        paymentMethod: invoices.paymentMethod,
        items: invoices.items,
        notes: invoices.notes,
        terms: invoices.terms,
        createdByName: users.name,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .leftJoin(users, eq(invoices.userId, users.id))
      .where(eq(invoices.orgId, orgId))
      .orderBy(desc(invoices.createdAt));

    return { success: true, invoices: allInvoices };
  } catch (error: any) {
    console.error("Failed to fetch invoices:", error);
    return { success: false, error: error.message || "Failed to fetch invoices" };
  }
}

export async function createInvoiceAction(formData: FormData) {
  try {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id, 10) : 1;
    const orgId = (session?.user as any)?.orgId
      ? parseInt((session?.user as any).orgId, 10)
      : 1;

    const clientIdRaw = formData.get("clientId");
    const clientId = clientIdRaw ? parseInt(clientIdRaw as string, 10) : null;
    if (!clientId) return { success: false, error: "Client selection is required" };

    const issueDate = (formData.get("issueDate") as string || "").trim() || new Date().toISOString().split("T")[0];
    const dueDate = (formData.get("dueDate") as string || "").trim() || new Date().toISOString().split("T")[0];
    const notes = (formData.get("notes") as string || "").trim();
    const terms = (formData.get("terms") as string || "").trim() || "Payment due within 15 days of invoice date.";

    const itemsRaw = formData.get("itemsJson") as string;
    let itemsList = [];
    try {
      itemsList = itemsRaw ? JSON.parse(itemsRaw) : [];
    } catch (e) {
      itemsList = [];
    }

    if (itemsList.length === 0) {
      return { success: false, error: "Please add at least one line item" };
    }

    // Calculate Subtotal, GST Tax, Discount, and Grand Total
    let subtotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;

    itemsList.forEach((item: any) => {
      const qty = item.quantity || 1;
      const rate = item.rate || 0;
      const taxRate = item.taxRate || 0; // e.g. 18%
      const discount = item.discount || 0;

      const itemSubtotal = qty * rate;
      const itemTax = Math.round((itemSubtotal * taxRate) / 100);
      
      subtotal += itemSubtotal;
      taxTotal += itemTax;
      discountTotal += discount;
    });

    const grandTotal = Math.max(0, subtotal + taxTotal - discountTotal);

    // Generate Invoice Number (e.g. INV-2026-001, INV-2026-002)
    const existingInvoices = await db.select().from(invoices).where(eq(invoices.orgId, orgId));
    const invoiceNumber = `INV-2026-${(existingInvoices.length + 1).toString().padStart(3, "0")}`;

    await db.insert(invoices).values({
      invoiceNumber,
      clientId,
      userId,
      orgId,
      status: "Sent",
      issueDate,
      dueDate,
      subtotal,
      taxTotal,
      discountTotal,
      total: grandTotal,
      amountPaid: 0,
      amountDue: grandTotal,
      items: JSON.stringify(itemsList),
      notes,
      terms,
    });

    revalidatePath("/invoices");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create invoice:", error);
    return { success: false, error: error.message || "Failed to create invoice" };
  }
}

export async function recordInvoicePaymentAction(
  invoiceId: number,
  paymentAmount: number,
  paymentMethod: string
) {
  try {
    const [inv] = await db.select().from(invoices).where(eq(invoices.id, invoiceId));
    if (!inv) return { success: false, error: "Invoice not found" };

    const newAmountPaid = inv.amountPaid + paymentAmount;
    const newAmountDue = Math.max(0, inv.total - newAmountPaid);
    
    let newStatus = inv.status;
    if (newAmountDue === 0) {
      newStatus = "Paid";
    } else if (newAmountPaid > 0) {
      newStatus = "Partially Paid";
    }

    await db
      .update(invoices)
      .set({
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        status: newStatus,
        paymentMethod: paymentMethod || inv.paymentMethod,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId));

    // Autopilot Trigger: Create Active Project & Sprint Tasks if Invoice is Paid
    if (newStatus === "Paid") {
      const { triggerAutopilotProjectCreation } = await import("@/features/projects/autopilot");
      await triggerAutopilotProjectCreation(inv.clientId, inv.total);
    }

    revalidatePath("/invoices");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to record payment:", error);
    return { success: false, error: error.message || "Failed to record payment" };
  }
}

export async function updateInvoiceStatusAction(invoiceId: number, newStatus: string) {
  try {
    await db
      .update(invoices)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(invoices.id, invoiceId));

    revalidatePath("/invoices");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteInvoiceAction(invoiceId: number) {
  try {
    await db.delete(invoices).where(eq(invoices.id, invoiceId));
    revalidatePath("/invoices");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendInvoiceEmailAction(invoiceId: number, recipientEmailOverride?: string) {
  try {
    const [inv] = await db
      .select({
        id: invoices.id,
        clientId: invoices.clientId,
        invoiceNumber: invoices.invoiceNumber,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        subtotal: invoices.subtotal,
        taxTotal: invoices.taxTotal,
        discountTotal: invoices.discountTotal,
        total: invoices.total,
        amountPaid: invoices.amountPaid,
        amountDue: invoices.amountDue,
        items: invoices.items,
        notes: invoices.notes,
        terms: invoices.terms,
        clientName: clients.name,
        clientEmail: clients.email,
        clientCompany: clients.company,
        clientPhone: clients.phone,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.id, invoiceId));

    if (!inv) return { success: false, error: "Invoice not found" };

    const targetEmail = (recipientEmailOverride || inv.clientEmail || "").trim();
    
    if (!targetEmail) {
      return { 
        success: false, 
        error: "MISSING_CLIENT_EMAIL", 
        message: `Client "${inv.clientName || "Client"}" has no email address. Please enter an email address to send the Tax Invoice.`,
        clientName: inv.clientName,
        clientId: inv.clientId,
      };
    }

    // If recipientEmailOverride was provided and client had no email, update client record in DB
    if (recipientEmailOverride && inv.clientId && (!inv.clientEmail || inv.clientEmail !== recipientEmailOverride)) {
      await db.update(clients).set({ email: recipientEmailOverride, updatedAt: new Date() }).where(eq(clients.id, inv.clientId));
    }

    let itemsList = [];
    try {
      itemsList = inv.items ? JSON.parse(inv.items) : [];
    } catch (e) {
      itemsList = [];
    }

    const itemsHtml = itemsList
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #1e293b;">${item.description || item.name || "IT Service"}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569;">${item.quantity || 1}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #475569;">₹${(item.rate || 0).toLocaleString("en-IN")}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0f172a;">₹${((item.quantity || 1) * (item.rate || 0)).toLocaleString("en-IN")}</td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Tax Invoice ${inv.invoiceNumber}</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #334155;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <div style="background-color: #0f172a; padding: 25px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; tracking-wide: 1px;">ANAVYA INFOTECH</h1>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #94a3b8;">Tax Invoice & Billing Statement</p>
          </div>
          
          <!-- Details Banner -->
          <div style="padding: 25px;">
            <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 20px;">
              <div>
                <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Billed To:</span>
                <h3 style="margin: 5px 0 2px 0; color: #0f172a;">${inv.clientName}</h3>
                <p style="margin: 0; font-size: 13px; color: #64748b;">${inv.clientCompany || "Client"}</p>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Invoice Number:</span>
                <h3 style="margin: 5px 0 2px 0; color: #2563eb;">${inv.invoiceNumber}</h3>
                <p style="margin: 0; font-size: 12px; color: #64748b;">Due Date: <strong>${inv.dueDate}</strong></p>
              </div>
            </div>

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
              <thead>
                <tr style="background-color: #f1f5f9; text-align: left; color: #475569;">
                  <th style="padding: 10px;">Item / Service</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Rate</th>
                  <th style="padding: 10px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Total Summary -->
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
              <table style="width: 100%; font-size: 13px;">
                <tr>
                  <td style="color: #64748b;">Subtotal:</td>
                  <td style="text-align: right; font-weight: bold;">₹${inv.subtotal.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td style="color: #64748b;">GST Tax:</td>
                  <td style="text-align: right; font-weight: bold;">+₹${inv.taxTotal.toLocaleString("en-IN")}</td>
                </tr>
                <tr style="font-size: 16px; font-weight: bold; color: #0f172a; border-top: 1px solid #cbd5e1;">
                  <td style="padding-top: 8px;">Total Outstanding Due:</td>
                  <td style="padding-top: 8px; text-align: right; color: #2563eb;">₹${inv.amountDue.toLocaleString("en-IN")}</td>
                </tr>
              </table>
            </div>

            ${inv.terms ? `<p style="font-size: 12px; color: #64748b;"><strong>Terms:</strong> ${inv.terms}</p>` : ""}
          </div>

          <!-- Footer -->
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
            Thank you for choosing Anavya Infotech! • Questions? Reply to this email or contact support.
          </div>
        </div>
      </body>
      </html>
    `;

    const { generateInvoicePDFBuffer } = await import("@/lib/pdf/generator");
    let pdfBuffer: Buffer | undefined;
    try {
      pdfBuffer = await generateInvoicePDFBuffer(inv);
    } catch (pdfErr) {
      console.warn("Could not generate PDF buffer:", pdfErr);
    }

    const { sendEmail } = await import("@/lib/email/sendEmail");
    const mailRes = await sendEmail({
      to: targetEmail,
      subject: `Tax Invoice ${inv.invoiceNumber} from Anavya Infotech (₹${inv.amountDue.toLocaleString("en-IN")} Due)`,
      html: emailHtml,
      attachments: pdfBuffer
        ? [
            {
              filename: `Tax_Invoice_${inv.invoiceNumber}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ]
        : undefined,
    });

    if (mailRes.success) {
      // Log lead activity in CRM
      const { leadActivities } = await import("@/lib/db/schema");
      await db.insert(leadActivities).values({
        clientId: inv.id,
        userId: 1,
        type: "Note",
        content: `📧 Sent Tax Invoice ${inv.invoiceNumber} to ${targetEmail} via SMTP.`,
      });

      return { success: true, message: `Tax Invoice emailed to ${targetEmail} via SMTP!` };
    } else {
      return { success: false, error: mailRes.error || "Failed to send email" };
    }
  } catch (error: any) {
    console.error("Failed to send invoice email:", error);
    return { success: false, error: error.message };
  }
}

