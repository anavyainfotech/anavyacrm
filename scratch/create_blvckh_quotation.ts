import { db } from '../src/lib/db';
import { clients, quotations, users, organizations } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  // get user and org
  const userList = await db.select().from(users).limit(1);
  if (!userList.length) throw new Error("No users found");
  const user = userList[0];

  const orgList = await db.select().from(organizations).limit(1);
  if (!orgList.length) throw new Error("No orgs found");
  const org = orgList[0];

  // check if client exists
  const existingClient = await db.select().from(clients).where(eq(clients.email, "heemangshu.bakshi@gmail.com")).limit(1);
  let clientId = existingClient[0]?.id;

  if (!clientId) {
    const newClient = await db.insert(clients).values({
      name: "Hemangshu Bakshi",
      company: "BLVCK H — Unisex Salon",
      whatsapp: "+91 98738 38352",
      phone: "+91 98738 38352",
      email: "heemangshu.bakshi@gmail.com",
      orgId: org.id,
      assignedTo: user.id,
      status: "First Contact",
      source: "Website"
    }).returning({ id: clients.id });
    clientId = newClient[0].id;
  }

  const items = [
    { name: "5-Page Website (Home, Services, Gallery, About, Contact)", qty: 1, price: 4999, tax: 0 },
    { name: "Custom premium design — mobile responsive", qty: 1, price: 0, tax: 0 },
    { name: "WhatsApp booking integration", qty: 1, price: 0, tax: 0 },
    { name: "Google Maps integration", qty: 1, price: 0, tax: 0 },
    { name: "Hosting setup & configuration", qty: 1, price: 0, tax: 0 },
    { name: "2 rounds of design revisions", qty: 1, price: 0, tax: 0 }
  ];

  const terms = {
    introMessage: "Dear Hemangshu, thank you for the opportunity to work with BLVCK H. Below is our proposal for a premium website built to convert visitors into walk-in bookings.",
    scopeOfWork: [
      "Discovery → Design → Development → Testing → Launch. We understand your brand and clientele, design the visual identity, build a fast mobile-responsive site, test it across devices, then publish it live."
    ],
    complimentary: [
      "▸ Basic on-page SEO setup",
      "▸ SSL security certificate",
      "▸ Google Analytics setup",
      "▸ 30 days free support & bug-fixes",
      "Note: Covers on-page SEO only. Ongoing local SEO & Google Business ranking is a separate monthly service."
    ],
    timelineAndTerms: [
      { label: "Time Needed", value: "10–14 days from the date we receive your content (photos, service list, staff details)." },
      { label: "Payment Terms", value: "50% advance → 25% on design approval → 25% before launch" },
      { label: "Validity", value: "This quotation is valid for 15 days from the date above." }
    ],
    notIncluded: "▸ Domain name registration (client provides)\n▸ Custom/stock photography purchase\n▸ Ongoing local SEO (available separately)\n▸ New features beyond scope, quoted separately"
  };

  const newQuotation = await db.insert(quotations).values({
    clientId,
    userId: user.id,
    status: "Draft",
    subtotal: 4999,
    taxTotal: 0,
    total: 4999,
    items: JSON.stringify(items),
    terms: JSON.stringify(terms),
    createdAt: new Date("2026-07-16T10:00:00Z")
  }).returning({ id: quotations.id });

  console.log("Created quotation with ID:", newQuotation[0].id);
  process.exit(0);
}
main().catch(console.error);
