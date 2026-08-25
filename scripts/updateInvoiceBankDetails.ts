import { config } from "dotenv";
config();

import { db } from "../src/lib/db";
import { invoices } from "../src/lib/db/schema";

async function main() {
  console.log("Updating all existing DB invoices with official SBI Bank details...");
  
  await db.update(invoices).set({
    notes: "Bank: State Bank of India (SBI) | A/C: 43997234173 | IFSC: SBIN0003101 | UPI: 6201231875@PTHDFC"
  });

  console.log("✅ Successfully updated all database invoices with SBI Account 43997234173 and IFSC SBIN0003101!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
