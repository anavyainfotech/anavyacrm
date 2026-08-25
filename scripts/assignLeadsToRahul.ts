import "dotenv/config";
import { db } from "../src/lib/db";
import { clients, users } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Assigning leads to BD Intern (Rahul Sharma)...");

  // Find user Rahul Sharma / intern
  const internUser = await db
    .select()
    .from(users)
    .where(eq(users.email, "intern@anavyainfotech.com"))
    .limit(1);

  if (internUser.length === 0) {
    console.error("BD Intern user not found.");
    process.exit(1);
  }

  const internId = internUser[0].id;
  console.log(`Found BD Intern with ID ${internId}`);

  // Fetch first 3 leads or create sample assigned leads
  const existingLeads = await db.select().from(clients).limit(5);

  if (existingLeads.length > 0) {
    // Assign first 2 leads to Rahul
    for (let i = 0; i < Math.min(3, existingLeads.length); i++) {
      await db
        .update(clients)
        .set({ assignedTo: internId })
        .where(eq(clients.id, existingLeads[i].id));

      console.log(`Assigned lead ID ${existingLeads[i].id} (${existingLeads[i].name}) to Rahul.`);
    }
  }

  // Also insert 2 new dedicated cold call leads for Rahul
  await db.insert(clients).values([
    {
      name: "Amit Patel (Retail Chain)",
      email: "amit@patelretail.com",
      phone: "+91 9823456789",
      whatsapp: "+91 9823456789",
      company: "Patel Retail Ltd",
      industry: "E-Commerce",
      source: "Cold Call",
      requirement: "Complete CRM & Web ERP App development for 10 retail branches.",
      budget: 350000,
      priority: "High",
      status: "New",
      aiScore: 82,
      notes: "Auto-assigned to BD Intern for cold calling & summary log.",
      orgId: 1,
      assignedTo: internId,
    },
    {
      name: "Priya Sharma (Fintech Startup)",
      email: "priya@payquick.in",
      phone: "+91 9811223344",
      whatsapp: "+91 9811223344",
      company: "PayQuick Solutions",
      industry: "Finance",
      source: "WhatsApp",
      requirement: "Payment Gateway Integration & Dashboard.",
      budget: 200000,
      priority: "Medium",
      status: "Contacted",
      aiScore: 75,
      notes: "Follow up call scheduled for tomorrow.",
      orgId: 1,
      assignedTo: internId,
    },
  ]);

  console.log("SUCCESS: Assigned 5 leads to Rahul Sharma (BD Intern).");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error assigning leads:", err);
  process.exit(1);
});
