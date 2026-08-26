import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Running migration for custom_fields table & clients.custom_fields_data column...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS custom_fields (
      id SERIAL PRIMARY KEY,
      org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      module TEXT NOT NULL DEFAULT 'leads',
      field_name TEXT NOT NULL,
      field_label TEXT NOT NULL,
      field_type TEXT NOT NULL DEFAULT 'text',
      options TEXT DEFAULT '[]',
      is_required TEXT DEFAULT 'false',
      industry_type TEXT DEFAULT 'General',
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  await db.execute(sql`
    ALTER TABLE clients 
    ADD COLUMN IF NOT EXISTS custom_fields_data TEXT DEFAULT '{}';
  `);

  console.log("Migration executed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
