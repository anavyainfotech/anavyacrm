"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  Building2, Mail, Phone, IndianRupee, Brain,
  ArrowLeft, Send, CheckCircle2, AlertCircle, Clock, FileText, FileSignature, PhoneCall, MessageSquare, ExternalLink, CreditCard, Pencil
} from "lucide-react";
import Link from "next/link";
import { addLeadActivity, assignLead, updateClientStatus, getClientAgreements, updateClientDetailsAction } from "../actions";
import QuotationTab from "./QuotationTab";
import AgreementTab from "./AgreementTab";

const PIPELINE_STAGES = [
  "New Lead", "First Contact", "Requirement Discussion", "Requirement Received",
  "Demo Shared", "Quotation Sent", "Follow-up", "Negotiation", "Agreement",
  "Advance Received", "Project Started", "Completed", "Lost"
];

function AIScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? "text-emerald-600" : score >= 40 ? "text-amber-600" : "text-red-500";
  return (
    <span className={`flex items-center gap-1 text-sm font-bold ${color}`}>
      <Brain className="w-4 h-4" /> {score} AI Score
    </span>
  );
}

export default function ClientDetailView({ client, activities, users, quotations = [], agreements: propAgreements = [], invoices: propInvoices = [], onClose, currentUserRole = "owner" }: {
  client: any,
  activities: any[],
  users: any[],
  quotations?: any[],
  agreements?: any[],
  invoices?: any[],
  onClose?: () => void,
  currentUserRole?: string
}) {
  const [clientData, setClientData] = useState<any>(client);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [activityType, setActivityType] = useState<"Call" | "Note" | "Follow-up">("Call");
  const [activitiesList, setActivitiesList] = useState<any[]>(activities);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<'details' | 'quotations' | 'agreements'>('details');
  const [agreements, setAgreements] = useState<any[]>(propAgreements);
  const searchParams = useSearchParams();

  const isManagerOrOwner = currentUserRole === "owner" || currentUserRole === "admin" || currentUserRole === "manager";

  const handleUpdateClientSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateClientDetailsAction(clientData.id, formData);
      if (res.success) {
        setIsEditModalOpen(false);
        window.location.reload();
      } else {
        alert("Failed to update client details: " + res.error);
      }
    });
  };

  useEffect(() => {
    setActivitiesList(activities);
  }, [activities]);

  const fetchAgreements = async () => {
    if (propAgreements.length > 0) return;
    const res = await getClientAgreements(client.id);
    if (res.success && res.agreements) {
      setAgreements(res.agreements);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, [client.id]);

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    const content = noteContent.trim();
    const type = activityType;
    startTransition(async () => {
      const res = await addLeadActivity(client.id, content, type);
      if (res.success) {
        setActivitiesList((prev) => [
          {
            id: Date.now(),
            type: type,
            content: content,
            createdAt: new Date().toISOString(),
            user: { id: 0, name: "You" }
          },
          ...prev
        ]);
        setNoteContent("");
      } else {
        alert("Failed to add log: " + (res.error || "Unknown error"));
      }
    });
  };

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const res = await updateClientStatus(client.id, newStatus);
      if (res.success) {
        await addLeadActivity(client.id, `Status changed to ${newStatus}`, "Status Change");
        setActivitiesList((prev) => [
          {
            id: Date.now(),
            type: "Status Change",
            content: `Status changed to ${newStatus}`,
            createdAt: new Date().toISOString(),
            user: { id: 0, name: "You" }
          },
          ...prev
        ]);
      } else {
        alert("Failed to update status: " + (res.error || "Unknown error"));
      }
    });
  };

  const handleAssignChange = (userId: string) => {
    startTransition(async () => {
      const parsedId = userId ? parseInt(userId, 10) : null;
      const res = await assignLead(client.id, parsedId);
      if (res.success) {
        const userName = users.find(u => u.id === parsedId)?.name || "Unassigned";
        await addLeadActivity(client.id, `Assigned to ${userName}`, "Assignment");
        setActivitiesList((prev) => [
          {
            id: Date.now(),
            type: "Assignment",
            content: `Assigned to ${userName}`,
            createdAt: new Date().toISOString(),
            user: { id: 0, name: "You" }
          },
          ...prev
        ]);
      }
    });
  };

  const cleanPhone = (client.whatsapp || client.phone || "").replace(/[^0-9]/g, "");
  const latestQuotation = quotations && quotations.length > 0 ? quotations[0] : null;
  const latestAgreement = (agreements && agreements.length > 0 ? agreements[0] : null) || (propAgreements && propAgreements.length > 0 ? propAgreements[0] : null);
  const latestInvoice = propInvoices && propInvoices.length > 0 ? propInvoices[0] : null;

  return (
    <div className="flex flex-col h-full max-h-[85vh] space-y-3 overflow-hidden">
      {/* Header Bar */}
      <div className="shrink-0 bg-white pb-2 border-b border-gray-200 space-y-2">
        <div className="flex items-center justify-between bg-white p-2.5 rounded-sm border border-gray-200">
          <div className="flex items-center gap-3">
            {onClose ? (
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <Link href="/clients" className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            )}
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight flex items-center gap-2">
                {client.name}
                {client.company && <span className="text-xs text-gray-500 font-normal font-sans">({client.company})</span>}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={client.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isPending}
              className="rounded-sm border border-gray-200 py-1 px-2.5 text-xs font-semibold focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
            >
              {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {onClose && (
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-base font-light px-2 cursor-pointer">✕</button>
            )}
          </div>
        </div>

        {/* Quick Status & WhatsApp Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2 rounded-sm bg-blue-50/70 border border-blue-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">Pipeline Status:</span>
            <span className="text-gray-600"><strong className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded-xs">{client.status}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {cleanPhone && (
              <>
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center gap-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold px-2.5 py-1 rounded-sm text-[11px] transition-colors"
                >
                  <PhoneCall className="w-3 h-3 text-blue-600" /> Call
                </a>

                <a
                  href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(`Hello ${client.name}, Akash Kumar from Anavya Infotech here regarding your ${client.requirement || 'project'} inquiry.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-sm text-[11px] transition-colors shadow-2xs"
                >
                  <MessageSquare className="w-3 h-3" /> WhatsApp Chat
                </a>

                <a
                  href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(`Hello ${client.name}, here are the payment details for Anavya Infotech:\nBank: State Bank of India (SBI)\nA/C: 43997234173\nIFSC: SBIN0003101\nUPI: 6201231875@pthdfc`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold px-2.5 py-1 rounded-sm text-[11px] transition-colors"
                >
                  <CreditCard className="w-3 h-3 text-emerald-600" /> Send Bank/UPI WA
                </a>
              </>
            )}

            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/clients/${client.id}`);
                alert("🔗 Client Project Tracker Link copied to clipboard!");
              }}
              className="inline-flex items-center gap-1 bg-gray-900 hover:bg-gray-800 text-white font-bold px-2.5 py-1 rounded-sm text-[11px] transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" /> Copy Client Portal Link
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
        {/* Left Col - Lead Details */}
        <div className="lg:col-span-1 bg-white p-4 rounded-sm border border-gray-200 space-y-3 overflow-y-auto max-h-[500px]">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-xs uppercase tracking-wider">Lead Information</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100 cursor-pointer"
                title="Edit Client Information & Email"
              >
                <Pencil className="w-3 h-3 text-blue-600" /> Edit Details
              </button>
            </div>
            <AIScoreBadge score={clientData.aiScore || 0} />
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[11px] text-gray-500 block mb-1 font-semibold">Assigned Sales Executive</span>
              <select
                value={client.assignedTo || ""}
                onChange={(e) => handleAssignChange(e.target.value)}
                disabled={isPending}
                className="w-full text-xs rounded-sm border border-gray-200 p-1.5 bg-white font-medium"
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Document Status Indicators (Quotation, Agreement, and Invoice Status) */}
            <div className="bg-gray-50 p-2.5 rounded-sm border border-gray-200 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider block">Commercial Document Status</span>
              
              {/* Proposal / Quotation Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-1 font-medium">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Proposal / Quote:
                </span>
                {latestQuotation ? (
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-[11px]">
                    {latestQuotation.status} (₹{latestQuotation.total?.toLocaleString('en-IN') || 0})
                  </span>
                ) : (
                  <span className="text-gray-400 font-medium text-[11px]">Not Sent</span>
                )}
              </div>

              {/* Agreement Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-1 font-medium">
                  <FileSignature className="w-3.5 h-3.5 text-emerald-600" /> Agreement:
                </span>
                {latestAgreement ? (
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[11px]">
                    {latestAgreement.status || "Signed"}
                  </span>
                ) : (
                  <span className="text-gray-400 font-medium text-[11px]">Not Sent</span>
                )}
              </div>

              {/* Invoice & Billing Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-1 font-medium">
                  <CreditCard className="w-3.5 h-3.5 text-amber-600" /> GST Tax Invoice:
                </span>
                {latestInvoice ? (
                  <span className={`font-bold px-2 py-0.5 rounded border text-[11px] ${
                    latestInvoice.status === 'Paid' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {latestInvoice.status} (₹{latestInvoice.total?.toLocaleString('en-IN')})
                  </span>
                ) : (
                  <span className="text-gray-400 font-medium text-[11px]">Not Invoiced</span>
                )}
              </div>
            </div>

            {/* Direct Contact Action Buttons */}
            {(client.phone || client.whatsapp) && (
              <div className="bg-blue-50/50 p-2.5 rounded-sm border border-blue-100 space-y-1.5">
                <span className="text-[11px] font-semibold text-blue-900 block">Quick Contact Actions</span>
                <div className="flex flex-wrap gap-2">
                  {client.phone && (
                    <a
                      href={`tel:${client.phone}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-white px-2.5 py-1 rounded-sm border border-blue-200 hover:bg-blue-50 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-blue-600" /> Call {client.phone}
                    </a>
                  )}
                  {cleanPhone && (
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-white px-2.5 py-1 rounded-sm border border-emerald-200 hover:bg-emerald-50 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2 text-xs">
              {client.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-3.5 h-3.5 text-gray-400" /> {client.email}
                </div>
              )}
              {client.budget && (
                <div className="flex items-center gap-2 text-gray-600 font-semibold">
                  <IndianRupee className="w-3.5 h-3.5 text-gray-400" /> ₹{client.budget.toLocaleString('en-IN')}
                </div>
              )}
              {client.source && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-gray-400 font-medium">Source:</span>
                  <span className="font-semibold text-gray-700">{client.source}</span>
                </div>
              )}
            </div>

            {client.requirement && (
              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-[11px] font-semibold text-gray-900 mb-1">Requirements & Notes</h4>
                <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded-sm border border-gray-100 leading-relaxed">
                  {client.requirement}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col - Activity & Call Timeline */}
        <div className="lg:col-span-2 bg-white rounded-sm border border-gray-200 flex flex-col overflow-hidden max-h-[500px]">
          <div className="p-3 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Call Log & Activity Timeline
            </h3>
            <span className="text-[11px] text-gray-500 font-medium">{activitiesList.length} entries</span>
          </div>

          {/* Activities List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
            {activitiesList.length === 0 ? (
              <div className="text-center text-gray-400 text-xs py-8">
                No call logs or notes added yet. Type your summary below and click Save Log.
              </div>
            ) : (
              activitiesList.map(act => (
                <div key={act.id} className="flex gap-2.5">
                  <div className="mt-0.5 flex-shrink-0">
                    {act.type === 'Call' && (
                      <div className="w-6 h-6 rounded-sm bg-blue-100 flex items-center justify-center">
                        <PhoneCall className="w-3 h-3 text-blue-600" />
                      </div>
                    )}
                    {act.type === 'Note' && (
                      <div className="w-6 h-6 rounded-sm bg-gray-100 flex items-center justify-center">
                        <MessageSquare className="w-3 h-3 text-gray-600" />
                      </div>
                    )}
                    {act.type === 'Follow-up' && (
                      <div className="w-6 h-6 rounded-sm bg-amber-100 flex items-center justify-center">
                        <Clock className="w-3 h-3 text-amber-600" />
                      </div>
                    )}
                    {act.type === 'Status Change' && (
                      <div className="w-6 h-6 rounded-sm bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      </div>
                    )}
                    {act.type === 'Assignment' && (
                      <div className="w-6 h-6 rounded-sm bg-purple-100 flex items-center justify-center">
                        <AlertCircle className="w-3 h-3 text-purple-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 bg-gray-50/70 p-2.5 rounded-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="text-xs font-bold text-gray-900">
                        {act.user?.name || "System"} <span className="text-[10px] font-normal text-gray-500">({act.type})</span>
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">{format(new Date(act.createdAt), "MMM d, h:mm a")}</span>
                    </div>
                    <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">{act.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Call Update Input Form (Fixed at bottom) */}
          <div className="p-3 border-t border-gray-200 bg-gray-50/70 space-y-2 shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <span>Log Type:</span>
              <button
                type="button"
                onClick={() => setActivityType("Call")}
                className={`px-2.5 py-0.5 rounded-sm text-xs font-medium cursor-pointer border ${
                  activityType === "Call"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                Call Log
              </button>
              <button
                type="button"
                onClick={() => setActivityType("Note")}
                className={`px-2.5 py-0.5 rounded-sm text-xs font-medium cursor-pointer border ${
                  activityType === "Note"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                Note
              </button>
              <button
                type="button"
                onClick={() => setActivityType("Follow-up")}
                className={`px-2.5 py-0.5 rounded-sm text-xs font-medium cursor-pointer border ${
                  activityType === "Follow-up"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                Follow-up
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                placeholder={
                  activityType === "Call"
                    ? "Type call summary, client feedback, or discussion outcome..."
                    : "Type summary or follow-up note..."
                }
                className="flex-1 text-xs rounded-sm border border-gray-200 p-2 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={isPending}
              />
              <button
                onClick={handleAddNote}
                disabled={isPending || !noteContent.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-sm text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" /> Save Log
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT CLIENT DETAILS MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-sm bg-white border border-gray-200 overflow-y-auto max-h-[90vh] shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-blue-50/50">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-600" /> Edit Client Information ({clientData.name})
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-light cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleUpdateClientSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input type="text" name="name" defaultValue={clientData.name} required className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Company Name</label>
                  <input type="text" name="company" defaultValue={clientData.company || ""} className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input type="email" name="email" defaultValue={clientData.email || ""} className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none font-medium" placeholder="client@company.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">WhatsApp Number</label>
                  <input type="text" name="whatsapp" defaultValue={clientData.whatsapp || ""} className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none" placeholder="+91 9876543210" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input type="text" name="phone" defaultValue={clientData.phone || ""} className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Industry</label>
                  <select name="industry" defaultValue={clientData.industry || ""} className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none bg-white">
                    <option value="">Select Industry</option>
                    <option>Healthcare</option>
                    <option>Education</option>
                    <option>Retail & E-Commerce</option>
                    <option>Real Estate</option>
                    <option>IT & Technology</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Lead Source</label>
                  <select name="source" defaultValue={clientData.source || ""} className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none bg-white">
                    <option value="">Select Source</option>
                    <option>WhatsApp</option>
                    <option>Email</option>
                    <option>Website</option>
                    <option>Referral</option>
                    <option>Cold Call</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Budget (₹)</label>
                  <input type="number" name="budget" defaultValue={clientData.budget || ""} className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                  <select name="priority" defaultValue={clientData.priority || "Medium"} className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none bg-white">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Pipeline Stage</label>
                  <select name="status" defaultValue={clientData.status || "New Lead"} className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none bg-white">
                    {PIPELINE_STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Executive</label>
                  <select name="assignedTo" defaultValue={clientData.assignedTo || ""} className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none bg-white">
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Requirement & Notes</label>
                <textarea name="requirement" defaultValue={clientData.requirement || ""} rows={3} className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="rounded-sm border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="rounded-sm bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
                  {isPending ? 'Updating...' : 'Save & Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
