"use server";

import { db } from "@/lib/db";
import { clients, leadActivities, users, quotations, agreements, invoices } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth/auth";
import { eq, desc } from "drizzle-orm";
import { getNextRoundRobinAssignee } from "@/lib/roundRobin";

// AI Lead Score Calculator (0-100)
function calculateAIScore(data: {
  email?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  company?: string | null;
  industry?: string | null;
  budget?: number | null;
  requirement?: string | null;
  priority?: string | null;
  source?: string | null;
}): number {
  let score = 0;

  // Contact info completeness
  if (data.email) score += 10;
  if (data.whatsapp || data.phone) score += 15;
  if (data.company) score += 10;
  if (data.industry) score += 5;

  // Lead quality
  if (data.budget) {
    if (data.budget >= 500000) score += 25;       // 5L+
    else if (data.budget >= 100000) score += 18;  // 1L+
    else if (data.budget >= 50000) score += 12;   // 50k+
    else score += 5;
  }

  if (data.requirement && data.requirement.length > 20) score += 15;

  // Priority
  if (data.priority === 'Urgent') score += 15;
  else if (data.priority === 'High') score += 10;
  else if (data.priority === 'Medium') score += 5;
  else score += 2;

  // Source quality
  if (data.source === 'Referral') score += 10;
  else if (data.source === 'WhatsApp') score += 7;
  else if (data.source === 'Email') score += 5;
  else score += 3;

  return Math.min(100, score); // Max 100
}

export async function addClient(formData: FormData) {
  try {
    const session = await auth();
    const orgId = (session?.user as any)?.orgId
      ? parseInt((session?.user as any).orgId, 10)
      : 1;

    const name = formData.get("name") as string;
    const email = formData.get("email") as string || null;
    const phone = formData.get("phone") as string || null;
    const whatsapp = formData.get("whatsapp") as string || null;
    const company = formData.get("company") as string || null;
    const industry = formData.get("industry") as string || null;
    const source = formData.get("source") as string || null;
    const requirement = formData.get("requirement") as string || null;
    const budgetRaw = formData.get("budget");
    const budget = budgetRaw ? parseInt(budgetRaw as string, 10) : null;
    const priority = formData.get("priority") as string || "Medium";
    const status = formData.get("status") as string || "New Lead";
    const notes = formData.get("notes") as string || null;
    const assignedToRaw = formData.get("assignedTo");
    let assignedTo = assignedToRaw ? parseInt(assignedToRaw as string, 10) : null;

    if (!name) {
      return { success: false, error: "Name is required" };
    }

    // Auto Round-Robin if unassigned
    if (!assignedTo) {
      assignedTo = await getNextRoundRobinAssignee(orgId);
    }

    // Calculate AI Score
    const aiScore = calculateAIScore({ email, whatsapp, phone, company, industry, budget, requirement, priority, source });

    const [insertedClient] = await db.insert(clients).values({
      name, email, phone, whatsapp, company, industry,
      source, requirement, budget, priority, status,
      aiScore, notes, orgId, assignedTo,
    }).returning();

    // Auto-send Welcome Email if Client Email is provided
    if (email) {
      const { sendEmail } = await import("@/lib/email/sendEmail");
      const welcomeHtml = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #334155;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 25px;">
            <div style="background-color: #0f172a; padding: 15px; border-radius: 6px; text-align: center; color: #ffffff; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 20px;">Welcome to Anavya Infotech! 🎉</h2>
            </div>
            <p style="font-size: 14px; color: #1e293b;">Hello <strong>${name}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">
              Thank you for choosing <strong>Anavya Infotech</strong>. We have received your inquiry for <strong>${requirement || "IT Services & Solutions"}</strong>.
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">
              Our dedicated business representative will get in touch with you shortly to discuss your project requirements and next steps.
            </p>
            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #334155;">
              <strong>Anavya Infotech Services:</strong>
              <ul style="margin: 5px 0 0 0; padding-left: 20px;">
                <li>Custom Next.js & Full-Stack Web Applications</li>
                <li>Mobile App Development (iOS & Android)</li>
                <li>Enterprise CRM & Business Automation</li>
                <li>Cloud Infrastructure & API Integrations</li>
              </ul>
            </div>
            <p style="font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 20px;">
              Anavya Infotech • Digital Agency & Enterprise Solutions • <a href="https://anavyainfotech.com" style="color: #2563eb;">anavyainfotech.com</a>
            </p>
          </div>
        </body>
        </html>
      `;

      await sendEmail({
        to: email,
        subject: `Welcome to Anavya Infotech, ${name}! 👋`,
        html: welcomeHtml,
      });

      if (insertedClient?.id) {
        await db.insert(leadActivities).values({
          clientId: insertedClient.id,
          userId: 1,
          type: "Note",
          content: `📧 Sent Automatic Welcome Email to ${email} via SMTP.`,
        });
      }
    }

    revalidatePath("/clients");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add client:", error);
    return { success: false, error: error.message || "Failed to add client" };
  }
}

export async function sendClientWelcomeEmailAction(clientId: number) {
  try {
    const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
    if (!client) return { success: false, error: "Client not found" };

    const targetEmail = (client.email || "").trim();
    if (!targetEmail) {
      return { success: false, error: "MISSING_CLIENT_EMAIL", message: `Client "${client.name}" does not have an email address.` };
    }
    
    const { sendEmail } = await import("@/lib/email/sendEmail");
    const welcomeHtml = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #334155;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 25px;">
          <div style="background-color: #0f172a; padding: 15px; border-radius: 6px; text-align: center; color: #ffffff; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 20px;">Greetings from Anavya Infotech! 👋</h2>
          </div>
          <p style="font-size: 14px; color: #1e293b;">Hello <strong>${client.name}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            We are writing to follow up on your project requirement for <strong>${client.requirement || "IT Services"}</strong> at <strong>${client.company || "your business"}</strong>.
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            Our team is ready to assist you with custom web & app development, digital transformations, and automated business CRM solutions.
          </p>
          <p style="font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 20px;">
            Anavya Infotech • Enterprise Solutions • <a href="https://anavyainfotech.com" style="color: #2563eb;">anavyainfotech.com</a>
          </p>
        </div>
      </body>
      </html>
    `;

    const res = await sendEmail({
      to: targetEmail,
      subject: `Project Update & Greetings from Anavya Infotech, ${client.name}`,
      html: welcomeHtml,
    });

    if (res.success) {
      await db.insert(leadActivities).values({
        clientId,
        userId: 1,
        type: "Note",
        content: `📧 Sent Welcome/Follow-up Email to ${targetEmail} via SMTP.`,
      });

      revalidatePath(`/clients/${clientId}`);
      return { success: true, message: `Email sent to ${targetEmail} via SMTP!` };
    } else {
      return { success: false, error: res.error || "Failed to send email" };
    }
  } catch (error: any) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error: error.message };
  }
}

