"use client";

import { useState, useTransition } from "react";
import {
  LifeBuoy, Plus, CheckCircle2, Clock, AlertCircle, MessageSquare, Send,
  User, ShieldCheck, Filter, Search, ChevronRight, X
} from "lucide-react";
import { createSupportTicketAction, updateTicketStatusAction } from "@/features/support/actions";

interface SupportViewProps {
  initialTickets: any[];
  currentUserRole: string;
}

export default function SupportView({ initialTickets = [], currentUserRole = "owner" }: SupportViewProps) {
  const [tickets, setTickets] = useState<any[]>(initialTickets);
  const [isPending, startTransition] = useTransition();

  // Filter & Search State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Raise Ticket Modal State
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);

  // Manage / Resolve Ticket Modal State (Owner Action)
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState("In Progress");
  const [replyText, setReplyText] = useState("");

  const isOwner = currentUserRole === "owner" || currentUserRole === "admin";

  // Filtered Tickets List
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketCode.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.userName.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || t.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === "all" || t.priority.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // KPI Metrics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === "Open").length;
  const inProgressTickets = tickets.filter((t) => t.status === "In Progress").length;
  const resolvedTickets = tickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length;

  // Handle Create Ticket Submit
  const handleCreateTicketSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createSupportTicketAction(formData);
      if (res.success) {
        setIsRaiseModalOpen(false);
        window.location.reload();
      } else {
        alert("Failed to raise ticket: " + res.error);
      }
    });
  };

  // Handle Founder / Owner Status Update & Reply
  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    startTransition(async () => {
      const res = await updateTicketStatusAction(selectedTicket.id, newStatus, replyText);
      if (res.success) {
        setSelectedTicket(null);
        window.location.reload();
      } else {
        alert("Failed to update ticket: " + res.error);
      }
    });
  };

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
      {/* Brand Header */}
      <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Anavya Infotech Logo" className="w-14 h-14 object-contain" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">EMPLOYEE & TEAM SUPPORT DESK</h1>
              <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                {isOwner ? "👑 Founder Management Dashboard" : "👥 Employee Portal"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {isOwner
                ? "Manage and resolve all support tickets raised by sales representatives, interns, and team members."
                : "Raise a support ticket for technical assistance, lead issues, or system queries."}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsRaiseModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-sm text-xs transition-colors cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" /> Raise Support Ticket
        </button>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Total Tickets</span>
          <p className="text-2xl font-extrabold text-gray-900 mt-1 font-mono">{totalTickets}</p>
          <span className="text-[10px] text-gray-400 font-medium">All Employee Requests</span>
        </div>

        <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">Open Pending</span>
          <p className="text-2xl font-extrabold text-amber-700 mt-1 font-mono">{openTickets}</p>
          <span className="text-[10px] text-amber-600 font-medium">Needs Attention</span>
        </div>

        <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">In Progress</span>
          <p className="text-2xl font-extrabold text-blue-700 mt-1 font-mono">{inProgressTickets}</p>
          <span className="text-[10px] text-blue-600 font-medium">Being Resolved</span>
        </div>

        <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">Resolved</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1 font-mono">{resolvedTickets}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Completed Tickets</span>
        </div>
      </div>

      {/* Tickets Table Workspace */}
      <div className="bg-white rounded-sm border border-gray-200 shadow-2xs space-y-4 p-5">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket code, subject, employee..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-gray-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-sm p-1 text-xs bg-white focus:border-blue-500 focus:outline-none font-medium"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-gray-500 font-medium">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border border-gray-200 rounded-sm p-1 text-xs bg-white focus:border-blue-500 focus:outline-none font-medium"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700 border-collapse">
            <thead className="bg-gray-100 border-y border-gray-200 font-bold text-gray-900 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Ticket Code</th>
                <th className="py-3 px-4">Raised By</th>
                <th className="py-3 px-4">Subject & Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    No support tickets found matching your search.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => {
                  const isOpen = t.status === "Open";
                  const isInProgress = t.status === "In Progress";
                  const isResolved = t.status === "Resolved" || t.status === "Closed";

                  return (
                    <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        {t.ticketCode}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{t.userName}</p>
                        <span className="text-[10px] font-semibold text-gray-500 uppercase block">
                          {t.userRole}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-gray-900">{t.subject}</p>
                        <p className="text-gray-500 line-clamp-1 mt-0.5">{t.description}</p>
                        {t.reply && (
                          <div className="mt-1.5 p-1.5 bg-blue-50 border border-blue-100 rounded text-[11px] text-blue-900 font-medium">
                            <strong>Founder Solution:</strong> {t.reply}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-gray-700">
                        {t.category}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold text-[10px] uppercase px-2 py-0.5 rounded border ${
                            t.priority === "Urgent" || t.priority === "High"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-gray-500">
                        {new Date(t.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded border ${
                            isOpen
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : isInProgress
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedTicket(t);
                            setNewStatus(t.status);
                            setReplyText(t.reply || "");
                          }}
                          className="inline-flex items-center gap-1 bg-gray-900 hover:bg-gray-800 text-white font-bold px-2.5 py-1 rounded-sm text-[11px] transition-colors cursor-pointer"
                        >
                          {isOwner ? "Manage / Resolve" : "View Ticket"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raise Support Ticket Modal */}
      {isRaiseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-sm bg-white overflow-hidden p-6 relative shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-blue-600" /> Raise Internal Support Ticket
              </h3>
              <button onClick={() => setIsRaiseModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Subject / Technical Issue Title</label>
                <input
                  name="subject"
                  type="text"
                  required
                  placeholder="e.g. Need assistance with lead assignment or CRM access"
                  className="w-full rounded-sm border border-gray-200 p-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Issue Category</label>
                  <select
                    name="category"
                    className="w-full rounded-sm border border-gray-200 p-2 bg-white focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="Technical Support">Technical Support</option>
                    <option value="Lead Issue">Lead Issue</option>
                    <option value="Billing Query">Billing Query</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="General">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Priority Level</label>
                  <select
                    name="priority"
                    className="w-full rounded-sm border border-gray-200 p-2 bg-white focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Detailed Explanation</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Provide complete context or steps to reproduce the issue..."
                  className="w-full rounded-sm border border-gray-200 p-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsRaiseModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-sm transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isPending ? "Submitting..." : "Submit Ticket to Founder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage / Resolve Ticket Modal (Founder Action) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-sm bg-white overflow-hidden p-6 relative shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">Ticket: {selectedTicket.ticketCode}</h3>
                <p className="text-xs text-gray-500">Raised by: {selectedTicket.userName} ({selectedTicket.userRole})</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-1">
                <span className="font-bold text-gray-900 block">{selectedTicket.subject}</span>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {isOwner ? (
                <form onSubmit={handleUpdateStatusSubmit} className="space-y-3 pt-2">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Update Ticket Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full rounded-sm border border-gray-200 p-2 bg-white font-bold text-gray-900 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Open">Open (Pending)</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Founder Solution / Reply Back to Employee</label>
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type the resolution, instruction, or reply for the employee..."
                      className="w-full rounded-sm border border-gray-200 p-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(null)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-sm cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-sm transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isPending ? "Updating..." : "Save Status & Reply"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <span className="font-bold text-blue-900 block">Current Status: {selectedTicket.status}</span>
                    {selectedTicket.reply ? (
                      <p className="text-gray-800 mt-1 font-medium">Founder Reply: {selectedTicket.reply}</p>
                    ) : (
                      <p className="text-gray-500 mt-1 italic">Pending response from Founder / Owner.</p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="px-4 py-2 bg-gray-900 text-white font-bold rounded-sm cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
