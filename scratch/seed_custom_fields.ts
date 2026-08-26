import { db } from "../src/lib/db";
import { customFields } from "../src/lib/db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
  console.log("Seeding default industry custom fields presets for Org ID 1...");

  const defaultFields = [
    {
      orgId: 1,
      module: "leads",
      fieldName: "property_type",
      fieldLabel: "Property Type",
      fieldType: "select",
      options: JSON.stringify(["Apartment / Flat", "Independent House / Villa", "Plot / Land", "Commercial Space", "Farmhouse"]),
      isRequired: "false",
      industryType: "Real Estate",
      sortOrder: 1,
    },
    {
      orgId: 1,
      module: "leads",
      fieldName: "bhk_preference",
      fieldLabel: "BHK Preference",
      fieldType: "select",
      options: JSON.stringify(["1 BHK", "2 BHK", "3 BHK", "4+ BHK", "Studio"]),
      isRequired: "false",
      industryType: "Real Estate",
      sortOrder: 2,
    },
    {
      orgId: 1,
      module: "leads",
      fieldName: "tech_stack_needed",
      fieldLabel: "Tech Stack Needed",
      fieldType: "select",
      options: JSON.stringify(["Full Stack Web (React / Next.js)", "Mobile App (iOS & Android)", "Custom ERP / CRM", "UI/UX Design", "SEO & Marketing"]),
      isRequired: "false",
      industryType: "IT & Web Development",
      sortOrder: 3,
    },
    {
      orgId: 1,
      module: "leads",
      fieldName: "target_launch_date",
      fieldLabel: "Target Launch Date",
      fieldType: "date",
      options: "[]",
      isRequired: "false",
      industryType: "IT & Web Development",
      sortOrder: 4,
    },
  ];

  for (const item of defaultFields) {
    const existing = await db
      .select()
      .from(customFields)
      .where(and(eq(customFields.orgId, item.orgId), eq(customFields.fieldName, item.fieldName)))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(customFields).values(item);
    }
  }

  console.log("Seeded default custom fields successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
