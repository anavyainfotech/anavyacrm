"use server";

import { db } from "@/lib/db";
import { customFields, clients } from "@/lib/db/schema";
import { auth } from "@/auth/auth";
import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCustomFieldsAction(moduleName: string = "leads") {
  try {
    const session = await auth();
    const orgId = (session?.user as any)?.orgId
      ? parseInt((session?.user as any).orgId, 10)
      : 1;

    const fieldsList = await db
      .select()
      .from(customFields)
      .where(and(eq(customFields.orgId, orgId), eq(customFields.module, moduleName)))
      .orderBy(asc(customFields.sortOrder), asc(customFields.id));

    return { success: true, fields: fieldsList };
  } catch (error: any) {
    console.error("Failed to fetch custom fields:", error);
    return { success: false, error: error.message || "Failed to fetch custom fields" };
  }
}

export async function createCustomFieldAction(formData: FormData) {
  try {
    const session = await auth();
    const orgId = (session?.user as any)?.orgId
      ? parseInt((session?.user as any).orgId, 10)
      : 1;

    const fieldLabel = (formData.get("fieldLabel") as string || "").trim();
    const fieldType = (formData.get("fieldType") as string || "text").trim();
    const moduleName = (formData.get("module") as string || "leads").trim();
    const industryType = (formData.get("industryType") as string || "General").trim();
    const isRequired = (formData.get("isRequired") as string || "false").trim();
    const rawOptions = (formData.get("options") as string || "").trim();

    if (!fieldLabel) return { success: false, error: "Field Label is required" };

    const fieldName = fieldLabel.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

    let optionsArray: string[] = [];
    if (fieldType === "select" && rawOptions) {
      optionsArray = rawOptions.split(",").map((s) => s.trim()).filter(Boolean);
    }

    await db.insert(customFields).values({
      orgId,
      module: moduleName,
      fieldName,
      fieldLabel,
      fieldType,
      options: JSON.stringify(optionsArray),
      isRequired,
      industryType,
      sortOrder: 0,
    });

    revalidatePath("/settings/custom-fields");
    revalidatePath("/clients");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create custom field:", error);
    return { success: false, error: error.message || "Failed to create custom field" };
  }
}