export async function updateClientDetailsAction(clientId: number, formData: FormData) {
  try {
    const name = (formData.get("name") as string || "").trim();
    if (!name) return { success: false, error: "Name is required" };

    const email = (formData.get("email") as string || "").trim() || null;
    const phone = (formData.get("phone") as string || "").trim() || null;
    const whatsapp = (formData.get("whatsapp") as string || "").trim() || null;
    const company = (formData.get("company") as string || "").trim() || null;
    const industry = (formData.get("industry") as string || "").trim() || null;
    const source = (formData.get("source") as string || "").trim() || null;
    const requirement = (formData.get("requirement") as string || "").trim() || null;
    const budgetRaw = formData.get("budget");
    const budget = budgetRaw ? parseInt(budgetRaw as string, 10) : null;
    const priority = (formData.get("priority") as string || "").trim() || "Medium";
    const status = (formData.get("status") as string || "").trim() || "New Lead";
    const notes = (formData.get("notes") as string || "").trim() || null;
    const assignedToRaw = formData.get("assignedTo");
    const assignedTo = assignedToRaw ? parseInt(assignedToRaw as string, 10) : null;

    const aiScore = calculateAIScore({ email, whatsapp, phone, company, industry, budget, requirement, priority, source });

    await db.update(clients).set({
      name, email, phone, whatsapp, company, industry,
      source, requirement, budget, priority, status,
      aiScore, notes, assignedTo, updatedAt: new Date(),
    }).where(eq(clients.id, clientId));

    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/clients");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update client:", error);
    return { success: false, error: error.message || "Failed to update client details" };
  }
}

