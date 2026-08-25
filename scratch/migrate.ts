import { sql } from "drizzle-orm";
import { db } from "../src/lib/db";

async function run() {
  try {
    console.log("Adding assigned_to column...");
    await db.execute(sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL;`);
    
    console.log("Creating lead_activities table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS lead_activities (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL DEFAULT 'Note',
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log("Migrations applied successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  }
  process.exit(0);
}

run();
