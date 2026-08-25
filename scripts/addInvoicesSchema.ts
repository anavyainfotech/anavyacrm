import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "";

async function run() {
  const sql = postgres(connectionString, { ssl: "require" });
  
  console.log("Creating invoices table in PostgreSQL...");

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      invoice_number TEXT NOT NULL,
      client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'Sent',
      issue_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      subtotal INTEGER NOT NULL DEFAULT 0,
      tax_total INTEGER NOT NULL DEFAULT 0,
      discount_total INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL DEFAULT 0,
      amount_paid INTEGER NOT NULL DEFAULT 0,
      amount_due INTEGER NOT NULL DEFAULT 0,
      payment_method TEXT,
      items TEXT NOT NULL DEFAULT '[]',
      notes TEXT,
      terms TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;

  console.log("Database table 'invoices' created successfully!");
  
  await sql.end();
  process.exit(0);
}

run();