export async function deleteClientAction(clientId: number) {
  try {
    await db.delete(clients).where(eq(clients.id, clientId));
    revalidatePath("/clients");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete client" };
  }
}

export async function bulkImportClientsAction(rawText: string) {
  try {
    const session = await auth();
    const orgId = (session?.user as any)?.orgId
      ? parseInt((session?.user as any).orgId, 10)
      : 1;

    if (!rawText || !rawText.trim()) {
      return { success: false, error: "No lead data provided." };
    }

    const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
    let importedCount = 0;

    for (const line of lines) {
      // Support CSV or comma / pipe / tab separated values: Name, Phone, Email, Company
      const parts = line.split(/[,|\t]+/).map((p) => p.trim());
      const name = parts[0];
      if (!name) continue;

      const phone = parts[1] || null;
      const email = parts[2] || null;
      const company = parts[3] || null;

      // Auto round-robin assign
      const assignedTo = await getNextRoundRobinAssignee(orgId);

      const aiScore = calculateAIScore({
        phone,
        email,
        company,
        source: "Cold Call Import",
      });

      await db.insert(clients).values({
        name,
        phone,
        email,
        company,
        source: "Cold Call Import",
        status: "New Lead",
        priority: "Medium",
        aiScore,
        orgId,
        assignedTo,
      });

      importedCount++;
    }

    revalidatePath("/clients");
    return { success: true, count: importedCount };
  } catch (error: any) {
    console.error("Bulk import error:", error);
    return { success: false, error: error.message || "Failed to bulk import" };
  }
}

export async function bulkImportClientsFromObjectsAction(leadsList: Array<{
  name: string;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  requirement?: string | null;
  budget?: number | null;
  priority?: string | null;
  source?: string | null;
}>) {
  try {
    const session = await auth();
    const orgId = (session?.user as any)?.orgId
      ? parseInt((session?.user as any).orgId, 10)
      : 1;

    if (!Array.isArray(leadsList) || leadsList.length === 0) {
      return { success: false, error: "No Excel rows provided." };
    }

    let importedCount = 0;

    for (const lead of leadsList) {
      if (!lead.name) continue;

      const name = String(lead.name).trim();
      const phone = lead.phone ? String(lead.phone).trim() : null;
      const email = lead.email ? String(lead.email).trim() : null;
      const company = lead.company ? String(lead.company).trim() : null;
      const requirement = lead.requirement ? String(lead.requirement).trim() : null;
      const budget = typeof lead.budget === "number" ? lead.budget : (lead.budget ? parseInt(String(lead.budget), 10) : null);
      const priority = lead.priority ? String(lead.priority).trim() : "Medium";
      const source = lead.source ? String(lead.source).trim() : "Excel Import";

      // Auto round-robin assign
      const assignedTo = await getNextRoundRobinAssignee(orgId);

      const aiScore = calculateAIScore({
        phone,
        email,
        company,
        requirement,
        budget,
        priority,
        source,
      });

      await db.insert(clients).values({
        name,
        phone,
        email,
        company,
        requirement,
        budget,
        priority,
        source,
        status: "New Lead",
        aiScore,
        orgId,
        assignedTo,
      });

      importedCount++;
    }

    revalidatePath("/clients");
    return { success: true, count: importedCount };
  } catch (error: any) {
    console.error("Excel bulk import error:", error);
    return { success: false, error: error.message || "Failed to import Excel file" };
  }
}

export async function updateClientStatus(clientId: number, newStatus: string) {
  try {
    await db.update(clients)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(clients.id, clientId));

    revalidatePath("/clients");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addLeadActivity(clientId: number, content: string, type: string = "Note") {
  try {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id, 10) : 1; // Fallback to 1 for now

    await db.insert(leadActivities).values({
      clientId,
      userId,
      type,
      content
    });

    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add activity:", error);
    return { success: false, error: error.message };
  }
}

