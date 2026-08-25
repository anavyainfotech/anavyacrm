"use client";

import { useState } from "react";
import {
  Building2, CreditCard, Shield, User, Globe, FileText, CheckCircle2, Save, MapPin, Phone
} from "lucide-react";

export default function SettingsPage() {
  const [orgName, setOrgName] = useState("Anavya Infotech");
  const [founderName, setFounderName] = useState("Akash Kumar");
  const [phone, setPhone] = useState("+91 6201231875");
  const [email, setEmail] = useState("admin@anavyainfotech.com");
  const [gstin, setGstin] = useState("06PBVPS6923K1ZE");
  const [pan, setPan] = useState("PBVPS6923K");
  
  const [bankName, setBankName] = useState("State Bank of India (SBI)");
  const [accountNumber, setAccountNumber] = useState("43997234173");
  const [ifscCode, setIfscCode] = useState("SBIN0003101");
  const [upiId, setUpiId] = useState("6201231875@pthdfc");
  const [jurisdiction, setJurisdiction] = useState("District Court, Faridabad, Haryana");

  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="w-full space-y-6 pb-12 font-sans max-w-6xl">
      {/* Brand & Page Header */}
      <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Anavya Infotech Logo" className="w-16 h-16 object-contain" />
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">WORKSPACE & BUSINESS SETTINGS</h1>
            <p className="text-xs text-gray-500 mt-1">Manage Company Profile, Financial Billing Accounts, GSTIN & Default Contract Terms</p>
          </div>
        </div>

        {isSaved && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settings saved successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Profile & Legal Identifiers */}
          <div className="bg-white p-5 rounded-sm border border-gray-200 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900 text-sm">Company Legal & Contact Profile</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full rounded-sm border border-gray-200 p-2 font-bold text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Founder & Owner</label>
                  <input
                    type="text"
                    required
                    value={founderName}
                    onChange={(e) => setFounderName(e.target.value)}
                    className="w-full rounded-sm border border-gray-200 p-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-sm border border-gray-200 p-2 font-mono text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Official Business Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-sm border border-gray-200 p-2 font-mono text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Official GSTIN</label>
                  <input
                    type="text"
                    required
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="w-full rounded-sm border border-gray-200 p-2 font-mono font-bold text-blue-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    required
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                    className="w-full rounded-sm border border-gray-200 p-2 font-mono font-bold text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Court Jurisdiction</label>
                <input
                  type="text"
                  required
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full rounded-sm border border-gray-200 p-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Official Bank Account & UPI Payment QR Settings */}
          <div className="bg-white p-5 rounded-sm border border-gray-200 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900 text-sm">Official Bank Account & UPI Details</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-sm border border-gray-200 p-2 font-bold text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full rounded-sm border border-gray-200 p-2 font-mono font-bold text-blue-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    className="w-full rounded-sm border border-gray-200 p-2 font-mono font-bold text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Official UPI ID (Scan to Pay)</label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full rounded-sm border border-gray-200 p-2 font-mono font-bold text-emerald-700 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* QR Code Live Preview Box */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-sm flex items-center gap-4">
                <div className="p-1 bg-white border border-gray-300 rounded text-center shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=${upiId}&pn=Anavya%20Infotech`}
                    alt="Live UPI QR Code"
                    className="w-20 h-20 object-contain"
                  />
                </div>
                <div>
                  <span className="font-bold text-gray-900 block text-xs">Live Invoice Payment QR Preview</span>
                  <p className="text-[11px] text-gray-500 mt-1">This QR Code is dynamically rendered on all client GST Tax Invoices for instant UPI payments.</p>
                  <span className="font-mono text-[10px] text-emerald-700 font-bold mt-1 block">{upiId}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-sm transition-colors cursor-pointer shadow-md text-xs"
          >
            <Save className="w-4 h-4" /> Save Workspace Settings
          </button>
        </div>
      </form>
    </div>
  );
}