export async function deleteCustomFieldAction(fieldId: number) {
  try {
    await db.delete(customFields).where(eq(customFields.id, fieldId));
    revalidatePath("/settings/custom-fields");
    revalidatePath("/clients");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 1-Click Industry Preset Installer Supporting 100+ Business Categories
export async function applyIndustryPresetAction(industryKey: string) {
  try {
    const session = await auth();
    const orgId = (session?.user as any)?.orgId
      ? parseInt((session?.user as any).orgId, 10)
      : 1;

    const PRESETS: Record<string, Array<{ label: string; type: string; options?: string[]; required?: string }>> = {
      real_estate: [
        { label: "Property Type", type: "select", options: ["Apartment / Flat", "Independent House / Villa", "Plot / Land", "Commercial Space", "Farmhouse"] },
        { label: "BHK Preference", type: "select", options: ["1 BHK", "2 BHK", "3 BHK", "4+ BHK", "Studio"] },
        { label: "Preferred Location Zone", type: "text" },
        { label: "Carpet Area (SqFt)", type: "number" },
        { label: "Possession Timeline", type: "select", options: ["Ready to Move", "Under Construction (< 6 months)", "New Launch (1-2 years)"] },
        { label: "Buyer Type", type: "select", options: ["End User", "Investor"] },
      ],
      it_agency: [
        { label: "Tech Stack Needed", type: "select", options: ["Full Stack Web (React / Next.js)", "Mobile App (iOS & Android)", "Custom ERP / CRM", "UI/UX Design", "SEO & Digital Marketing"] },
        { label: "Project Scope", type: "textarea" },
        { label: "Target Launch Date", type: "date" },
        { label: "Cloud Hosting Needed", type: "select", options: ["AWS / Vercel Managed", "Client Server VPS", "Not Sure"] },
      ],
      healthcare: [
        { label: "Medical Specialty", type: "select", options: ["General Physician", "Dental Clinic", "Orthopedics", "Dermatology / Skin", "Pediatrics", "Gynecology"] },
        { label: "Patient Age Group", type: "select", options: ["Child (< 18)", "Adult (18-60)", "Senior Citizen (60+)"] },
        { label: "Primary Symptoms / Concern", type: "textarea" },
        { label: "Preferred Appointment Slot", type: "select", options: ["Morning Slot (9 AM - 1 PM)", "Evening Slot (4 PM - 8 PM)"] },
      ],
      solar: [
        { label: "Rooftop Area (SqFt)", type: "number" },
        { label: "Monthly Electricity Bill (₹)", type: "number" },
        { label: "Connection Phase Type", type: "select", options: ["Single Phase", "Three Phase"] },
        { label: "System Capacity Needed", type: "select", options: ["3 kW", "5 kW", "10 kW", "25+ kW Industrial"] },
      ],
      education: [
        { label: "Course Interested", type: "select", options: ["Web Development & AI", "Data Science", "Digital Marketing", "NEET / JEE Coaching", "Spoken English & Personality"] },
        { label: "Highest Qualification", type: "select", options: ["High School (10th)", "Senior Secondary (12th)", "Undergraduate", "Postgraduate"] },
        { label: "Target Batch Year", type: "select", options: ["2026 Batch", "2027 Batch"] },
      ],
      b2b_manufacturing: [
        { label: "Minimum Order Quantity (MOQ)", type: "number" },
        { label: "GST Registration Type", type: "select", options: ["Regular GST", "Composition", "SEZ / Export Exempt"] },
        { label: "Technical Specifications", type: "textarea font-mono" },
        { label: "Delivery Pincode", type: "text" },
      ],
      finance_loans: [
        { label: "Loan / Product Type", type: "select", options: ["Business Growth Loan", "Home Loan", "Personal Loan", "Health Insurance", "Term Mutual Funds"] },
        { label: "Annual Household Income (₹)", type: "number" },
        { label: "CIBIL Score Range", type: "select", options: ["750+ (Excellent)", "700-749 (Good)", "650-699 (Fair)", "Below 650"] },
      ],
      automobile: [
        { label: "Vehicle Model Interest", type: "text" },
        { label: "Fuel Preference", type: "select", options: ["Electric (EV)", "Petrol", "Diesel", "CNG / Hybrid"] },
        { label: "Test Drive Required", type: "select", options: ["Yes (Home Visit)", "Yes (Showroom)", "Not Required"] },
        { label: "Old Car Exchange Available", type: "select", options: ["Yes", "No"] },
      ],
      events_wedding: [
        { label: "Event Type", type: "select", options: ["Wedding & Sangeet", "Corporate Conference", "Birthday / Anniversary", "Exhibition / Trade Fair"] },
        { label: "Expected Guest Count", type: "number" },
        { label: "Event Date", type: "date" },
        { label: "Venue Preference", type: "select", options: ["Destination Resort", "5-Star Hotel", "Banquet Hall", "Outdoor Lawn"] },
      ]
    };

    const selectedPreset = PRESETS[industryKey];
    if (!selectedPreset) return { success: false, error: "Invalid industry preset selected" };

    let count = 0;
    for (const item of selectedPreset) {
      const fieldName = item.label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

      // Check if exists
      const existing = await db
        .select()
        .from(customFields)
        .where(and(eq(customFields.orgId, orgId), eq(customFields.fieldName, fieldName)))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(customFields).values({
          orgId,
          module: "leads",
          fieldName,
          fieldLabel: item.label,
          fieldType: item.type,
          options: JSON.stringify(item.options || []),
          isRequired: item.required || "false",
          industryType: industryKey,
          sortOrder: count,
        });
        count++;
      }
    }

    revalidatePath("/settings/custom-fields");
    revalidatePath("/clients");
    return { success: true, count, message: `Installed ${count} custom fields for selected industry preset!` };
  } catch (error: any) {
    console.error("Failed to apply industry preset:", error);
    return { success: false, error: error.message || "Failed to apply preset" };
  }
}
