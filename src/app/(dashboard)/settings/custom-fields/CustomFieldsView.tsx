"use client";

import { useState, useTransition } from "react";
import { 
  SlidersHorizontal, Plus, Trash2, CheckCircle2, Sparkles, Building2, 
  Stethoscope, Cpu, Sun, GraduationCap, Factory, Landmark, Car, PartyPopper, Layers, Shield
} from "lucide-react";
import { createCustomFieldAction, deleteCustomFieldAction, applyIndustryPresetAction } from "@/features/custom-fields/actions";

interface CustomField {
  id: number;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  options?: string | null;
  isRequired?: string | null;
  industryType?: string | null;
  sortOrder?: number | null;
}

const INDUSTRY_CARDS = [
  { key: "real_estate", name: "Real Estate & Property", icon: Building2, color: "bg-blue-50 text-blue-700 border-blue-200", desc: "Property type, BHK, Area SqFt, Possession, Location" },
  { key: "it_agency", name: "IT & Web Development", icon: Cpu, color: "bg-indigo-50 text-indigo-700 border-indigo-200", desc: "Tech Stack, Scope, Launch Date, Cloud Hosting" },
  { key: "healthcare", name: "Healthcare & Clinics", icon: Stethoscope, color: "bg-emerald-50 text-emerald-700 border-emerald-200", desc: "Specialty, Symptoms, Patient Age, Appointment Slot" },
  { key: "solar", name: "Solar & Green Energy", icon: Sun, color: "bg-amber-50 text-amber-800 border-amber-200", desc: "Rooftop SqFt, Monthly Bill, Phase, kW Capacity" },
  { key: "education", name: "Education & Coaching", icon: GraduationCap, color: "bg-purple-50 text-purple-700 border-purple-200", desc: "Course, Qualification, Target Batch, Entrance Exam" },
  { key: "b2b_manufacturing", name: "B2B & Manufacturing", icon: Factory, color: "bg-slate-50 text-slate-800 border-slate-200", desc: "MOQ Quantity, GST Type, Technical Specs, Pincode" },
  { key: "finance_loans", name: "Loans & Financial", icon: Landmark, color: "bg-cyan-50 text-cyan-700 border-cyan-200", desc: "Loan Type, Income Slab, CIBIL Range, Term" },
  { key: "automobile", name: "Automobile Dealership", icon: Car, color: "bg-red-50 text-red-700 border-red-200", desc: "Vehicle Model, Fuel EV/Petrol, Test Drive, Old Exchange" },
  { key: "events_wedding", name: "Events & Weddings", icon: PartyPopper, color: "bg-pink-50 text-pink-700 border-pink-200", desc: "Event Type, Guest Count, Event Date, Destination Venue" },
];

