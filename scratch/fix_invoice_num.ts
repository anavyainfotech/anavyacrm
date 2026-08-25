import { db } from "../src/lib/db";
import { invoices } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  await db
    .update(invoices)
    .set({ invoiceNumber: "INV-2026-002" })
    .where(eq(invoices.invoiceNumber, "INV-2026-102"));
  console.log("Invoice number successfully updated to INV-2026-002");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
