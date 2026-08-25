import "dotenv/config";
import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";
import { clients } from "../src/lib/db/schema";

async function run() {
  try {
    // 1. Create table using raw SQL
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "clients" (
        "id" serial PRIMARY KEY,
        "name" text NOT NULL,
        "email" text,
        "phone" text,
        "company" text,
        "status" text NOT NULL DEFAULT 'New Lead',
        "source" text,
        "org_id" integer NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log("Clients table created.");

    // 2. Fetch the first organization ID to use for demo data
    const orgsResult = await db.execute(sql`SELECT id FROM organizations LIMIT 1;`);
    const orgsList: any[] = Array.isArray(orgsResult) ? orgsResult : (orgsResult as any).rows || [];
    if (orgsList.length === 0) {
      console.log("No organization found. Please create one first.");
      process.exit(1);
    }
    const orgId = orgsList[0].id as number;

    // 3. Insert Demo Data
    const demoClients = [
      { name: "Rahul Sharma", company: "Anavya Infotech", email: "rahul@example.com", phone: "+91 9876543210", status: "New Lead", source: "Website", orgId },
      { name: "Amit Kumar", company: "Hospital Management Inc", email: "amit@hospital.com", phone: "+91 8765432109", status: "In Progress", source: "Referral", orgId },
      { name: "Neha Singh", company: "ABC Retail Store", email: "neha@abc.com", phone: "+91 7654321098", status: "Active Client", source: "Direct", orgId },
      { name: "Vikas Gupta", company: "XYZ Logistics", email: "vikas@xyz.com", phone: "+91 6543210987", status: "New Lead", source: "Cold Call", orgId },
      { name: "Priya Patel", company: "Tech Solutions Pvt Ltd", email: "priya@tech.com", phone: "+91 5432109876", status: "Active Client", source: "Website", orgId }
    ];

    await db.insert(clients).values(demoClients);
    console.log("Demo data inserted successfully!");

  } catch (error) {
    console.error("Error setting up DB:", error);
  }
  process.exit(0);
}

run();
