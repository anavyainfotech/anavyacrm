import React, { forwardRef } from "react";

interface QuotationTemplateProps {
  qId: string | number;
  client: any;
  items: any[];
  subtotal: number;
  taxTotal: number;
  total: number;
  introMessage?: string;
  scopeOfWork?: string[];
  complimentary?: string[];
  timelineAndTerms?: { label: string; value: string }[];
  notIncluded?: string;
}

const QuotationTemplate = forwardRef<HTMLDivElement, QuotationTemplateProps>(
  (
    {
      qId,
      client,
      items = [],
      subtotal = 0,
      taxTotal = 0,
      total = 0,
      introMessage = "Dear Client, thank you for considering Anavya Infotech / Geetanjali CRM for your software & digital solutions. Below is our formal commercial proposal and pricing quote.",
      scopeOfWork = [
        "Phase 1: Requirements Discovery & Technical System Architecture.",
        "Phase 2: Custom UI/UX Design & Mobile Responsive Front-end Development.",
        "Phase 3: Backend API Integration, Database Setup & QA Security Testing.",
        "Phase 4: Production Deployment & 30-Day Post-Launch Maintenance Support."
      ],
      complimentary = [
        "Free SSL Security Certificate & HTTPS Configuration.",
        "Basic On-Page SEO & Google Analytics Integration.",
        "30-Day Free Post-Deployment Bug Fixes & Technical Support."
      ],
      timelineAndTerms = [
        { label: "Project Timeline", value: "Estimated 7-14 business days upon receiving content & assets." },
        { label: "Payment Milestones", value: "50% Advance Upon Signing | 50% Final Payment Before Live Deployment." },
        { label: "Proposal Expiry", value: "This commercial quotation is valid for 15 days from the date of issue." }
      ],
      notIncluded = "▸ Third-party paid APIs, domain registration fees, or specialized stock photography.\n▸ Major feature scope changes outside this proposal will be quoted separately."
    },
    ref
  ) => {
    const issueDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    const quoteCode = `QUO-2026-${String(qId).padStart(3, "0")}`;

    return (
      <div ref={ref} className="w-full max-w-4xl bg-white p-8 md:p-12 rounded-sm border border-gray-300 shadow-xl space-y-8 font-sans print:shadow-none print:border-none print:p-0">
        {/* Header (Matching Tax Invoice Layout) */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-6">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Anavya Infotech Logo" className="w-20 h-20 object-contain" />
            <div>
              <h1 className="text-2xl font-extrabold text-indigo-900 uppercase tracking-wider">
                ANAVYA INFOTECH
              </h1>
              <p className="text-xs text-gray-500 mt-1">Enterprise Web Development, Cloud & Digital Solutions</p>
              <p className="text-xs text-gray-600 mt-2 font-mono">GSTIN: 06PBVPS6923K1ZE | PAN: PBVPS6923K</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold uppercase text-indigo-700 bg-indigo-50 px-3 py-1 rounded border border-indigo-200">
              COMMERCIAL PROPOSAL & QUOTATION
            </span>
            <p className="text-lg font-mono font-extrabold text-gray-900 mt-2">{quoteCode}</p>
            <p className="text-xs text-gray-600 mt-1 font-mono">Date: {issueDate}</p>
            <p className="text-xs text-gray-500 font-mono">Valid Until: {dueDate}</p>
          </div>
        </div>

        {/* Client Details Box (Matching Tax Invoice Layout) */}
        <div className="grid grid-cols-2 gap-8 text-xs bg-gray-50 p-4 rounded-sm border border-gray-200">
          <div>
            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-2">Prepared For (Client):</h3>
            <p className="font-bold text-sm text-gray-900">{client?.name || "Target Client"}</p>
            {client?.company && <p className="font-semibold text-gray-700 mt-0.5">{client.company}</p>}
            {client?.phone && <p className="text-gray-600 mt-1">Phone: {client.phone}</p>}
            {client?.email && <p className="text-gray-600">Email: {client.email}</p>}
          </div>

          <div className="text-right space-y-1 font-mono">
            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-2 font-sans">Commercial Summary:</h3>
            <p className="text-gray-700">Subtotal: <strong>₹{(subtotal || total).toLocaleString("en-IN")}</strong></p>
            <p className="text-blue-700 font-bold">GST Tax (18%): ₹{(taxTotal || 0).toLocaleString("en-IN")}</p>
            <p className="text-indigo-800 font-extrabold text-sm">Estimated Total: ₹{total.toLocaleString("en-IN")}</p>
            <span className="inline-block font-sans font-bold text-[10px] uppercase px-2 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-800 mt-1">
              Status: Proposal Sent
            </span>
          </div>
        </div>

        {/* Executive Summary & Scope of Work */}
        <div className="space-y-3 text-xs text-gray-700">
          <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] border-b border-gray-200 pb-1">
            1. Executive Summary & Scope of Services
          </h3>
          <p className="leading-relaxed text-gray-800">{introMessage}</p>

          <div className="bg-blue-50/50 p-3 rounded-sm border border-blue-100 space-y-1">
            <span className="font-bold text-blue-900 block text-[11px] uppercase tracking-wide">Key Project Scope Deliverables:</span>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {scopeOfWork.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Itemized Services Pricing Table (Matching Tax Invoice Table) */}
        <div className="space-y-2">
          <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
            2. Itemized Pricing & Service Charges
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700 border-collapse">
              <thead className="bg-gray-100 border-y border-gray-300 font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Service Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Price (₹)</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item: any, idx: number) => {
                  const qty = item.qty || item.quantity || 1;
                  const price = item.price || item.rate || 0;
                  const itemTotal = qty * price;
                  return (
                    <tr key={idx}>
                      <td className="py-3 px-3 font-mono">{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-gray-900">{item.name || item.description}</td>
                      <td className="py-3 px-3 text-gray-600 font-medium">{item.category || "IT Development"}</td>
                      <td className="py-3 px-3 text-center font-bold">{qty}</td>
                      <td className="py-3 px-3 text-right font-mono">₹{price.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-gray-900">₹{itemTotal.toLocaleString("en-IN")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end pt-2">
          <div className="w-64 space-y-1.5 text-xs text-right font-medium">
            <div className="flex justify-between text-gray-600">
              <span>Services Subtotal:</span>
              <span className="font-mono text-gray-900">₹{(subtotal || total).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST Tax (18%):</span>
              <span className="font-mono text-blue-700">₹{(taxTotal || 0).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t-2 border-gray-900">
              <span>Grand Total Quote:</span>
              <span className="font-mono text-indigo-700">₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Terms, Timeline & Signatory Footer */}
        <div className="grid grid-cols-2 gap-8 text-xs pt-6 border-t border-gray-200">
          <div className="space-y-2 text-gray-600">
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">3. Commercial Terms & Milestones:</h4>
            <div className="space-y-1">
              {timelineAndTerms.map((term, idx) => (
                <p key={idx}>
                  <strong className="text-gray-800">{term.label}:</strong> {term.value}
                </p>
              ))}
            </div>
            {notIncluded && (
              <p className="text-[11px] text-gray-500 font-mono pt-1 whitespace-pre-wrap">{notIncluded}</p>
            )}
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
    );
  }
);

QuotationTemplate.displayName = "QuotationTemplate";
export default QuotationTemplate;
