import { getQuotationById } from "../../../(dashboard)/clients/actions";
import PrintClient from "./PrintClient";

export default async function PrintQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const qId = parseInt(resolvedParams.id);
  const data = await getQuotationById(qId);

  if (!data.success || !data.quotation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Quotation Not Found</h1>
          <p className="text-gray-500 mt-2">The requested quotation could not be located.</p>
          {data.error && <p className="text-red-500 mt-4 text-sm font-mono">{data.error}</p>}
        </div>
      </div>
    );
  }

  const items = typeof data.quotation.items === 'string' 
    ? JSON.parse(data.quotation.items) 
    : data.quotation.items;

  // We recreate the premium default fields for printing since they aren't saved in DB currently.
  let introMessage = "Dear {clientName}, thank you for the opportunity to work with you. Below is our proposal for a premium website built to convert visitors into walk-in bookings.";
  let scopeOfWork = [
    "Discovery → Design → Development → Testing → Launch. We understand your brand and clientele, design the visual identity, build a fast mobile-responsive site, test it across devices, then publish it live."
  ];
  let complimentary = [
    "Basic on-page SEO setup.",
    "SSL security certificate.",
    "Google Analytics setup.",
    "30 days free support & bug-fixes.",
    "Note: Covers on-page SEO only. Ongoing local SEO & Google Business ranking is a separate monthly service."
  ];
  let timelineAndTerms = [
    { label: "Time Needed", value: "4–7 days from the date we receive your content." },
    { label: "Payment Terms", value: "50% Advance → 50% Before Go Live" },
    { label: "Validity", value: "This quotation is valid for 15 days from the date above." }
  ];
  let notIncluded = "▸ Website Content (Images, Service Details, Logo & Business Information) will be provided by the client.\n▸ Domain name registration (client provides)\n▸ Custom/stock photography purchase\n▸ Ongoing local SEO (available separately)\n▸ New features beyond scope, quoted separately";
  let optionalSEO: string | undefined = undefined;

  if (data.quotation.terms) {
    try {
      const termsObj = JSON.parse(data.quotation.terms);
      if (termsObj.introMessage) introMessage = termsObj.introMessage;
      if (termsObj.scopeOfWork) scopeOfWork = termsObj.scopeOfWork;
      if (termsObj.complimentary) complimentary = termsObj.complimentary;
      if (termsObj.timelineAndTerms) timelineAndTerms = termsObj.timelineAndTerms;
      if (termsObj.notIncluded) notIncluded = termsObj.notIncluded;
      if (termsObj.optionalSEO) optionalSEO = termsObj.optionalSEO;
    } catch (e) {
      console.error("Failed to parse quotation terms", e);
    }
  }

  return (
    <PrintClient 
      qId={data.quotation.id}
      client={data.client}
      items={items}
      subtotal={data.quotation.subtotal}
      taxTotal={data.quotation.taxTotal}
      total={data.quotation.total}
      introMessage={introMessage}
      scopeOfWork={scopeOfWork}
      complimentary={complimentary}
      timelineAndTerms={timelineAndTerms}
      notIncluded={notIncluded}
      optionalSEO={optionalSEO}
    />
  );
}
