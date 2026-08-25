import { db } from "@/lib/db";
import { invoices, clients, organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import PrintButton from "./PrintButton";

export default async function PrintInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoiceId = parseInt(id, 10);
  if (isNaN(invoiceId)) notFound();

  const [inv] = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
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
      clientName: clients.name,
      clientCompany: clients.company,
      clientPhone: clients.phone,
      clientEmail: clients.email,
      orgName: organizations.name,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .leftJoin(organizations, eq(invoices.orgId, organizations.id))
    .where(eq(invoices.id, invoiceId));

  if (!inv) notFound();

  let lineItems = [];
  try {
    lineItems = inv.items ? JSON.parse(inv.items) : [];
  } catch (e) {
    lineItems = [];
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center font-sans print:p-0 print:bg-white">
      <div className="no-print mb-4 flex justify-between items-center w-full max-w-4xl">
        <span className="text-sm font-semibold text-gray-700">GST Tax Invoice Preview — {inv.invoiceNumber}</span>
        <PrintButton />
      </div>

      {/* Corporate Tax Invoice Box */}
      <div className="w-full max-w-4xl bg-white p-8 md:p-12 rounded-sm border border-gray-300 shadow-xl space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-6">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Anavya Infotech Logo" className="w-20 h-20 object-contain" />
            <div>
              <h1 className="text-2xl font-extrabold text-blue-900 uppercase tracking-wider">{inv.orgName || "ANAVYA INFOTECH"}</h1>
              <p className="text-xs text-gray-500 mt-1">Enterprise Software & Technology Solutions</p>
              <p className="text-xs text-gray-600 mt-2 font-mono">GSTIN: 06PBVPS6923K1ZE | PAN: PBVPS6923K</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold uppercase text-blue-700 bg-blue-50 px-3 py-1 rounded border border-blue-200">
              TAX INVOICE
            </span>
            <p className="text-lg font-mono font-extrabold text-gray-900 mt-2">{inv.invoiceNumber}</p>
            <p className="text-xs text-gray-600 mt-1 font-mono">Date: {inv.issueDate}</p>
            <p className="text-xs text-gray-500 font-mono">Due Date: {inv.dueDate}</p>
          </div>
        </div>

        {/* Billed To */}
        <div className="grid grid-cols-2 gap-8 text-xs bg-gray-50 p-4 rounded-sm border border-gray-200">
          <div>
            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-2">Billed To (Client):</h3>
            <p className="font-bold text-sm text-gray-900">{inv.clientName}</p>
            {inv.clientCompany && <p className="font-semibold text-gray-700 mt-0.5">{inv.clientCompany}</p>}
            {inv.clientPhone && <p className="text-gray-600 mt-1">Phone: {inv.clientPhone}</p>}
            {inv.clientEmail && <p className="text-gray-600">Email: {inv.clientEmail}</p>}
          </div>

          <div className="text-right space-y-1 font-mono">
            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-2 font-sans">Payment Summary:</h3>
            <p className="text-gray-700">Total Billed: <strong>₹{inv.total.toLocaleString("en-IN")}</strong></p>
            <p className="text-emerald-700 font-bold">Amount Paid: ₹{inv.amountPaid.toLocaleString("en-IN")}</p>
            <p className="text-amber-700 font-bold text-sm">Balance Due: ₹{inv.amountDue.toLocaleString("en-IN")}</p>
            <span className="inline-block font-sans font-bold text-[10px] uppercase px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-800 mt-1">
              Status: {inv.status}
            </span>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700 border-collapse">
            <thead className="bg-gray-100 border-y border-gray-300 font-bold text-gray-900 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">HSN/SAC</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                <th className="py-2.5 px-3 text-right">GST %</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lineItems.map((item: any, idx: number) => {
                const qty = item.quantity || 1;
                const rate = item.rate || 0;
                const amount = qty * rate;
                return (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-mono">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-gray-900">{item.description}</td>
                    <td className="py-3 px-3 font-mono">{item.hsnCode || "998314"}</td>
                    <td className="py-3 px-3 text-center font-bold">{qty}</td>
                    <td className="py-3 px-3 text-right font-mono">₹{rate.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-3 text-right font-mono">{item.taxRate || 18}%</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-gray-900">₹{amount.toLocaleString("en-IN")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end pt-2">
          <div className="w-64 space-y-1.5 text-xs text-right font-medium">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal (Excl. Tax):</span>
              <span className="font-mono text-gray-900">₹{inv.subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST Tax Total (18%):</span>
              <span className="font-mono text-blue-700">₹{inv.taxTotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t-2 border-gray-900">
              <span>Grand Total:</span>
              <span className="font-mono text-blue-700">₹{inv.total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Bank & Terms Footer */}
        <div className="grid grid-cols-2 gap-8 text-xs pt-6 border-t border-gray-200">
          <div className="flex items-start gap-4">
            <div className="p-1.5 bg-white border border-gray-300 rounded shadow-xs text-center shrink-0">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=6201231875@pthdfc&pn=Anavya%20Infotech" 
                alt="UPI Payment QR Code" 
                className="w-24 h-24 object-contain"
              />
              <span className="text-[9px] font-bold text-gray-800 block mt-1">Scan to Pay via UPI</span>
              <span className="text-[8px] font-mono text-gray-500 block">6201231875@pthdfc</span>
            </div>

            <div className="space-y-1 text-gray-600">
              <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-1">Bank Payment Details:</h4>
              <p className="font-mono text-xs text-gray-900 font-bold">Bank: State Bank of India (SBI) | A/C: 43997234173 | IFSC: SBIN0003101 | UPI: 6201231875@pthdfc</p>
              <p className="text-[11px] text-gray-500 mt-2 font-medium">Terms: {inv.terms || "Payment due within 15 days of invoice date."}</p>
            </div>
          </div>

          <div className="text-right flex flex-col justify-end items-end pt-8">
            <div className="text-right">
              <p className="font-bold text-gray-900 text-xs">For ANAVYA INFOTECH</p>
              <p className="text-[11px] font-semibold text-gray-700 mt-0.5">Akash Kumar — Founder & Owner</p>
              <div className="border-t border-gray-400 w-48 mt-8 mb-1 ml-auto" />
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Authorized Signatory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
