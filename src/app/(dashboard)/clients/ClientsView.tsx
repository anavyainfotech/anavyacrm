"use client";

import { useState, useTransition } from "react";
import { Plus, Search, LayoutGrid, List, Brain, Phone, Mail, Building2, IndianRupee, Star, ChevronDown, Upload, Flame, Sparkles, User, FileSpreadsheet, Download, CheckCircle, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { addClient, updateClientStatus, getClientDetails, bulkImportClientsAction, bulkImportClientsFromObjectsAction } from "./actions";
import ClientDetailView from "./[id]/ClientDetailView";
import { hasPermission } from "@/lib/permissions";

const PIPELINE_STAGES = [
  "New Lead",
  "First Contact",
  "Requirement Discussion",
  "Requirement Received",
  "Demo Shared",
  "Quotation Sent",
  "Follow-up",
  "Negotiation",
  "Agreement",
  "Advance Received",
  "Project Started",
  "Completed",
  "Lost"
];

const STAGE_COLORS: Record<string, string> = {
  "New Lead":               "bg-gray-100 text-gray-700 border-gray-200",
  "First Contact":          "bg-blue-50 text-blue-700 border-blue-200",
  "Requirement Discussion": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Requirement Received":   "bg-purple-50 text-purple-700 border-purple-200",
  "Demo Shared":            "bg-pink-50 text-pink-700 border-pink-200",
  "Quotation Sent":         "bg-yellow-50 text-yellow-800 border-yellow-200",
  "Follow-up":              "bg-orange-50 text-orange-700 border-orange-200",
  "Negotiation":            "bg-amber-50 text-amber-800 border-amber-200",
  "Agreement":              "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Advance Received":       "bg-teal-50 text-teal-700 border-teal-200",
  "Project Started":        "bg-blue-50 text-blue-800 border-blue-200",
  "Completed":              "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Lost":                   "bg-red-50 text-red-700 border-red-200",
};

function AIScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? "text-emerald-600 font-bold" : score >= 40 ? "text-amber-600 font-medium" : "text-gray-400";
  return (
    <span className={`flex items-center gap-1 text-xs ${color}`}>
      <Brain className="w-3.5 h-3.5" /> {score}
    </span>
  );
}

