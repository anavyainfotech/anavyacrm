import React, { forwardRef } from "react";

interface AgreementTemplateProps {
  agreement: any;
  client: any;
}

const AgreementTemplate = forwardRef<HTMLDivElement, AgreementTemplateProps>(
  ({ agreement, client }, ref) => {
    let contentText = typeof agreement?.content === "string" ? agreement.content : "";
    if (agreement?.content && typeof agreement.content === "object") {
      try {
        contentText = JSON.stringify(agreement.content, null, 2);
      } catch (e) {}
    }

    const issueDate = agreement?.createdAt
      ? new Date(agreement.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        })
      : new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        });

    const agrCode = `AGR-2026-${String(agreement?.id || 1).padStart(3, "0")}`;

    return (
      <div
        ref={ref}
        className="w-full max-w-4xl bg-white p-8 md:p-12 rounded-sm border border-gray-300 shadow-xl space-y-8 font-sans print:shadow-none print:border-none print:p-0"
      >
        {/* Header (Matching Tax Invoice & Quotation Layout) */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-6">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Anavya Infotech Logo" className="w-20 h-20 object-contain" />
            <div>
              <h1 className="text-2xl font-extrabold text-emerald-900 uppercase tracking-wider">
                ANAVYA INFOTECH
              </h1>
              <p className="text-xs text-gray-500 mt-1">Enterprise Web Development, Cloud & Digital Solutions</p>
              <p className="text-xs text-gray-600 mt-2 font-mono">GSTIN: 06PBVPS6923K1ZE | PAN: PBVPS6923K</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded border border-emerald-200">
              LEGAL CLIENT SERVICE AGREEMENT
            </span>
            <p className="text-lg font-mono font-extrabold text-gray-900 mt-2">{agrCode}</p>
            <p className="text-xs text-gray-600 mt-1 font-mono">Date: {issueDate}</p>
            <p className="text-xs text-gray-500 font-mono">Status: {agreement?.status || "Sent"}</p>
          </div>
        </div>

        {/* Client Details Box (Matching Tax Invoice Layout) */}
        <div className="grid grid-cols-2 gap-8 text-xs bg-gray-50 p-4 rounded-sm border border-gray-200">
          <div>
            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-2">Contract Party (Client):</h3>
            <p className="font-bold text-sm text-gray-900">{client?.name || "Client"}</p>
            {client?.company && <p className="font-semibold text-gray-700 mt-0.5">{client.company}</p>}
            {client?.phone && <p className="text-gray-600 mt-1">Phone: {client.phone}</p>}
            {client?.email && <p className="text-gray-600">Email: {client.email}</p>}
          </div>

          <div className="text-right space-y-1 font-mono">
            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-2 font-sans">Agreement Overview:</h3>
            <p className="text-gray-700">Contract Type: <strong>Master Service Agreement</strong></p>
            <p className="text-emerald-700 font-bold">Court Jurisdiction: District Court, Faridabad, Haryana</p>
            <span className="inline-block font-sans font-bold text-[10px] uppercase px-2 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-800 mt-1">
              Binding Contract
            </span>
          </div>
        </div>

        {/* Agreement Clauses & Text Content */}
        <div className="space-y-3 text-xs text-gray-700">
          <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] border-b border-gray-200 pb-1">
            Terms, Clauses & Scope of Agreement
          </h3>
          <div className="bg-gray-50 p-4 rounded-sm border border-gray-200 whitespace-pre-wrap leading-relaxed text-xs font-mono text-gray-800">
            {contentText ||
              "1. SCOPE OF SERVICES: The Company (Anavya Infotech) agrees to provide IT & Software development services as defined.\n2. PAYMENT TERMS: 50% Advance Upon Signing, 50% Final Payment Before Live Deployment.\n3. CONFIDENTIALITY: Both parties agree to maintain non-disclosure of proprietary source code & business data."}
          </div>
        </div>

        {/* Signature Block (Matching Quotation & Tax Invoice Layout) */}
        <div className="pt-10 border-t border-gray-200">
          <p className="text-xs text-gray-500 italic mb-8 text-center">
            IN WITNESS WHEREOF, the parties hereto have executed this Service Agreement as of the date first written above.
          </p>

          <div className="grid grid-cols-2 gap-12 text-xs">
            {/* Company Signature */}
            <div>
              <p className="font-bold text-gray-900">For ANAVYA INFOTECH</p>
              <p className="text-[11px] font-semibold text-gray-700 mt-0.5">Akash Kumar — Founder & Owner</p>
              <div className="border-t border-gray-400 w-48 mt-10 mb-1" />
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Authorized Company Signatory</span>
            </div>

            {/* Client Signature */}
            <div className="text-right flex flex-col items-end">
              <p className="font-bold text-gray-900">For CLIENT: {client?.company || client?.name || "Client"}</p>
              <p className="text-[11px] font-semibold text-gray-700 mt-0.5">{client?.name || "Authorized Representative"}</p>
              <div className="border-t border-gray-400 w-48 mt-10 mb-1 ml-auto" />
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Client Authorized Signatory</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

AgreementTemplate.displayName = "AgreementTemplate";
export default AgreementTemplate;
