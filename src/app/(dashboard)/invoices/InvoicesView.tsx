"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { 
  CreditCard, Plus, FileText, IndianRupee, CheckCircle2, Clock, 
  AlertCircle, Search, Printer, Trash2, ArrowRight, DollarSign, Wallet, Check, Building2, FileSignature, Mail
} from "lucide-react";
import { 
  createInvoiceAction, 
  recordInvoicePaymentAction, 
  updateInvoiceStatusAction, 
  deleteInvoiceAction,
  sendInvoiceEmailAction
} from "@/features/invoices/actions";
import { saveQuotation, saveAgreement } from "@/app/(dashboard)/clients/actions";

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  clientName?: string | null;
  clientCompany?: string | null;
  clientPhone?: string | null;
  clientEmail?: string | null;
  status: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  paymentMethod?: string | null;
  items: string;
  notes?: string | null;
  terms?: string | null;
  createdByName?: string | null;
  createdAt: string | Date;
}

export default function InvoicesView({
  initialInvoices = [],
  clientsList = [],
}: {
  initialInvoices: Invoice[];
  clientsList: any[];
}) {
  const [invoicesList, setInvoicesList] = useState<Invoice[]>(initialInvoices);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [isAddInvoiceModalOpen, setIsAddInvoiceModalOpen] = useState(false);
  const [isAddQuotationModalOpen, setIsAddQuotationModalOpen] = useState(false);
  const [isAddAgreementModalOpen, setIsAddAgreementModalOpen] = useState(false);

  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  // Line items state for new invoice modal
  const [lineItems, setLineItems] = useState([
    { description: "Enterprise Software ERP Development", hsnCode: "998314", quantity: 1, rate: 50000, taxRate: 18, discount: 0 }
  ]);

  // Quotation Modal state
  const [selectedQuotationClientId, setSelectedQuotationClientId] = useState<string>("");
  const [quotationItems, setQuotationItems] = useState([
    { id: "1", category: "Website & Tech Services", name: "Custom Web Portal Development", price: 49999, qty: 1 }
  ]);
  const [quotationTaxRate, setQuotationTaxRate] = useState<number>(18);
  const [quotationScope, setQuotationScope] = useState("Scope: Discovery -> Custom UI/UX -> Backend Integration -> QA Testing -> Live Deployment.");

  // Agreement Modal state
  const [selectedAgreementClientId, setSelectedAgreementClientId] = useState<string>("");
  const [agreementContent, setAgreementContent] = useState(
    "SERVICE AGREEMENT & CONTRACT\n\n1. SCOPE OF SERVICES: The Agency agrees to provide IT & Software development services as defined.\n2. PAYMENT TERMS: 50% Advance Upon Signing, 50% Final Payment Before Deployment.\n3. CONFIDENTIALITY: Both parties agree to maintain non-disclosure of proprietary source code & business data."
  );

  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("Bank Transfer");

  const [isPending, startTransition] = useTransition();

  // Filtered invoices list
  const filteredInvoices = invoicesList.filter((inv) => {
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      (inv.clientName || "").toLowerCase().includes(q) ||
      (inv.clientCompany || "").toLowerCase().includes(q)
    );
  });

  // Financial Metrics
  const totalBilled = invoicesList.reduce((acc, inv) => acc + (inv.total || 0), 0);
  const totalPaid = invoicesList.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
  const totalOutstanding = invoicesList.reduce((acc, inv) => acc + (inv.amountDue || 0), 0);
  const overdueCount = invoicesList.filter((inv) => inv.status === "Overdue" || (inv.amountDue > 0 && new Date(inv.dueDate) < new Date())).length;

  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: "", hsnCode: "998314", quantity: 1, rate: 0, taxRate: 18, discount: 0 }
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Subtotal & Tax auto-calculation
  const calculatedSubtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const calculatedTax = lineItems.reduce((acc, item) => acc + Math.round((item.quantity * item.rate * item.taxRate) / 100), 0);
  const calculatedDiscount = lineItems.reduce((acc, item) => acc + (item.discount || 0), 0);
  const calculatedGrandTotal = Math.max(0, calculatedSubtotal + calculatedTax - calculatedDiscount);

  // Invoice Submit
  const handleCreateInvoiceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("itemsJson", JSON.stringify(lineItems));

    startTransition(async () => {
      const res = await createInvoiceAction(formData);
      if (res.success) {
        setIsAddInvoiceModalOpen(false);
        window.location.reload();
      } else {
        alert("Failed to create invoice: " + res.error);
      }
    });
  };

  // Quotation Submit
  const handleCreateQuotationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientId = parseInt(selectedQuotationClientId, 10);
    if (!clientId) return alert("Please select a client");

    const qSubtotal = quotationItems.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const qTax = Math.round((qSubtotal * quotationTaxRate) / 100);
    const qTotal = qSubtotal + qTax;

    startTransition(async () => {
      const termsObj = { scopeOfWork: [quotationScope], globalTaxRate: quotationTaxRate };
      const res = await saveQuotation(clientId, quotationItems, qSubtotal, qTax, qTotal, JSON.stringify(termsObj));
      if (res.success) {
        alert("Quotation generated successfully!");
        setIsAddQuotationModalOpen(false);
        window.open(`/quotations/print/${res.id}`, "_blank");
      } else {
        alert("Failed to save quotation: " + res.error);
      }
    });
  };

  // Agreement Submit
  const handleCreateAgreementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientId = parseInt(selectedAgreementClientId, 10);
    if (!clientId) return alert("Please select a client");

    startTransition(async () => {
      const res = await saveAgreement(clientId, agreementContent);
      if (res.success) {
        alert("Legal Agreement created successfully!");
        setIsAddAgreementModalOpen(false);
        window.open(`/agreements/print/${res.id}`, "_blank");
      } else {
        alert("Failed to create agreement: " + res.error);
      }
    });
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;
    if (paymentAmount <= 0) return alert("Please enter a valid payment amount");

    startTransition(async () => {
      const res = await recordInvoicePaymentAction(selectedInvoiceForPayment.id, paymentAmount, paymentMethod);
      if (res.success) {
        setIsRecordPaymentOpen(false);
        setSelectedInvoiceForPayment(null);
        window.location.reload();
      } else {
        alert("Failed to record payment: " + res.error);
      }
    });
  };

  const handleSendInvoiceEmail = (invoiceId: number, invoiceNum: string, clientName?: string | null, clientEmail?: string | null) => {
    let emailToSend = (clientEmail || "").trim();

    if (!emailToSend) {
      const promptedEmail = window.prompt(
        `⚠️ Client "${clientName || "Client"}" has NO email address added!\n\nPlease enter the client's email address to send Tax Invoice ${invoiceNum}:`,
        ""
      );
      if (!promptedEmail || !promptedEmail.trim()) {
        return; // User cancelled or entered blank
      }
      emailToSend = promptedEmail.trim();
    }

    startTransition(async () => {
      const res = await sendInvoiceEmailAction(invoiceId, emailToSend);
      if (res.success) {
        alert(`✅ ${res.message}`);
        window.location.reload();
      } else if (res.error === "MISSING_CLIENT_EMAIL") {
        const rePromptedEmail = window.prompt(
          `⚠️ ${res.message}\n\nPlease enter client email address:`,
          ""
        );
        if (rePromptedEmail && rePromptedEmail.trim()) {
          const retryRes = await sendInvoiceEmailAction(invoiceId, rePromptedEmail.trim());
          if (retryRes.success) {
            alert(`✅ ${retryRes.message}`);
            window.location.reload();
          } else {
            alert("Failed to send email: " + retryRes.error);
          }
        }
      } else {
        alert("Failed to send email: " + res.error);
      }
    });
  };

  const handleDeleteInvoice = (invoiceId: number, invoiceNum: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoiceNum}?`)) return;
    startTransition(async () => {
      const res = await deleteInvoiceAction(invoiceId);
      if (res.success) {
        setInvoicesList((prev) => prev.filter((i) => i.id !== invoiceId));
      } else {
        alert("Failed to delete invoice: " + res.error);
      }
    });
  };

  return (
    <div className="space-y-3 w-full">
      {/* Header & Title Bar */}
      <div className="bg-white p-3.5 rounded-sm border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-4.5 h-4.5 text-blue-600" /> Enterprise Commercial & Financial Hub
          </h1>
          <p className="mt-0.5 text-xs text-gray-500">
            GST Tax Invoices, Commercial Proposals, Legal Agreements & Accounts Receivable Collector.
          </p>
        </div>

        {/* 3 SEPARATE DEDICATED BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddInvoiceModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> + Create Tax Invoice
          </button>

          <button
            onClick={() => setIsAddQuotationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" /> + Create Quotation
          </button>

          <button
            onClick={() => setIsAddAgreementModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <FileSignature className="w-3.5 h-3.5" /> + Create Legal Agreement
          </button>
        </div>
      </div>

      {/* Revenue KPI Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-2.5 rounded-sm border border-gray-200 space-y-0.5">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Invoiced Billed</p>
          <p className="text-xl font-bold text-gray-900">₹{totalBilled.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-gray-400 font-medium">Cumulative gross invoices value</p>
        </div>

        <div className="bg-white p-2.5 rounded-sm border border-gray-200 space-y-0.5">
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Paid Revenue Collected</p>
          <p className="text-xl font-bold text-emerald-700">₹{totalPaid.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-emerald-600 font-medium font-mono">
            {totalBilled > 0 ? `${Math.round((totalPaid / totalBilled) * 100)}% Collected` : "0% Collected"}
          </p>
        </div>

        <div className="bg-white p-2.5 rounded-sm border border-gray-200 space-y-0.5">
          <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Accounts Receivable (Due)</p>
          <p className="text-xl font-bold text-amber-700">₹{totalOutstanding.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-amber-600 font-medium">Outstanding pending balance</p>
        </div>

        <div className="bg-white p-2.5 rounded-sm border border-gray-200 space-y-0.5">
          <p className="text-[11px] font-semibold text-red-600 uppercase tracking-wider">Overdue Alerts</p>
          <p className="text-xl font-bold text-red-600">{overdueCount}</p>
          <p className="text-[10px] text-red-500 font-medium">Invoices past due date</p>
        </div>
      </div>

      {/* Toolbar Search & Status Filter */}
      <div className="bg-white p-2 rounded-sm border border-gray-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice #, client name, or company..."
            className="w-full text-xs py-1.5 outline-none border-b border-transparent focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 font-medium">Status:</span>
          <div className="flex items-center gap-1">
            {["all", "Paid", "Partially Paid", "Sent", "Overdue", "Draft"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-xs transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-slate-800 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {st === "all" ? "All" : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices Directory Table */}
      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50/80 border-b border-gray-200 font-bold text-gray-900 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2 px-3">Invoice #</th>
                <th className="py-2 px-3">Client & Company</th>
                <th className="py-2 px-3">Issue / Due Date</th>
                <th className="py-2 px-3">Total Amount</th>
                <th className="py-2 px-3">Amount Paid</th>
                <th className="py-2 px-3">Amount Due</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((inv) => {
                const isPaid = inv.status === "Paid";
                const isPartiallyPaid = inv.status === "Partially Paid";
                const isOverdue = inv.status === "Overdue" || (inv.amountDue > 0 && new Date(inv.dueDate) < new Date());

                return (
                  <tr key={inv.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-2 px-3 font-mono font-bold text-blue-700">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-2 px-3">
                      <p className="font-bold text-gray-900">{inv.clientName}</p>
                      {inv.clientCompany && (
                        <p className="text-[11px] text-gray-500 font-medium">{inv.clientCompany}</p>
                      )}
                    </td>

                    <td className="py-2 px-3 font-mono text-[11px]">
                      <p className="text-gray-900">{inv.issueDate}</p>
                      <p className="text-gray-400">Due: {inv.dueDate}</p>
                    </td>

                    <td className="py-2 px-3 font-bold text-gray-900">
                      ₹{inv.total.toLocaleString("en-IN")}
                    </td>

                    <td className="py-2 px-3 font-semibold text-emerald-700">
                      ₹{inv.amountPaid.toLocaleString("en-IN")}
                    </td>

                    <td className="py-2 px-3 font-semibold text-amber-700">
                      ₹{inv.amountDue.toLocaleString("en-IN")}
                    </td>

                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center gap-1 font-bold text-[10px] px-2.5 py-0.5 rounded border ${
                          isPaid
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isPartiallyPaid
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : isOverdue
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {isPaid && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {inv.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      {inv.amountDue > 0 && (
                        <button
                          onClick={() => {
                            setSelectedInvoiceForPayment(inv);
                            setPaymentAmount(inv.amountDue);
                            setIsRecordPaymentOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                        >
                          <Wallet className="w-3 h-3" /> Record Payment
                        </button>
                      )}

                      <Link
                        href={`/invoices/print/${inv.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 hover:bg-blue-100 cursor-pointer"
                      >
                        <Printer className="w-3 h-3" /> Print GST Invoice
                      </Link>

                      <button
                        onClick={() => handleSendInvoiceEmail(inv.id, inv.invoiceNumber, inv.clientName, inv.clientEmail)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200 hover:bg-indigo-100 cursor-pointer"
                        title="Send Tax Invoice PDF & Statement to Client Email via SMTP"
                      >
                        <Mail className="w-3 h-3" /> Email Invoice
                      </button>

                      <button
                        onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                        className="text-gray-300 hover:text-red-600 font-bold px-1"
                        title="Delete invoice"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 text-xs">
                    No tax invoices found. Use the buttons above to create Tax Invoices, Quotations, or Agreements.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. DEDICATED TAX INVOICE MODAL */}
      {isAddInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl rounded-sm bg-white border border-gray-200 overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-blue-50/50 shrink-0">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" /> Create Corporate GST Tax Invoice
              </h2>
              <button
                onClick={() => setIsAddInvoiceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-light cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block font-semibold text-gray-700 mb-1">Select Billed Client *</label>
                  <select name="clientId" required className="w-full rounded-sm border border-gray-200 p-2 bg-white focus:border-blue-500 focus:outline-none font-medium">
                    <option value="">Select Client</option>
                    {clientsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    name="issueDate"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-sm border border-gray-200 p-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    defaultValue={new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                    className="w-full rounded-sm border border-gray-200 p-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Line Items */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Invoice Line Items</h3>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 bg-gray-50 p-2.5 rounded-sm border border-gray-200 items-center">
                      <div className="col-span-4">
                        <label className="text-[10px] text-gray-500 block font-semibold mb-0.5">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                          placeholder="e.g. Software License"
                          className="w-full rounded-sm border border-gray-200 p-1.5 bg-white text-xs"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-gray-500 block font-semibold mb-0.5">HSN Code</label>
                        <input
                          type="text"
                          value={item.hsnCode}
                          onChange={(e) => handleItemChange(idx, "hsnCode", e.target.value)}
                          placeholder="998314"
                          className="w-full rounded-sm border border-gray-200 p-1.5 bg-white text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] text-gray-500 block font-semibold mb-0.5">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", parseInt(e.target.value, 10) || 1)}
                          className="w-full rounded-sm border border-gray-200 p-1.5 bg-white text-xs font-semibold"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-gray-500 block font-semibold mb-0.5">Rate (₹)</label>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(idx, "rate", parseInt(e.target.value, 10) || 0)}
                          className="w-full rounded-sm border border-gray-200 p-1.5 bg-white text-xs font-semibold"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-gray-500 block font-semibold mb-0.5">GST (%)</label>
                        <select
                          value={item.taxRate}
                          onChange={(e) => handleItemChange(idx, "taxRate", parseInt(e.target.value, 10) || 0)}
                          className="w-full rounded-sm border border-gray-200 p-1.5 bg-white text-xs font-semibold"
                        >
                          <option value={18}>18% GST</option>
                          <option value={12}>12% GST</option>
                          <option value={5}>5% GST</option>
                          <option value={0}>0% Tax Exempt</option>
                        </select>
                      </div>
                      <div className="col-span-1 text-right pt-4">
                        <button type="button" onClick={() => handleRemoveLineItem(idx)} className="text-gray-400 hover:text-red-600 font-bold">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50/50 p-4 rounded-sm border border-blue-100 space-y-1.5 text-right font-medium">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-gray-900">₹{calculatedSubtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>GST Tax (18%):</span>
                  <span className="font-bold text-blue-700">₹{calculatedTax.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-blue-200">
                  <span>Grand Total:</span>
                  <span className="text-base text-blue-700">₹{calculatedGrandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button type="button" onClick={() => setIsAddInvoiceModalOpen(false)} className="rounded-sm border border-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="rounded-sm bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
                  {isPending ? "Generating..." : "Generate GST Tax Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. DEDICATED COMMERCIAL QUOTATION MODAL */}
      {isAddQuotationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl rounded-sm bg-white border border-gray-200 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-indigo-50/50 shrink-0">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Create Commercial Proposal & Quotation
              </h2>
              <button onClick={() => setIsAddQuotationModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-light cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateQuotationSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Client *</label>
                <select
                  required
                  value={selectedQuotationClientId}
                  onChange={(e) => setSelectedQuotationClientId(e.target.value)}
                  className="w-full rounded-sm border border-gray-200 p-2 bg-white text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Select Target Client</option>
                  {clientsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Quotation Scope of Work</label>
                <textarea
                  value={quotationScope}
                  onChange={(e) => setQuotationScope(e.target.value)}
                  rows={3}
                  className="w-full rounded-sm border border-gray-200 p-2 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Dynamic Quotation Service Line Items Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Proposal Services & Line Items</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setQuotationItems((prev) => [
                        ...prev,
                        { id: Date.now().toString(), category: "Website & Tech Services", name: "", price: 0, qty: 1 }
                      ])
                    }
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Service Item
                  </button>
                </div>

                <div className="space-y-2">
                  {quotationItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 bg-gray-50 p-2.5 rounded-sm border border-gray-200 items-center">
                      <div className="col-span-4">
                        <label className="text-[10px] text-gray-500 block font-semibold mb-0.5">Category</label>
                        <select
                          value={item.category}
                          onChange={(e) =>
                            setQuotationItems((prev) =>
                              prev.map((it, i) => (i === idx ? { ...it, category: e.target.value } : it))
                            )
                          }
                          className="w-full rounded-sm border border-gray-200 p-1.5 bg-white text-xs font-medium"
                        >
                          <option value="Website & Tech Services">Website & Tech Services</option>
                          <option value="SEO Services">SEO Services</option>
                          <option value="Social Media Management">Social Media Management</option>
                          <option value="Custom Software Development">Custom Software Development</option>
                        </select>
                      </div>

                      <div className="col-span-5">
                        <label className="text-[10px] text-gray-500 block font-semibold mb-0.5">Service Description / Name</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            setQuotationItems((prev) =>
                              prev.map((it, i) => (i === idx ? { ...it, name: e.target.value } : it))
                            )
                          }
                          placeholder="e.g. 5-Page Website (Home, About, Services, Contact)"
                          className="w-full rounded-sm border border-gray-200 p-1.5 bg-white text-xs"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-[10px] text-gray-500 block font-semibold mb-0.5">Price (₹)</label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            setQuotationItems((prev) =>
                              prev.map((it, i) => (i === idx ? { ...it, price: parseInt(e.target.value, 10) || 0 } : it))
                            )
                          }
                          className="w-full rounded-sm border border-gray-200 p-1.5 bg-white text-xs font-bold text-indigo-700"
                          required
                        />
                      </div>

                      <div className="col-span-1 text-right pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (quotationItems.length <= 1) return;
                            setQuotationItems((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="text-gray-400 hover:text-red-600 font-bold"
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Calculation Box */}
              <div className="bg-indigo-50/50 p-3 rounded-sm border border-indigo-100 flex justify-between items-center text-xs font-medium">
                <span className="text-gray-600">Total Services Items: <strong>{quotationItems.length}</strong></span>
                <span className="text-sm font-bold text-indigo-800">
                  Total Quotation Amount: ₹
                  {quotationItems
                    .reduce((acc, i) => acc + (i.price * (i.qty || 1)), 0)
                    .toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button type="button" onClick={() => setIsAddQuotationModalOpen(false)} className="rounded-sm border border-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="rounded-sm bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer">
                  {isPending ? "Generating..." : "Generate Commercial Quotation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. DEDICATED LEGAL AGREEMENT MODAL */}
      {isAddAgreementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl rounded-sm bg-white border border-gray-200 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-emerald-50/50 shrink-0">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-emerald-600" /> Create Legal Client Service Agreement
              </h2>
              <button onClick={() => setIsAddAgreementModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-light cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateAgreementSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Client *</label>
                <select
                  required
                  value={selectedAgreementClientId}
                  onChange={(e) => setSelectedAgreementClientId(e.target.value)}
                  className="w-full rounded-sm border border-gray-200 p-2 bg-white text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Select Target Client</option>
                  {clientsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Agreement Terms & Legal Contract Clauses</label>
                <textarea
                  value={agreementContent}
                  onChange={(e) => setAgreementContent(e.target.value)}
                  rows={8}
                  className="w-full rounded-sm border border-gray-200 p-3 text-xs font-mono bg-gray-50 focus:border-emerald-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button type="button" onClick={() => setIsAddAgreementModalOpen(false)} className="rounded-sm border border-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="rounded-sm bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer">
                  {isPending ? "Creating..." : "Generate Legal Agreement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isRecordPaymentOpen && selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-sm bg-white border border-gray-200 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" /> Record Client Payment
              </h2>
              <button onClick={() => setIsRecordPaymentOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-light cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-gray-50 p-3 rounded-sm border border-gray-200 space-y-1">
                <p className="font-bold text-gray-900 text-sm">{selectedInvoiceForPayment.invoiceNumber}</p>
                <p className="text-gray-600">Client: {selectedInvoiceForPayment.clientName}</p>
                <div className="flex justify-between pt-1 border-t border-gray-200 text-xs">
                  <span>Total Amount: <strong>₹{selectedInvoiceForPayment.total.toLocaleString("en-IN")}</strong></span>
                  <span className="text-amber-700 font-bold">Due: ₹{selectedInvoiceForPayment.amountDue.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Received Payment Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-sm border border-gray-200 p-2 text-sm font-bold text-emerald-700 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-sm border border-gray-200 p-2 bg-white focus:border-blue-500 focus:outline-none font-medium"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cheque">Cheque Payment</option>
                  <option value="Cash">Cash Payment</option>
                  <option value="Credit Card">Credit / Debit Card</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button type="button" onClick={() => setIsRecordPaymentOpen(false)} className="rounded-sm border border-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="rounded-sm bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer">
                  {isPending ? "Recording..." : "Record Payment & Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
