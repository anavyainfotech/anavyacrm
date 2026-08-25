import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

function getLogoBase64(): string {
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(logoPath)) {
      const buf = fs.readFileSync(logoPath);
      return `data:image/png;base64,${buf.toString("base64")}`;
    }
  } catch (e) {
    console.warn("Could not read logo.png:", e);
  }
  return "";
}

export function renderInvoiceHTML(inv: {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  status?: string | null;
  clientName?: string | null;
  clientCompany?: string | null;
  clientPhone?: string | null;
  clientEmail?: string | null;
  items?: string | null;
  terms?: string | null;
}): string {
  let lineItems: any[] = [];
  try {
    lineItems = inv.items ? JSON.parse(inv.items) : [];
  } catch (e) {
    lineItems = [];
  }

  if (lineItems.length === 0) {
    lineItems = [
      { description: "Real Estate Website Development & Setup", hsnCode: "998314", quantity: 1, rate: 5000, taxRate: 18 },
      { description: "Real Estate SEO Growth & Optimization Package", hsnCode: "998314", quantity: 1, rate: 3475, taxRate: 18 }
    ];
  }

  const statusStr = (inv.status || "PAID").toUpperCase();
  const logoBase64 = getLogoBase64();

  const itemsHtml = lineItems
    .map(
      (item: any, idx: number) => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 12px 10px; font-family: monospace; color: #475569;">${idx + 1}</td>
        <td style="padding: 12px 10px; font-weight: bold; color: #0F172A;">${item.description || item.name || "IT Service"}</td>
        <td style="padding: 12px 10px; font-family: monospace; color: #475569;">${item.hsnCode || "998314"}</td>
        <td style="padding: 12px 10px; text-align: center; font-weight: bold; color: #0F172A;">${item.quantity || 1}</td>
        <td style="padding: 12px 10px; text-align: right; font-family: monospace; color: #334155;">₹${(item.rate || 0).toLocaleString("en-IN")}</td>
        <td style="padding: 12px 10px; text-align: right; font-family: monospace; color: #334155;">${item.taxRate || 18}%</td>
        <td style="padding: 12px 10px; text-align: right; font-family: monospace; font-weight: bold; color: #0F172A;">₹${((item.quantity || 1) * (item.rate || 0)).toLocaleString("en-IN")}</td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        html, body { height: 100%; margin: 0; padding: 20px; box-sizing: border-box; background: #ffffff; color: #334155; font-size: 13px; }
        .invoice-container { min-height: 95vh; max-width: 800px; margin: 0 auto; background: #ffffff; display: flex; flex-direction: column; justify-content: space-between; }
        .main-body { flex: 1; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #E2E8F0; padding-bottom: 20px; margin-bottom: 20px; }
        .brand-container { display: flex; align-items: center; gap: 18px; }
        .logo-img { width: 88px; height: 88px; object-fit: contain; }
        .brand-name { font-size: 24px; font-weight: 800; color: #1E3A8A; letter-spacing: 0.5px; margin: 0; }
        .brand-sub { font-size: 12px; color: #64748B; margin: 4px 0 0 0; }
        .brand-gst { font-size: 11px; font-family: monospace; color: #475569; margin: 6px 0 0 0; font-weight: bold; }
        
        .inv-meta { text-align: right; }
        .inv-badge { display: inline-block; font-size: 11px; font-family: monospace; font-weight: bold; text-transform: uppercase; color: #2563EB; background: #EFF6FF; border: 1px solid #BFDBFE; padding: 4px 10px; border-radius: 4px; }
        .inv-num { font-size: 20px; font-family: monospace; font-weight: 800; color: #0F172A; margin: 8px 0 4px 0; }
        .inv-date { font-size: 11px; color: #64748B; font-family: monospace; margin: 2px 0; }
        
        .billed-card { display: flex; justify-content: space-between; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 18px; margin-bottom: 20px; }
        .billed-label { font-size: 11px; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .client-name { font-size: 15px; font-weight: bold; color: #0F172A; margin: 0 0 4px 0; }
        .client-sub { font-size: 12px; font-weight: 600; color: #475569; margin: 0 0 4px 0; }
        .client-contact { font-size: 12px; color: #64748B; margin: 2px 0; }
        
        .summary-right { text-align: right; font-family: monospace; }
        .summary-row { font-size: 12px; color: #475569; margin: 3px 0; }
        .amount-paid { color: #059669; font-weight: bold; }
        .balance-due { color: #D97706; font-weight: bold; }
        .status-pill { display: inline-block; margin-top: 6px; font-size: 10px; font-weight: bold; font-family: sans-serif; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; border: 1px solid #BFDBFE; background: #EFF6FF; color: #1D4ED8; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
        th { background: #F1F5F9; border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; font-size: 10px; font-weight: bold; color: #334155; text-transform: uppercase; padding: 10px; text-align: left; }
        
        .totals-section { display: flex; justify-content: flex-end; margin-bottom: 24px; }
        .totals-box { width: 280px; text-align: right; }
        .subtotal-row { display: flex; justify-content: space-between; font-size: 12px; color: #475569; margin-bottom: 6px; }
        .tax-row { display: flex; justify-content: space-between; font-size: 12px; color: #2563EB; font-weight: bold; margin-bottom: 10px; }
        .grand-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; color: #2563EB; border-top: 2px solid #0F172A; padding-top: 10px; }
        
        .footer-wrapper { margin-top: auto; padding-top: 16px; }
        .footer-section { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #E2E8F0; padding-top: 20px; }
        .bank-box { display: flex; gap: 16px; align-items: flex-start; }
        .qr-card { border: 1px solid #CBD5E1; border-radius: 4px; padding: 6px; text-align: center; background: #ffffff; }
        .qr-img { width: 96px; height: 96px; display: block; }
        .qr-text { font-size: 9px; font-weight: bold; color: #1E293B; margin-top: 4px; display: block; }
        .qr-sub { font-size: 8px; font-family: monospace; color: #64748B; display: block; }
        
        .bank-info { max-width: 320px; font-size: 11px; color: #475569; line-height: 1.5; }
        .bank-title { font-size: 10px; font-weight: bold; color: #0F172A; text-transform: uppercase; margin-bottom: 4px; }
        
        .sign-box { text-align: right; }
        .sign-company { font-size: 12px; font-weight: bold; color: #0F172A; }
        .sign-name { font-size: 11px; font-weight: 600; color: #334155; margin-top: 2px; }
        .sign-line { width: 180px; border-top: 1px solid #94A3B8; margin: 32px 0 4px auto; }
        .sign-label { font-size: 9px; font-weight: bold; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; }

        .electronic-notice { margin-top: 20px; border-top: 1px border-dashed #CBD5E1; padding-top: 10px; text-align: center; font-size: 10px; color: #64748B; font-weight: 600; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="main-body">
        <!-- Header -->
        <div class="header">
          <div class="brand-container">
            ${
              logoBase64
                ? `<img src="${logoBase64}" class="logo-img" alt="Anavya Infotech Logo">`
                : `<svg class="logo-img" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 32C16 23.1634 23.1634 16 32 16C40.8366 16 48 23.1634 48 32C48 40.8366 40.8366 48 32 48C23.1634 48 16 40.8366 16 32Z" stroke="#2563EB" stroke-width="6"/>
                  </svg>`
            }
            <div>
              <h1 class="brand-name">ANAVYA INFOTECH</h1>
              <p class="brand-sub">Enterprise Software & Technology Solutions</p>
              <p class="brand-gst">GSTIN: 06PBVPS6923K1ZE | PAN: PBVPS6923K</p>
            </div>
          </div>
          
          <div class="inv-meta">
            <div class="inv-badge">TAX INVOICE</div>
            <div class="inv-num">${inv.invoiceNumber}</div>
            <div class="inv-date">Date: ${inv.issueDate}</div>
            <div class="inv-date">Due Date: ${inv.dueDate}</div>
          </div>
        </div>

        <!-- Billed Card -->
        <div class="billed-card">
          <div>
            <div class="billed-label">BILLED TO (CLIENT):</div>
            <div class="client-name">${inv.clientName || "Valued Client"}</div>
            ${inv.clientCompany ? `<div class="client-sub">${inv.clientCompany}</div>` : ""}
            ${inv.clientPhone ? `<div class="client-contact">Phone: ${inv.clientPhone}</div>` : ""}
            ${inv.clientEmail ? `<div class="client-contact">Email: ${inv.clientEmail}</div>` : ""}
          </div>
          
          <div class="summary-right">
            <div class="billed-label">PAYMENT SUMMARY:</div>
            <div class="summary-row">Total Billed: ₹${inv.total.toLocaleString("en-IN")}</div>
            <div class="summary-row amount-paid">Amount Paid: ₹${inv.amountPaid.toLocaleString("en-IN")}</div>
            <div class="summary-row balance-due">Balance Due: ₹${inv.amountDue.toLocaleString("en-IN")}</div>
            <div class="status-pill">STATUS: ${statusStr}</div>
          </div>
        </div>

        <!-- Items Table -->
        <table>
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 45%;">DESCRIPTION</th>
              <th style="width: 12%;">HSN/SAC</th>
              <th style="width: 8%; text-align: center;">QTY</th>
              <th style="width: 12%; text-align: right;">RATE (₹)</th>
              <th style="width: 8%; text-align: right;">GST %</th>
              <th style="width: 10%; text-align: right;">AMOUNT (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Totals Summary -->
        <div class="totals-section">
          <div class="totals-box">
            <div class="subtotal-row">
              <span>Subtotal (Excl. Tax):</span>
              <span style="font-family: monospace;">₹${inv.subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div class="tax-row">
              <span>GST Tax Total (18%):</span>
              <span style="font-family: monospace;">₹${inv.taxTotal.toLocaleString("en-IN")}</span>
            </div>
            <div class="grand-row">
              <span>Grand Total:</span>
              <span style="font-family: monospace;">₹${inv.total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div> <!-- /main-body -->

        <!-- Footer Section (QR, Bank Details, Signature & Electronic Notice) -->
        <div class="footer-wrapper">
          <div class="footer-section">
            <div class="bank-box">
              <div class="qr-card">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=6201231875@pthdfc&pn=Anavya%20Infotech" class="qr-img" alt="UPI QR">
                <span class="qr-text">Scan to Pay via UPI</span>
                <span class="qr-sub">6201231875@pthdfc</span>
              </div>
              
              <div class="bank-info">
                <div class="bank-title">BANK PAYMENT DETAILS:</div>
                <strong>Bank: State Bank of India (SBI)</strong> | A/C: 43997234173 | IFSC: SBIN0003101 | UPI: 6201231875@pthdfc
                <br><br>
                Terms: ${inv.terms || `Payment received in full. Thank you for your business!`}
              </div>
            </div>

            <div class="sign-box">
              <div class="sign-company">For ANAVYA INFOTECH</div>
              <div class="sign-name">Akash Kumar — Founder & Owner</div>
              <div class="sign-line"></div>
              <div class="sign-label">AUTHORIZED SIGNATORY</div>
            </div>
          </div>

          <!-- Bottom Notice -->
          <div class="electronic-notice">
            This is an electronically generated invoice and does not require a physical signature.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function generateInvoicePDFBuffer(inv: {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  status?: string | null;
  clientName?: string | null;
  clientCompany?: string | null;
  clientPhone?: string | null;
  clientEmail?: string | null;
  items?: string | null;
  terms?: string | null;
}): Promise<Buffer> {
  const htmlContent = renderInvoiceHTML(inv);

  // Try Puppeteer only in local environment (skip on Vercel serverless for instant PDFKit rendering)
  if (!process.env.VERCEL) {
    try {
      const puppeteer = await import("puppeteer");
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
      });
      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch (puppeteerErr) {
      console.warn("Puppeteer not available, falling back to PDFKit:", puppeteerErr);
    }
  }

  // PDFKit fallback
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // White Background Page
      doc.rect(0, 0, doc.page.width, doc.page.height).fill("#FFFFFF");

      // Brand Title Top Left
      doc.fillColor("#1E3A8A").fontSize(18).font("Helvetica-Bold").text("ANAVYA INFOTECH", 40, 30);
      doc.fillColor("#64748B").fontSize(9).font("Helvetica").text("Enterprise Software & Technology Solutions", 40, 52);
      doc.fillColor("#475569").fontSize(8).font("Helvetica-Bold").text("GSTIN: 06PBVPS6923K1ZE | PAN: PBVPS6923K", 40, 65);

      // Tax Invoice Top Right
      doc.fillColor("#2563EB").fontSize(11).font("Helvetica-Bold").text("TAX INVOICE", doc.page.width - 240, 30, { align: "right" });
      doc.fillColor("#0F172A").fontSize(16).font("Helvetica-Bold").text(inv.invoiceNumber, doc.page.width - 240, 46, { align: "right" });
      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text(`Date: ${inv.issueDate} | Due Date: ${inv.dueDate}`, doc.page.width - 240, 66, { align: "right" });

      doc.strokeColor("#E2E8F0").lineWidth(0.5).moveTo(40, 85).lineTo(doc.page.width - 40, 85).stroke();

      // Billed Card
      const cardY = 95;
      doc.fillColor("#F8FAFC").rect(40, cardY, doc.page.width - 80, 70).fill();
      doc.strokeColor("#E2E8F0").lineWidth(0.5).rect(40, cardY, doc.page.width - 80, 70).stroke();

      doc.fillColor("#475569").fontSize(8).font("Helvetica-Bold").text("BILLED TO (CLIENT):", 50, cardY + 10);
      doc.fillColor("#0F172A").fontSize(12).font("Helvetica-Bold").text(inv.clientName || "Valued Client", 50, cardY + 24);
      if (inv.clientCompany) doc.fillColor("#475569").fontSize(9).font("Helvetica").text(inv.clientCompany, 50, cardY + 38);
      if (inv.clientPhone || inv.clientEmail) doc.fillColor("#64748B").fontSize(8).font("Helvetica").text(`${inv.clientPhone ? "Phone: " + inv.clientPhone : ""} ${inv.clientEmail ? "| Email: " + inv.clientEmail : ""}`, 50, cardY + 52);

      const rightX = doc.page.width - 220;
      doc.fillColor("#475569").fontSize(8).font("Helvetica-Bold").text("PAYMENT SUMMARY:", rightX, cardY + 10, { align: "right" });
      doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica").text(`Total Billed: INR ${inv.total.toLocaleString("en-IN")}`, rightX, cardY + 22, { align: "right" });
      doc.fillColor("#059669").font("Helvetica-Bold").text(`Amount Paid: INR ${inv.amountPaid.toLocaleString("en-IN")}`, rightX, cardY + 34, { align: "right" });
      doc.fillColor("#D97706").font("Helvetica-Bold").text(`Balance Due: INR ${inv.amountDue.toLocaleString("en-IN")}`, rightX, cardY + 46, { align: "right" });
      doc.fillColor("#1D4ED8").fontSize(7.5).font("Helvetica-Bold").text(`STATUS: ${(inv.status || "PAID").toUpperCase()}`, rightX, cardY + 58, { align: "right" });

      // Table Header
      let tableY = cardY + 82;
      doc.fillColor("#F1F5F9").rect(40, tableY, doc.page.width - 80, 20).fill();
      doc.fillColor("#334155").fontSize(8).font("Helvetica-Bold")
        .text("#", 48, tableY + 5)
        .text("DESCRIPTION", 70, tableY + 5)
        .text("HSN/SAC", 280, tableY + 5)
        .text("QTY", 350, tableY + 5)
        .text("RATE (INR)", 400, tableY + 5)
        .text("GST %", 465, tableY + 5)
        .text("AMOUNT (INR)", 500, tableY + 5, { align: "right" });

      tableY += 24;

      let itemsList: any[] = [];
      try { itemsList = inv.items ? JSON.parse(inv.items) : []; } catch (e) { itemsList = []; }
      if (itemsList.length === 0) {
        itemsList = [
          { description: "Real Estate Website Development & Setup", hsnCode: "998314", quantity: 1, rate: 5000, taxRate: 18 },
          { description: "Real Estate SEO Growth & Optimization Package", hsnCode: "998314", quantity: 1, rate: 3475, taxRate: 18 }
        ];
      }

      itemsList.forEach((item, idx) => {
        const qty = item.quantity || 1;
        const rate = item.rate || 0;
        const lineTotal = qty * rate;

        doc.fillColor("#0F172A").fontSize(8).font("Helvetica")
          .text(String(idx + 1), 48, tableY)
          .font("Helvetica-Bold").text(item.description || item.name || "IT Service", 70, tableY, { width: 200 })
          .font("Helvetica").text(item.hsnCode || "998314", 280, tableY)
          .text(String(qty), 350, tableY)
          .text(rate.toLocaleString("en-IN"), 400, tableY)
          .text(`${item.taxRate || 18}%`, 465, tableY)
          .font("Helvetica-Bold").text(lineTotal.toLocaleString("en-IN"), 500, tableY, { align: "right" });

        tableY += 18;
        doc.strokeColor("#E2E8F0").lineWidth(0.5).moveTo(40, tableY - 4).lineTo(doc.page.width - 40, tableY - 4).stroke();
      });

      tableY += 10;

      // Totals Box
      doc.fillColor("#475569").fontSize(8).font("Helvetica")
        .text("Subtotal (Excl. Tax):", 340, tableY + 8)
        .text(`INR ${inv.subtotal.toLocaleString("en-IN")}`, 480, tableY + 8, { align: "right" });

      doc.fillColor("#2563EB").fontSize(8).font("Helvetica-Bold")
        .text("GST Tax Total (18%):", 340, tableY + 22)
        .text(`INR ${inv.taxTotal.toLocaleString("en-IN")}`, 480, tableY + 22, { align: "right" });

      doc.strokeColor("#0F172A").lineWidth(1.5).moveTo(340, tableY + 36).lineTo(doc.page.width - 40, tableY + 36).stroke();

      doc.fillColor("#2563EB").fontSize(14).font("Helvetica-Bold")
        .text("Grand Total:", 340, tableY + 44)
        .text(`INR ${inv.total.toLocaleString("en-IN")}`, 480, tableY + 44, { align: "right" });

      tableY += 80;

      // Footer Section
      doc.fillColor("#0F172A").fontSize(8).font("Helvetica-Bold").text("BANK PAYMENT DETAILS:", 50, tableY + 8);
      doc.fillColor("#475569").fontSize(7.5).font("Helvetica")
        .text("Bank: State Bank of India (SBI) | A/C: 43997234173 | IFSC: SBIN0003101 | UPI: 6201231875@pthdfc", 50, tableY + 20)
        .text(`Terms: ${inv.terms || "Payment received in full. Thank you for your business!"}`, 50, tableY + 32);

      const signX = doc.page.width - 180;
      doc.fillColor("#0F172A").fontSize(8).font("Helvetica-Bold").text("For ANAVYA INFOTECH", signX, tableY + 8, { align: "right" });
      doc.fillColor("#334155").fontSize(7.5).font("Helvetica-Bold").text("Akash Kumar — Founder & Owner", signX, tableY + 20, { align: "right" });
      doc.strokeColor("#94A3B8").lineWidth(0.5).moveTo(signX, tableY + 42).lineTo(doc.page.width - 40, tableY + 42).stroke();
      doc.fillColor("#64748B").fontSize(7).font("Helvetica-Bold").text("AUTHORIZED SIGNATORY", signX, tableY + 46, { align: "right" });

      // Bottom Notice
      doc.fillColor("#64748B").fontSize(8).font("Helvetica")
        .text(
          "This is an electronically generated invoice and does not require a physical signature.",
          40,
          doc.page.height - 30,
          { align: "center", width: doc.page.width - 80 }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