export async function assignLead(clientId: number, userId: number | null) {
  try {
    await db.update(clients)
      .set({ assignedTo: userId, updatedAt: new Date() })
      .where(eq(clients.id, clientId));

    revalidatePath("/clients");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getClientDetails(clientId: number) {
  try {
    const { leadActivities, users } = require("@/lib/db/schema");
    const { desc } = require("drizzle-orm");

    const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
    
    const activities = await db
      .select({
        id: leadActivities.id,
        type: leadActivities.type,
        content: leadActivities.content,
        createdAt: leadActivities.createdAt,
        user: { id: users.id, name: users.name }
      })
      .from(leadActivities)
      .leftJoin(users, eq(leadActivities.userId, users.id))
      .where(eq(leadActivities.clientId, clientId))
      .orderBy(desc(leadActivities.createdAt));

    const allUsers = await db.select({ id: users.id, name: users.name }).from(users);
    
    // Fetch quotations, agreements, and invoices for this client
    const quotationsData = await db.select().from(quotations).where(eq(quotations.clientId, clientId)).orderBy(desc(quotations.createdAt));
    const agreementsData = await db.select().from(agreements).where(eq(agreements.clientId, clientId)).orderBy(desc(agreements.createdAt));
    const invoicesData = await db.select().from(invoices).where(eq(invoices.clientId, clientId)).orderBy(desc(invoices.createdAt));

    return { 
      success: true, 
      client, 
      activities, 
      users: allUsers, 
      quotations: quotationsData,
      agreements: agreementsData,
      invoices: invoicesData 
    };
  } catch (error: any) {
    console.error("Failed to fetch client details:", error);
    return { success: false, error: error.message };
  }
}

export async function saveQuotation(clientId: number, items: any[], subtotal: number, taxTotal: number, total: number, terms?: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id, 10) : 1; // Fallback to 1 for now

    const result = await db.insert(quotations).values({
      clientId,
      userId,
      items: JSON.stringify(items),
      subtotal: Math.round(subtotal),
      taxTotal: Math.round(taxTotal),
      total: Math.round(total),
      terms: terms || "",
      status: "Sent"
    }).returning({ id: quotations.id });

    await addLeadActivity(clientId, "Quotation generated for ₹" + total.toLocaleString('en-IN'), "Status Change");
    await updateClientStatus(clientId, "Quotation Sent");

    revalidatePath(`/clients/${clientId}`);
    return { success: true, id: result[0].id };
  } catch (error: any) {
    console.error("Failed to save quotation:", error);
    return { success: false, error: error.message };
  }
}

export async function getQuotationById(id: number) {
  try {
    const data = await db.select().from(quotations).where(eq(quotations.id, id));
    if (data.length === 0) return { success: false, error: "Not found" };
    
    const clientData = await db.select().from(clients).where(eq(clients.id, data[0].clientId));
    
    return { success: true, quotation: data[0], client: clientData[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getClientQuotations(clientId: number) {
  try {
    const data = await db.select().from(quotations).where(eq(quotations.clientId, clientId)).orderBy(desc(quotations.createdAt));
    return { success: true, quotations: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteQuotation(quotationId: number, clientId: number) {
  try {
    await db.delete(quotations).where(eq(quotations.id, quotationId));
    revalidatePath(`/clients/${clientId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveAgreement(clientId: number, content: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id, 10) : 1; 

    const result = await db.insert(agreements).values({
      clientId,
      userId,
      content,
      status: "Sent"
    }).returning({ id: agreements.id });

    await addLeadActivity(clientId, "Client Agreement Generated", "Status Change");
    revalidatePath(`/clients/${clientId}`);
    return { success: true, id: result[0].id };
  } catch (error: any) {
    console.error("Failed to save agreement:", error);
    return { success: false, error: error.message };
  }
}

export async function getClientAgreements(clientId: number) {
  try {
    const data = await db.select().from(agreements).where(eq(agreements.clientId, clientId)).orderBy(desc(agreements.createdAt));
    return { success: true, agreements: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAgreementById(id: number) {
  try {
    const data = await db.select().from(agreements).where(eq(agreements.id, id));
    if (data.length === 0) return { success: false, error: "Agreement not found" };
    
    const clientData = await db.select().from(clients).where(eq(clients.id, data[0].clientId));
    return { success: true, agreement: data[0], client: clientData[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAgreement(agreementId: number, clientId: number) {
  try {
    await db.delete(agreements).where(eq(agreements.id, agreementId));
    revalidatePath(`/clients/${clientId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
