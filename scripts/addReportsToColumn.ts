import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "";

async function run() {
  const sql = postgres(connectionString, { ssl: "require" });
  
  console.log("Adding reports_to_id column to organization_members table...");
  await sql`
    ALTER TABLE organization_members 
    ADD COLUMN IF NOT EXISTS reports_to_id INTEGER;
  `;
  console.log("Schema updated successfully! reports_to_id added.");
  
  await sql.end();
  process.exit(0);
}

run();
