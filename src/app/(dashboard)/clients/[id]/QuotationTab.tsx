"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, FileText, Download, ChevronDown, ChevronRight } from "lucide-react";
import { saveQuotation, deleteQuotation } from "../actions";

const CATEGORIES = ['Website Services', 'SEO Services', 'Social Media Management'];

export default function QuotationTab({ client, existingQuotations }: { client: any, existingQuotations: any[] }) {
  const [items, setItems] = useState<{ id: string, category: string, name: string, price: number, qty: number }[]>([
    { id: '1', category: 'Website Services', name: "5-Page Website (Home, Services, Gallery, About, Contact)", price: 4999, qty: 1 },
    { id: '2', category: 'Website Services', name: "Custom premium design — mobile responsive", price: 0, qty: 1 },
    { id: '3', category: 'Website Services', name: "WhatsApp booking integration", price: 0, qty: 1 },
    { id: '4', category: 'Website Services', name: "Google Maps integration", price: 0, qty: 1 },
    { id: '5', category: 'Website Services', name: "Hosting setup & configuration", price: 0, qty: 1 },
    { id: '6', category: 'Website Services', name: "2 rounds of design revisions", price: 0, qty: 1 },
  ]);
  
  const [globalTaxRate, setGlobalTaxRate] = useState<number>(0);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({'Website Services': true});
  const [isPending, startTransition] = useTransition();

  const toggleCat = (cat: string) => {
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleAddItem = (category: string) => {
    setItems(prev => [...prev, { id: crypto.randomUUID(), category, name: "", price: 0, qty: 1 }]);
    if (!expandedCats[category]) {
      setExpandedCats(prev => ({ ...prev, [category]: true }));
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: string, value: string | number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const subtotal = Math.round(items.reduce((sum, item) => sum + (item.price * item.qty), 0));
  const taxTotal = Math.round(subtotal * (globalTaxRate / 100));
  const total = subtotal + taxTotal;
  
  // Editable Content State
  const [introMessage, setIntroMessage] = useState("Dear {clientName}, thank you for the opportunity to work with you. Below is our proposal for the services discussed.");
  
  const [scopeOfWork, setScopeOfWork] = useState(
    "Discovery → Design → Execution → Delivery → Support. We understand your brand and provide premium digital solutions tailored to your needs."
  );
  
  const [complimentary, setComplimentary] = useState(
    "Basic on-page SEO setup (if website is included).\n" +
    "SSL security certificate (if website is included).\n" +
    "30 days free support & bug-fixes."
  );
  
  const [timelineAndTerms, setTimelineAndTerms] = useState(
    "Payment Terms|50% Advance → 50% Before Delivery\n" +
    "Monthly Services|Monthly payment is payable in advance at the beginning of each month. Services will commence after the monthly payment is received.\n" +
    "Validity|This quotation is valid for 15 days from the date above."
  );
  
  const [notIncluded, setNotIncluded] = useState(
    "▸ Website Content (Images, Service Details) will be provided by the client.\n" +
    "▸ Domain name registration (client provides)\n" +
    "▸ New features beyond scope, quoted separately"
  );
  
  const [showSettings, setShowSettings] = useState(false);

  const generatePDF = (qId: string | number) => {
    window.open(`/quotations/print/${qId}`, "_blank");
  };

  const handleSaveQuotation = () => {
    startTransition(async () => {
      const termsObj = {
        introMessage,
        scopeOfWork: scopeOfWork.split('\n').filter(s => s.trim() !== ""),
        complimentary: complimentary.split('\n').filter(s => s.trim() !== ""),
        timelineAndTerms: timelineAndTerms.split('\n').filter(s => s.trim() !== "").map(line => {
          const [label, ...val] = line.split('|');
          return { label: label.trim(), value: val.join('|').trim() };
        }),
        notIncluded,
        globalTaxRate
      };
      
      const res = await saveQuotation(client.id, items, subtotal, taxTotal, total, JSON.stringify(termsObj));
      if (res.success) {
        alert("Quotation saved successfully!");
        generatePDF(res.id!);
      } else {
        alert("Failed to save quotation: " + (res.error || "Unknown"));
      }
    });
  };

  const handleDeleteQuotation = (qId: number) => {
    if (confirm("Are you sure you want to delete this quotation? This action cannot be undone.")) {
      startTransition(async () => {
        const res = await deleteQuotation(qId, client.id);
        if (res.success) {
          alert("Quotation deleted successfully!");
        } else {
          alert("Failed to delete quotation: " + res.error);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-md p-6">
        <div className="mb-6 border-b pb-4">
          <h3 className="font-semibold text-lg text-gray-900">Create New Quotation</h3>
        </div>

        <div className="space-y-4">
          {CATEGORIES.map(category => {
            const categoryItems = items.filter(i => i.category === category);
            const isExpanded = expandedCats[category];
            const catSubtotal = categoryItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
            
            return (
              <div key={category} className="mb-4">
                <div 
                  className="bg-gray-50 p-3 rounded-md flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleCat(category)}
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                    <h4 className="font-medium text-gray-800">{category}</h4>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{categoryItems.length} items</span>
                  </div>
                  <div className="font-semibold text-sm text-gray-900">
                    ₹{catSubtotal.toLocaleString('en-IN')}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-white space-y-3">
                    {categoryItems.length > 0 ? (
                      <>
                        <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider pb-2 border-b">
                          <div className="col-span-8">Service / Item</div>
                          <div className="col-span-2">Price (₹)</div>
                          <div className="col-span-1">Qty</div>
                          <div className="col-span-1"></div>
                        </div>
                        {categoryItems.map((item) => (
                          <div key={item.id} className="grid grid-cols-12 gap-4 items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                            <div className="col-span-8">
                              <input 
                                type="text" 
                                value={item.name}
                                onChange={e => updateItem(item.id, 'name', e.target.value)}
                                placeholder="Item description"
                                className="w-full text-sm rounded-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="col-span-2">
                              <input 
                                type="number" 
                                value={item.price}
                                onChange={e => updateItem(item.id, 'price', parseInt(e.target.value) || 0)}
                                className="w-full text-sm rounded-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="col-span-1">
                              <input 
                                type="number" 
                                value={item.qty}
                                min="1"
                                onChange={e => updateItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                                className="w-full text-sm rounded-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="col-span-1 text-right">
                              <button onClick={() => handleRemoveItem(item.id)} className="text-gray-400 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No items in this category.</p>
                    )}
                    
                    <button 
                      onClick={() => handleAddItem(category)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mt-2"
                    >
                      <Plus className="w-4 h-4" /> Add {category} Item
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-4 flex flex-col items-end space-y-3 text-sm">
          <div className="flex justify-between items-center w-64">
            <span className="text-gray-600 font-medium">Global Tax:</span>
            <select 
              value={globalTaxRate}
              onChange={e => setGlobalTaxRate(parseInt(e.target.value) || 0)}
              className="text-sm rounded-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 w-32 py-1"
            >
              <option value="0">0% (None)</option>
              <option value="18">18% GST</option>
            </select>
          </div>
          <div className="flex justify-between w-64 pt-2 border-t border-gray-100">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between w-64">
            <span className="text-gray-600">Tax ({globalTaxRate}%):</span>
            <span className="font-medium text-gray-900">₹{taxTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center mt-6 w-full border-t border-gray-200 pt-6">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              {showSettings ? "Hide Advanced Settings" : "Edit Quotation Terms & Scope"}
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{total.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="mt-6 space-y-6 bg-white p-4 border border-gray-200 rounded-md">
            <h4 className="font-medium text-gray-900 border-b pb-2">Edit Quotation Content</h4>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Intro Message</label>
              <textarea value={introMessage} onChange={(e) => setIntroMessage(e.target.value)} rows={3} className="w-full text-sm p-2 border border-gray-300 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800" />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Scope of Work (One item per line)</label>
              <textarea value={scopeOfWork} onChange={(e) => setScopeOfWork(e.target.value)} rows={4} className="w-full text-sm p-2 border border-gray-300 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800" />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Complimentary Add-ons (One item per line)</label>
              <textarea value={complimentary} onChange={(e) => setComplimentary(e.target.value)} rows={3} className="w-full text-sm p-2 border border-gray-300 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800" />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Timeline & Terms (Format: Label | Value)</label>
              <textarea value={timelineAndTerms} onChange={(e) => setTimelineAndTerms(e.target.value)} rows={3} className="w-full text-sm p-2 border border-gray-300 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800" />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Not Included Note</label>
              <textarea value={notIncluded} onChange={(e) => setNotIncluded(e.target.value)} rows={2} className="w-full text-sm p-2 border border-gray-300 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800" />
            </div>
          </div>
        )}

        <div className="mt-6 border-t pt-4 flex justify-end items-center">
          <button 
            onClick={handleSaveQuotation}
            disabled={isPending || items.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4" /> Generate Quotation
          </button>
        </div>
      </div>

      {existingQuotations && existingQuotations.length > 0 && (
        <div className="bg-white rounded-md p-6">
          <h3 className="font-bold text-gray-900 mb-4">Past Quotations</h3>
          <div className="space-y-3">
            {existingQuotations.map(q => (
              <div key={q.id} className="flex justify-between items-center p-3 rounded-md bg-gray-50 border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Quotation #{q.id}</p>
                  <p className="text-xs text-gray-500">{new Date(q.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">₹{q.total?.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-500 mb-2">{q.status}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <button 
                      onClick={() => generatePDF(q.id)}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> PDF
                    </button>
                    <button 
                      onClick={() => handleDeleteQuotation(q.id)}
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
