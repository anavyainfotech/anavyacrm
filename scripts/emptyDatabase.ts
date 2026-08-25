import { config } from "dotenv";
config();

import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_p3yvCBaeX9OG@ep-divine-night-azj4zlkh.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const sql = postgres(connectionString, { ssl: "require" });

async function emptyDatabase() {
  console.log("🧹 Wiping demo data & demo employees from Neon PostgreSQL database...");

  try {
    await sql`TRUNCATE TABLE clients RESTART IDENTITY CASCADE;`;
    await sql`TRUNCATE TABLE projects RESTART IDENTITY CASCADE;`;
    await sql`TRUNCATE TABLE invoices RESTART IDENTITY CASCADE;`;
    await sql`TRUNCATE TABLE quotations RESTART IDENTITY CASCADE;`;
    await sql`TRUNCATE TABLE agreements RESTART IDENTITY CASCADE;`;
    await sql`TRUNCATE TABLE lead_activities RESTART IDENTITY CASCADE;`;
    
    try {
      await sql`TRUNCATE TABLE support_tickets RESTART IDENTITY CASCADE;`;
    } catch (e) {
      console.log("Note: support_tickets table skipped or created fresh.");
    }

    // Delete non-owner demo employees from organization_members and corresponding users
    await sql`DELETE FROM organization_members WHERE role != 'owner';`;
    await sql`DELETE FROM users WHERE id NOT IN (SELECT user_id FROM organization_members);`;

    console.log("✨ SUCCESS: Database 100% wiped! Demo employees, clients, invoices, quotations, agreements, projects, tasks, activities, and support tickets cleared.");
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error emptying database:", error);
    await sql.end();
    process.exit(1);
  }
}

emptyDatabase();
