import { config } from "dotenv";
config();

import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_p3yvCBaeX9OG@ep-divine-night-azj4zlkh.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const sql = postgres(connectionString, { ssl: "require" });

async function seedNakulProperties() {
  console.log("🚀 Inserting Real Client: Nakul Properties & Tax Invoice into Anavya CRM...");

  try {
    // 1. Get Founder / Owner User ID
    const users = await sql`SELECT id FROM users LIMIT 1;`;
    const userId = users[0]?.id || 1;
    
    const orgs = await sql`SELECT id FROM organizations LIMIT 1;`;
    const orgId = orgs[0]?.id || 1;

    // 2. Insert Client: Nakul Properties
    const [client] = await sql`
      INSERT INTO clients (
        org_id,
        name,
        email,
        phone,
        company,
        requirement,
        notes,
        status,
        ai_score,
        assigned_to,
        source,
        created_at,
        updated_at
      ) VALUES (
        ${orgId},
        'Nakul Properties',
        'contact@nakulproperties.com',
        '9811548267',
        'Nakul Properties (Real Estate)',
        'Website Development & SEO Growth',
        'Client converted on 29 July 2026. Total payment ₹10,000 received via UPI (Includes 18% GST).',
        'Won',
        98,
        ${userId},
        'Direct Client Referral',
        '2026-07-29T10:00:00.000Z',
        '2026-07-29T10:00:00.000Z'
      ) RETURNING id;
    `;

    const clientId = client.id;
    console.log(`✅ Client Nakul Properties inserted with ID: ${clientId}`);

    // 3. Insert GST Tax Invoice
    const lineItems = JSON.stringify([
      {
        description: "Real Estate Website Development & Setup",
        quantity: 1,
        rate: 5000,
        taxRate: 18,
        discount: 0,
        amount: 5900
      },
      {
        description: "Real Estate SEO Growth & Optimization Package",
        quantity: 1,
        rate: 3475,
        taxRate: 18,
        discount: 0,
        amount: 4100
      }
    ]);

    const invoiceNumber = "INV-2026-001";
    const subtotal = 8475;
    const taxTotal = 1525;
    const total = 10000;
    const amountPaid = 10000;
    const amountDue = 0;
    const issueDate = "2026-07-29";
    const dueDate = "2026-07-29";
    const paymentMethod = "UPI";
    const notes = "Bank: State Bank of India (SBI) | A/C: 43997234173 | IFSC: SBIN0003101 | UPI: 6201231875@pthdfc";
    const terms = "Payment received in full via UPI on 29 July 2026. Thank you for your business!";

    const [invoice] = await sql`
      INSERT INTO invoices (
        invoice_number,
        client_id,
        user_id,
        org_id,
        status,
        issue_date,
        due_date,
        subtotal,
        tax_total,
        discount_total,
        total,
        amount_paid,
        amount_due,
        payment_method,
        items,
        notes,
        terms,
        created_at,
        updated_at
      ) VALUES (
        ${invoiceNumber},
        ${clientId},
        ${userId},
        ${orgId},
        'Paid',
        ${issueDate},
        ${dueDate},
        ${subtotal},
        ${taxTotal},
        0,
        ${total},
        ${amountPaid},
        ${amountDue},
        ${paymentMethod},
        ${lineItems},
        ${notes},
        ${terms},
        '2026-07-29T10:30:00.000Z',
        '2026-07-29T10:30:00.000Z'
      ) RETURNING id;
    `;

    console.log(`✅ GST Tax Invoice ${invoiceNumber} created with ID: ${invoice.id}`);

    // 4. Insert Lead Activities
    await sql`
      INSERT INTO lead_activities (
        client_id,
        user_id,
        type,
        content,
        created_at
      ) VALUES 
      (
        ${clientId},
        ${userId},
        'Deal Won',
        '🎉 Deal Won! Nakul Properties converted on 29 July 2026 for Website Development & SEO Growth.',
        '2026-07-29T10:00:00.000Z'
      ),
      (
        ${clientId},
        ${userId},
        'Payment Received',
        '💳 Payment Received: ₹10,000 full payment received via UPI (Includes 18% GST). Invoice INV-2026-001 generated.',
        '2026-07-29T10:30:00.000Z'
      );
    `;

    console.log("✨ SUCCESS: Nakul Properties client, GST Tax Invoice INV-2026-001 (₹10,000 Paid via UPI), and timeline logs added!");
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding Nakul Properties:", error);
    await sql.end();
    process.exit(1);
  }
}

seedNakulProperties();