export default function CustomFieldsView({ initialFields = [] }: { initialFields: CustomField[] }) {
  const [fieldsList, setFieldsList] = useState<CustomField[]>(initialFields);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("text");
  const [isPending, startTransition] = useTransition();

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createCustomFieldAction(formData);
      if (res.success) {
        setIsAddModalOpen(false);
        window.location.reload();
      } else {
        alert("Failed to create field: " + res.error);
      }
    });
  };

  const handleApplyPreset = (industryKey: string, industryName: string) => {
    if (!confirm(`Install 1-Click field preset pack for ${industryName}?`)) return;

    startTransition(async () => {
      const res = await applyIndustryPresetAction(industryKey);
      if (res.success) {
        alert(`🎉 Success: ${res.message}`);
        window.location.reload();
      } else {
        alert("Failed to apply preset: " + res.error);
      }
    });
  };

  const handleDelete = (fieldId: number, label: string) => {
    if (!confirm(`Are you sure you want to delete custom field "${label}"?`)) return;

    startTransition(async () => {
      const res = await deleteCustomFieldAction(fieldId);
      if (res.success) {
        setFieldsList((prev) => prev.filter((f) => f.id !== fieldId));
      } else {
        alert("Failed to delete field: " + res.error);
      }
    });
  };

  return (
    <div className="space-y-6 w-full">
      {/* Title Header */}
      <div className="bg-white p-5 rounded-sm border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-600" /> Dynamic Custom Fields Engine
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Customize lead forms & data fields for 100+ business types (Real Estate, Healthcare, IT, Solar, Education, B2B, Finance).
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-sm font-semibold text-xs hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> + Create Custom Field
        </button>
      </div>

      {/* 1-Click Industry Presets Installer Library */}
      <div className="bg-white rounded-sm border border-gray-200 p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-sm font-bold text-gray-900">1-Click Industry Field Presets (100+ Business Support)</h2>
              <p className="text-xs text-gray-500">Select your industry category to instantly load tailored custom fields into your lead form.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {INDUSTRY_CARDS.map((ind) => {
            const Icon = ind.icon;
            return (
              <div key={ind.key} className="bg-gray-50/70 p-3.5 rounded-sm border border-gray-200 space-y-2 flex flex-col justify-between hover:bg-gray-50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold border ${ind.color}`}>
                      <Icon className="w-3.5 h-3.5" /> {ind.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed font-medium pt-1">
                    {ind.desc}
                  </p>
                </div>

                <button
                  onClick={() => handleApplyPreset(ind.key, ind.name)}
                  disabled={isPending}
                  className="w-full py-1.5 text-xs font-bold bg-white text-gray-800 rounded border border-gray-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors cursor-pointer"
                >
                  ⚡ Install {ind.name} Preset
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Installed Custom Fields Directory */}
      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden shadow-2xs space-y-3 p-5">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" /> Active Configured Custom Fields ({fieldsList.length})
          </h3>
          <span className="text-xs text-gray-400 font-mono">Module: Leads & Clients</span>
        </div>

        {fieldsList.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs space-y-2">
            <p>No dynamic custom fields configured yet.</p>
            <p className="text-gray-500">Click <strong>"+ Create Custom Field"</strong> or install an <strong>Industry Preset</strong> above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Field Label</th>
                  <th className="py-2.5 px-3">Machine Key</th>
                  <th className="py-2.5 px-3">Input Type</th>
                  <th className="py-2.5 px-3">Category / Industry</th>
                  <th className="py-2.5 px-3">Options / Values</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                {fieldsList.map((field) => {
                  let parsedOptions: string[] = [];
                  try {
                    parsedOptions = field.options ? JSON.parse(field.options) : [];
                  } catch (e) {
                    parsedOptions = [];
                  }

                  return (
                    <tr key={field.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-gray-900">
                        {field.fieldLabel}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-gray-500">
                        {field.fieldName}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100 uppercase">
                          {field.fieldType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-gray-600">
                        {field.industryType || "General"}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-gray-500 max-w-xs truncate font-mono">
                        {parsedOptions.length > 0 ? parsedOptions.join(", ") : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleDelete(field.id, field.fieldLabel)}
                          className="text-gray-400 hover:text-red-600 font-bold p-1 cursor-pointer"
                          title="Delete Custom Field"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Single Custom Field */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-sm bg-white border border-gray-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" /> Create Single Dynamic Custom Field
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-light cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Field Label *</label>
                <input
                  type="text"
                  name="fieldLabel"
                  required
                  placeholder="e.g. Property Type, BHK, Special Symptoms"
                  className="w-full rounded-sm border border-gray-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Input Field Type</label>
                  <select
                    name="fieldType"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full rounded-sm border border-gray-200 p-2 text-xs bg-white focus:border-blue-500 focus:outline-none font-semibold"
                  >
                    <option value="text">Single Line Text</option>
                    <option value="number">Number (Currency / SqFt)</option>
                    <option value="select">Dropdown Select Menu</option>
                    <option value="date">Date Picker</option>
                    <option value="textarea">Multi-line Text Area</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Industry Category</label>
                  <input
                    type="text"
                    name="industryType"
                    defaultValue="General"
                    placeholder="Real Estate, IT, Solar..."
                    className="w-full rounded-sm border border-gray-200 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {selectedType === "select" && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Dropdown Options (Comma Separated) *</label>
                  <input
                    type="text"
                    name="options"
                    placeholder="Option 1, Option 2, Option 3, Option 4"
                    className="w-full rounded-sm border border-gray-200 p-2 text-xs focus:border-blue-500 focus:outline-none font-mono"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Separate dropdown options with commas.</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="rounded-sm border border-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="rounded-sm bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
                  {isPending ? "Creating..." : "Save Custom Field"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
