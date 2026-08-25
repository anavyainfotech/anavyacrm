import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "";

async function run() {
  console.log("Connecting to Database:", connectionString.split('@')[1] || "local");
  const sql = postgres(connectionString, { ssl: "require" });
  try {
    await sql`
      ALTER TABLE organization_members 
      ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
    `;
    await sql`
      ALTER TABLE organization_members 
      ADD COLUMN IF NOT EXISTS target_conversions integer DEFAULT 0;
    `;
    await sql`
      ALTER TABLE organization_members 
      ADD COLUMN IF NOT EXISTS target_revenue integer DEFAULT 0;
    `;
    await sql`
      ALTER TABLE organization_members 
      ADD COLUMN IF NOT EXISTS commission_rate integer DEFAULT 0;
    `;
    await sql`
      ALTER TABLE organization_members 
      ADD COLUMN IF NOT EXISTS shift_start text DEFAULT '09:00';
    `;
    await sql`
      ALTER TABLE organization_members 
      ADD COLUMN IF NOT EXISTS shift_end text DEFAULT '18:00';
    `;
    console.log("Database schema updated successfully!");
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("Failed to update database schema:", error);
    process.exit(1);
  }
}

run();
