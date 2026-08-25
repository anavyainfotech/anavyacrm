import { sql } from "drizzle-orm";
import { db } from "../src/lib/db";

async function run() {
  try {
    console.log("Creating quotations table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS quotations (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'Draft',
        subtotal INTEGER NOT NULL DEFAULT 0,
        tax_total INTEGER NOT NULL DEFAULT 0,
        total INTEGER NOT NULL DEFAULT 0,
        items TEXT NOT NULL DEFAULT '[]',
        terms TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Quotations table created!");
  } catch (err) {
    console.error("Migration failed:", err);
  }
  process.exit(0);
}

run();
