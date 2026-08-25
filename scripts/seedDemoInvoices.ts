import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "";

async function run() {
  const sql = postgres(connectionString, { ssl: "require" });
  
  console.log("Seeding demo GST Tax Invoices into PostgreSQL...");

  const orgs = await sql`SELECT id FROM organizations LIMIT 1`;
  const orgId = orgs.length > 0 ? orgs[0].id : 1;

  const usersList = await sql`SELECT id FROM users LIMIT 1`;
  const userId = usersList.length > 0 ? usersList[0].id : 1;

  const clientsList = await sql`SELECT id, name FROM clients LIMIT 2`;
  if (clientsList.length === 0) {
    console.log("No clients found to link invoices");
    process.exit(0);
  }

  const client1Id = clientsList[0].id;
  const client2Id = clientsList.length > 1 ? clientsList[1].id : client1Id;

  // Insert Demo Invoice 1 (Paid)
  await sql`
    INSERT INTO invoices (
      invoice_number, client_id, user_id, org_id, status, issue_date, due_date,
      subtotal, tax_total, discount_total, total, amount_paid, amount_due,
      payment_method, items, notes, terms
    ) VALUES (
      'INV-2026-001', ${client1Id}, ${userId}, ${orgId}, 'Paid', '2026-08-01', '2026-08-15',
      100000, 18000, 0, 118000, 118000, 0,
      'Bank Transfer',
      '[{"description":"Enterprise Software CRM & ERP License","hsnCode":"998314","quantity":1,"rate":100000,"taxRate":18,"discount":0}]',
      'Bank: HDFC Bank | A/C: 50200012345678 | IFSC: HDFC0001234 | UPI: geetanjali@hdfcbank',
      'Payment due within 15 days of invoice date.'
    );
  `;

  // Insert Demo Invoice 2 (Partially Paid)
  await sql`
    INSERT INTO invoices (
      invoice_number, client_id, user_id, org_id, status, issue_date, due_date,
      subtotal, tax_total, discount_total, total, amount_paid, amount_due,
      payment_method, items, notes, terms
    ) VALUES (
      'INV-2026-002', ${client2Id}, ${userId}, ${orgId}, 'Partially Paid', '2026-08-10', '2026-08-25',
      150000, 27000, 5000, 172000, 72000, 100000,
      'UPI',
      '[{"description":"Custom E-Commerce Development & Mobile App Integration","hsnCode":"998314","quantity":1,"rate":150000,"taxRate":18,"discount":5000}]',
      'Bank: HDFC Bank | A/C: 50200012345678 | IFSC: HDFC0001234 | UPI: geetanjali@hdfcbank',
      'Payment due within 15 days of invoice date.'
    );
  `;

  console.log("Demo GST Tax Invoices seeded successfully!");

  await sql.end();
  process.exit(0);
}

run();