export default function ClientsView({ 
  initialClients, 
  currentUser, 
  users = [] 
}: { 
  initialClients: any[]; 
  currentUser?: any; 
  users?: any[]; 
}) {
  const [view, setView] = useState<'list' | 'board'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [importTab, setImportTab] = useState<'excel' | 'text'>('excel');
  const [bulkText, setBulkText] = useState("");
  const [excelPreview, setExcelPreview] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [detailsData, setDetailsData] = useState<{client: any, activities: any[], users: any[], quotations: any[], agreements?: any[], invoices?: any[]} | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const canCreate = hasPermission(currentUser?.role, currentUser?.permissions, "canCreateLeads");
  const isOwner = currentUser?.role === "owner" || currentUser?.role === "admin";

  const [statusFilter, setStatusFilter] = useState<'qualified' | 'all' | 'new' | 'in_progress' | 'converted' | 'lost'>(
    'all'
  );

  const handleOpenDetails = (clientId: number) => {
    startTransition(async () => {
      const res = await getClientDetails(clientId);
      if (res.success) {
        setDetailsData({ 
          client: res.client, 
          activities: res.activities || [], 
          users: res.users || [], 
          quotations: res.quotations || [],
          agreements: res.agreements || [],
          invoices: res.invoices || []
        });
        setIsDetailsOpen(true);
      } else {
        alert("Error loading details");
      }
    });
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" });

        const formatted = data
          .map((row: any) => ({
            name: row["Name"] || row["Full Name"] || row["name"] || row["Lead Name"] || row["Client Name"] || "",
            phone: row["Phone"] || row["Mobile"] || row["Contact"] || row["phone font"] || row["phone"] || "",
            email: row["Email"] || row["email"] || "",
            company: row["Company"] || row["Company Name"] || row["company"] || "",
            requirement: row["Requirement"] || row["Notes"] || row["requirement"] || "",
            budget: row["Budget"] || row["budget"] ? parseInt(String(row["Budget"] || row["budget"]), 10) : null,
            priority: row["Priority"] || row["priority"] || "Medium",
            source: row["Source"] || row["source"] || "Excel Import",
          }))
          .filter((r: any) => Boolean(r.name));

        setExcelPreview(formatted);
      } catch (err: any) {
        alert("Failed to parse Excel file: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadSampleExcel = () => {
    const sampleData = [
      { Name: "Rahul Sharma", Phone: "+91 9876543210", Email: "rahul@example.com", Company: "Anavya Infotech", Requirement: "E-Commerce Website", Budget: 50000 },
      { Name: "Amit Kumar", Phone: "+91 8765432109", Email: "amit@hospital.com", Company: "City Hospital Inc", Requirement: "CRM Customization", Budget: 120000 },
      { Name: "Priya Singh", Phone: "+91 7654321098", Email: "priya@retail.com", Company: "Retail Stores Ltd", Requirement: "POS Mobile App", Budget: 75000 },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, "Sample_Leads_Template.xlsx");
  };

  const filtered = initialClients.filter(c => {
    const matchesSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned') {
        if (c.assignedTo) return false;
      } else if (c.assignedTo !== parseInt(assigneeFilter, 10)) {
        return false;
      }
    }

    if (statusFilter === 'qualified') {
      return c.status !== 'New Lead' && c.status !== 'First Contact' && c.status !== 'Lost';
    }
    if (statusFilter === 'new') {
      return c.status === 'New Lead' || c.status === 'First Contact';
    }
    if (statusFilter === 'in_progress') {
      return (
        c.status === 'Requirement Discussion' ||
        c.status === 'Requirement Received' ||
        c.status === 'Demo Shared' ||
        c.status === 'Quotation Sent' ||
        c.status === 'Follow-up' ||
        c.status === 'Negotiation' ||
        c.status === 'Agreement'
      );
    }
    if (statusFilter === 'converted') {
      return (
        c.status === 'Advance Received' ||
        c.status === 'Project Started' ||
        c.status === 'Completed'
      );
    }
    if (statusFilter === 'lost') {
      return c.status === 'Lost';
    }

    return true;
  });

  async function handleAddClient(formData: FormData) {
    startTransition(async () => {
      const res = await addClient(formData);
      if (res.success) setIsModalOpen(false);
      else alert("Error: " + res.error);
    });
  }

  async function handleBulkImportSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (importTab === "excel") {
      if (excelPreview.length === 0) {
        alert("Please select a valid Excel or CSV file first.");
        return;
      }
      startTransition(async () => {
        const res = await bulkImportClientsFromObjectsAction(excelPreview);
        if (res.success) {
          setIsBulkModalOpen(false);
          setExcelPreview([]);
          setFileName("");
          alert(`🎉 Successfully imported ${res.count} leads from Excel and auto-distributed them equally across your sales team!`);
        } else {
          alert("Error: " + res.error);
        }
      });
    } else {
      if (!bulkText.trim()) return;

      startTransition(async () => {
        const res = await bulkImportClientsAction(bulkText);
        if (res.success) {
          setIsBulkModalOpen(false);
          setBulkText("");
          alert(`🎉 Successfully imported and auto-assigned ${res.count} leads equally across your sales team!`);
        } else {
          alert("Error: " + res.error);
        }
      });
    }
  }

  async function handleStatusChange(clientId: number, newStatus: string) {
    startTransition(async () => {
      const res = await updateClientStatus(clientId, newStatus);
      if (!res.success) alert("Error: " + res.error);
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Leads & Pipeline Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isOwner ? "Showing Qualified & Hot Deals (Raw leads auto-assigned to Sales Team)" : `${initialClients.length} leads in database`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-gray-100 p-1 rounded-sm border border-gray-200">
            <button onClick={() => setView('list')} className={`p-1.5 rounded-xs text-xs font-medium cursor-pointer ${view === 'list' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500'}`}><List className="w-4 h-4" /></button>
            <button onClick={() => setView('board')} className={`p-1.5 rounded-xs text-xs font-medium cursor-pointer ${view === 'board' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500'}`}><LayoutGrid className="w-4 h-4" /></button>
          </div>

          {canCreate && (
            <>
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="inline-flex items-center justify-center rounded-sm bg-gray-100 border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5 text-blue-600" /> Excel / Bulk Import
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center rounded-sm bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Single Lead
              </button>
            </>
          )}
        </div>
      </div>

      {/* Quick Filter Tabs & Search / Employee Filter */}
      <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white p-2 rounded-sm border border-gray-200">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          {isOwner && (
            <button
              onClick={() => setStatusFilter('qualified')}
              className={`px-3 py-1.5 rounded-sm cursor-pointer transition-colors flex items-center gap-1 ${
                statusFilter === 'qualified'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" /> 🔥 Qualified Deals ({initialClients.filter(c => c.status !== 'New Lead' && c.status !== 'First Contact' && c.status !== 'Lost').length})
            </button>
          )}
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-sm cursor-pointer transition-colors ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({initialClients.length})
          </button>
          <button
            onClick={() => setStatusFilter('new')}
            className={`px-3 py-1.5 rounded-sm cursor-pointer transition-colors ${
              statusFilter === 'new'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📞 Raw Calls ({initialClients.filter(c => c.status === 'New Lead' || c.status === 'First Contact').length})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 rounded-sm cursor-pointer transition-colors ${
              statusFilter === 'in_progress'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ⚡ In Progress ({initialClients.filter(c => ['Requirement Discussion', 'Demo Shared', 'Quotation Sent', 'Follow-up', 'Negotiation'].includes(c.status)).length})
          </button>
          <button
            onClick={() => setStatusFilter('converted')}
            className={`px-3 py-1.5 rounded-sm cursor-pointer transition-colors ${
              statusFilter === 'converted'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            ✅ Converted ({initialClients.filter(c => ['Advance Received', 'Project Started', 'Completed'].includes(c.status)).length})
          </button>
          <button
            onClick={() => setStatusFilter('lost')}
            className={`px-3 py-1.5 rounded-sm cursor-pointer transition-colors ${
              statusFilter === 'lost'
                ? 'bg-gray-700 text-white font-semibold'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            ❌ Lost ({initialClients.filter(c => c.status === 'Lost').length})
          </button>
        </div>

        {/* Filter by Employee & Search Input */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Employee Filter */}
          <select
            value={assigneeFilter}
            onChange={e => setAssigneeFilter(e.target.value)}
            className="w-full sm:w-44 rounded-sm border border-gray-200 py-1.5 px-2 text-xs text-gray-700 bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">👤 All Team Members</option>
            <option value="unassigned">⚠️ Unassigned Only</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>👤 {u.name}</option>
            ))}
          </select>

          {/* Search Input */}
          <div className="w-full sm:w-48">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                type="text"
                className="block w-full rounded-sm border border-gray-200 py-1.5 pl-8 pr-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                placeholder="Search..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-3 pb-6">
        {view === 'list' ? (
          <div className="overflow-hidden rounded-sm border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Lead</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Assigned Rep</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Source</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Budget</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Priority</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">AI Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filtered.map((lead) => {
                  const assignedUser = users.find(u => u.id === lead.assignedTo);
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2">
                        <button onClick={() => handleOpenDetails(lead.id)} className="text-sm font-semibold text-blue-600 hover:underline leading-tight text-left block">{lead.name}</button>
                        {lead.company && <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Building2 className="w-3 h-3 text-gray-400" />{lead.company}</p>}
                        {lead.industry && <p className="text-[11px] text-gray-400">{lead.industry}</p>}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium border ${
                          assignedUser
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}>
                          <User className="w-3 h-3" />
                          {assignedUser ? assignedUser.name : "Unassigned"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {lead.email && <p className="text-xs text-gray-600 flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" />{lead.email}</p>}
                        {lead.phone && <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3 text-gray-400" />{lead.phone}</p>}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">{lead.source || "—"}</td>
                      <td className="px-3 py-2 text-xs font-medium text-gray-900">{lead.budget ? `₹${lead.budget.toLocaleString('en-IN')}` : "—"}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase ${
                          lead.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                          lead.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                          lead.priority === 'Medium' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {lead.priority}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          disabled={isPending}
                          className={`text-xs appearance-none font-medium px-2 py-1 rounded-sm border cursor-pointer focus:outline-none ${STAGE_COLORS[lead.status] || 'bg-gray-100 text-gray-800'}`}
                        >
                          {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <AIScoreBadge score={lead.aiScore || 0} />
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">No leads match the current view.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Kanban Board */
          <div className="flex gap-4 overflow-x-auto pb-4">
            {PIPELINE_STAGES.map(stage => {
              const stageLeads = filtered.filter(l => l.status === stage);
              return (
                <div key={stage} className="flex-shrink-0 w-64">
                  <div className={`flex items-center justify-between mb-3 px-3 py-2 rounded-sm border ${STAGE_COLORS[stage]}`}>
                    <span className="text-xs font-semibold">{stage}</span>
                    <span className="text-xs font-bold">{stageLeads.length}</span>
                  </div>
                  <div className="space-y-3">
                    {stageLeads.map(lead => {
                      const assignedUser = users.find(u => u.id === lead.assignedTo);
                      return (
                        <div key={lead.id} className="bg-white border border-gray-200 rounded-sm p-3 space-y-2">
                          <div className="flex justify-between items-start">
                            <button onClick={() => handleOpenDetails(lead.id)} className="text-sm font-semibold text-blue-600 hover:underline leading-tight block text-left">{lead.name}</button>
                            <AIScoreBadge score={lead.aiScore || 0} />
                          </div>
                          {lead.company && <p className="text-xs text-gray-400 flex items-center gap-1"><Building2 className="w-3 h-3" />{lead.company}</p>}
                          
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100">
                            <span className="text-gray-500 flex items-center gap-1">
                              <User className="w-3 h-3 text-gray-400" /> {assignedUser ? assignedUser.name : "Unassigned"}
                            </span>
                            {lead.budget && <span className="font-semibold text-gray-900">₹{lead.budget.toLocaleString('en-IN')}</span>}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                              disabled={isPending}
                              className={`text-[10px] appearance-none font-medium px-2 py-0.5 rounded-sm border cursor-pointer focus:outline-none ${STAGE_COLORS[lead.status]}`}
                            >
                              {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            {lead.source && <span className="text-[10px] text-gray-400">{lead.source}</span>}
                          </div>
                        </div>
                      );
                    })}
                    {stageLeads.length === 0 && (
                      <div className="border-2 border-dashed border-gray-200 rounded-sm p-4 text-center text-xs text-gray-400">No leads</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Single Add Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-sm bg-white border border-gray-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Add New Single Lead</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-light cursor-pointer">✕</button>
            </div>
            <form action={handleAddClient} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                  <input type="text" name="name" required className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Company</label>
                  <input type="text" name="company" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Acme Corp" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                  <input type="email" name="email" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">WhatsApp</label>
                  <input type="text" name="whatsapp" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="+91 9876543210" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                  <input type="text" name="phone" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Industry</label>
                  <select name="industry" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
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
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Lead Source</label>
                  <select name="source" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                    <option value="">Select Source</option>
                    <option>WhatsApp</option>
                    <option>Email</option>
                    <option>Website</option>
                    <option>Referral</option>
                    <option>Cold Call</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Budget (₹)</label>
                  <input type="number" name="budget" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="50000" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
                  <select name="priority" defaultValue="Medium" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Pipeline Stage</label>
                  <select name="status" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                    {PIPELINE_STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Assign Lead To Employee</label>
                  <select name="assignedTo" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                    <option value="">🤖 Auto Round-Robin (Equal Distribution)</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Requirement</label>
                <textarea name="requirement" rows={2} className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="What does the client need?" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 flex items-center gap-1"><Brain className="w-3 h-3 text-blue-500" /> AI Score auto-calculated on save</p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-sm border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={isPending} className="rounded-sm bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
                    {isPending ? 'Saving...' : 'Save Lead'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel & Bulk Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl rounded-sm bg-white border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" /> Bulk Import & Auto-Distribute Leads
              </h2>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-light cursor-pointer">✕</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Import Mode Tabs */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setImportTab("excel")}
                    className={`px-3 py-1.5 rounded-sm text-xs font-semibold cursor-pointer border ${
                      importTab === "excel"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    📊 Upload Excel File (.xlsx, .csv)
                  </button>
                  <button
                    onClick={() => setImportTab("text")}
                    className={`px-3 py-1.5 rounded-sm text-xs font-semibold cursor-pointer border ${
                      importTab === "text"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    ✍️ Copy-Paste Text List
                  </button>
                </div>

                {importTab === "excel" && (
                  <button
                    type="button"
                    onClick={downloadSampleExcel}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Sample Excel Template
                  </button>
                )}
              </div>

              <form onSubmit={handleBulkImportSubmit} className="space-y-4">
                {importTab === "excel" ? (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-sm p-6 text-center bg-gray-50/50 hover:bg-blue-50/30 transition-colors">
                      <FileSpreadsheet className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        Upload Excel (.xlsx, .xls) or CSV (.csv) File
                      </p>
                      <p className="text-[11px] text-gray-500 mb-3">
                        Columns supported: <code>Name</code>, <code>Phone</code>, <code>Email</code>, <code>Company</code>, <code>Requirement</code>, <code>Budget</code>
                      </p>
                      <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleExcelFileChange}
                        className="text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                      />
                    </div>

                    {/* Preview Table */}
                    {excelPreview.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle className="w-4 h-4" /> {excelPreview.length} leads detected in {fileName}
                          </span>
                          <span className="text-gray-500 font-normal">Will be auto-distributed 1-by-1 equally</span>
                        </div>
                        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-sm bg-white">
                          <table className="min-w-full divide-y divide-gray-200 text-xs">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">Name</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">Phone</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">Email</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">Company</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {excelPreview.slice(0, 10).map((row, idx) => (
                                <tr key={idx}>
                                  <td className="px-3 py-1.5 font-medium text-gray-900">{row.name}</td>
                                  <td className="px-3 py-1.5 text-gray-600">{row.phone || "—"}</td>
                                  <td className="px-3 py-1.5 text-gray-600">{row.email || "—"}</td>
                                  <td className="px-3 py-1.5 text-gray-600">{row.company || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-3 rounded-sm border border-blue-100 text-xs text-blue-800 leading-relaxed">
                      <p className="font-semibold flex items-center gap-1 mb-1">
                        <Sparkles className="w-4 h-4 text-blue-600" /> Copy & Paste Text List
                      </p>
                      <p>
                        Paste raw text list (1 lead per line). Format: <code>Name, Phone, Email, Company</code>.
                      </p>
                    </div>

                    <textarea
                      rows={6}
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      placeholder={`Rahul Sharma, 9876543210, rahul@example.com, ABC Corp\nAmit Kumar, 8765432109, amit@example.com, Hospital Inc\nNeha Singh, 7654321098, neha@example.com, Retail Store`}
                      className="block w-full rounded-sm border border-gray-200 p-3 text-xs font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    {importTab === "excel" ? `${excelPreview.length} leads ready` : `${bulkText.split('\n').filter(Boolean).length} entries detected`}
                  </span>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsBulkModalOpen(false)}
                      className="rounded-sm border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending || (importTab === "excel" ? excelPreview.length === 0 : !bulkText.trim())}
                      className="rounded-sm bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      {isPending ? "Importing & Auto-Distributing..." : "Import & Distribute Equally"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsOpen && detailsData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-6xl rounded-sm bg-white overflow-hidden max-h-[90vh] flex flex-col p-4 relative shadow-2xl border border-gray-200">
            <ClientDetailView 
              client={detailsData.client} 
              activities={detailsData.activities} 
              users={detailsData.users} 
              quotations={detailsData.quotations}
              agreements={detailsData.agreements}
              invoices={detailsData.invoices}
              currentUserRole={currentUser?.role}
              onClose={() => setIsDetailsOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
