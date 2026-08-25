"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, FileSignature, Download } from "lucide-react";
import { saveAgreement, deleteAgreement } from "../actions";

export default function AgreementTab({ client, existingAgreements }: { client: any, existingAgreements: any[] }) {
  const [isPending, startTransition] = useTransition();

  // Legal Content State
  const [partyDetails, setPartyDetails] = useState(`This is a simple agreement between Anavya Infotech (Us) and ${client.name || client.company || "Client"} (You).`);
  
  const [scopeOfWork, setScopeOfWork] = useState(
    "1. We will do the work as discussed and written in the quotation.\n" +
    "2. You will provide us with the required logo, photos, and information on time so we can finish the work."
  );
  
  const [timeline, setTimeline] = useState(
    "1. We will start the work as soon as we receive the advance payment.\n" +
    "2. The project will take 2 to 4 weeks to complete, provided we get your feedback quickly.\n" +
    "3. If you take too long to send us details or feedback, the final project delivery will also be delayed."
  );
  
  const [financialTerms, setFinancialTerms] = useState(
    "1. The total price and payment steps will be exactly as shown in the quotation.\n" +
    "2. Once we start working, advance payments cannot be refunded.\n" +
    "3. If you ask for extra features that were not discussed initially, we will charge an extra fee."
  );
  
  const [intellectualProperty, setIntellectualProperty] = useState(
    "1. After you pay the full 100% payment, the website and its designs belong completely to you.\n" +
    "2. We have the right to show this website in our portfolio to tell others that we made it.\n" +
    "3. We use some common codes and plugins to build websites; we still own those common tools, but you can use them freely."
  );

  const [jurisdiction, setJurisdiction] = useState(
    "In case of any legal disagreement, it will be solved under the laws of India, in the courts of Faridabad, Haryana."
  );

  const [showSettings, setShowSettings] = useState(false);

  const generatePDF = (id: string | number) => {
    window.open(`/agreements/print/${id}`, "_blank");
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this agreement? This action cannot be undone.")) {
      startTransition(async () => {
        const res = await deleteAgreement(id, client.id);
        if (res.success) {
          alert("Agreement deleted successfully!");
        } else {
          alert("Failed to delete agreement: " + res.error);
        }
      });
    }
  };

  const handleSaveAgreement = () => {
    startTransition(async () => {
      const contentObj = {
        partyDetails,
        scopeOfWork: scopeOfWork.split('\n').filter(s => s.trim() !== ""),
        timeline: timeline.split('\n').filter(s => s.trim() !== ""),
        financialTerms: financialTerms.split('\n').filter(s => s.trim() !== ""),
        intellectualProperty: intellectualProperty.split('\n').filter(s => s.trim() !== ""),
        jurisdiction
      };
      
      const res = await saveAgreement(client.id, JSON.stringify(contentObj));
      if (res.success) {
        alert("Agreement saved successfully!");
        generatePDF(res.id!);
      } else {
        alert("Failed to save agreement: " + (res.error || "Unknown"));
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-md p-6">
        <div className="mb-6 border-b pb-4">
          <h3 className="font-semibold text-lg text-gray-900">Generate Client Agreement</h3>
          <p className="text-sm text-gray-500 mt-1">Review and generate a legally binding Master Services Agreement (MSA).</p>
        </div>

        <div className="space-y-6 bg-white">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Parties & Effective Date</label>
            <textarea value={partyDetails} onChange={(e) => setPartyDetails(e.target.value)} rows={2} className="w-full text-sm p-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Scope & Responsibilities (One item per line)</label>
            <textarea value={scopeOfWork} onChange={(e) => setScopeOfWork(e.target.value)} rows={3} className="w-full text-sm p-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Timeline & Delays (One item per line)</label>
            <textarea value={timeline} onChange={(e) => setTimeline(e.target.value)} rows={3} className="w-full text-sm p-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Financial Terms & Scope Creep (One item per line)</label>
            <textarea value={financialTerms} onChange={(e) => setFinancialTerms(e.target.value)} rows={3} className="w-full text-sm p-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Intellectual Property Rights (One item per line)</label>
            <textarea value={intellectualProperty} onChange={(e) => setIntellectualProperty(e.target.value)} rows={3} className="w-full text-sm p-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Jurisdiction & Governing Law</label>
            <textarea value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} rows={2} className="w-full text-sm p-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSaveAgreement}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <FileSignature className="w-4 h-4" /> Save & Generate Agreement PDF
          </button>
        </div>
      </div>

      {existingAgreements.length > 0 && (
        <div className="bg-white rounded-md p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4 border-b pb-4">Past Agreements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {existingAgreements.map((a: any) => (
              <div key={a.id} className="border border-gray-200 rounded-md p-4 flex justify-between items-center hover:shadow-sm transition-shadow bg-gray-50">
                <div>
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <FileSignature className="w-4 h-4 text-indigo-500" /> 
                    Agreement #{a.id}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">Generated: {new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-2">{a.status}</p>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => generatePDF(a.id)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> PDF
                    </button>
                    <button 
                      onClick={() => handleDelete(a.id)}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
