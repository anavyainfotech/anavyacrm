import { db } from "../src/lib/db";
import { quotations } from "../src/lib/db/schema";
import { sql } from "drizzle-orm";

async function test() {
  try {
    const res = await db.insert(quotations).values({
      clientId: 1,
      userId: 1,
      items: "[]",
      subtotal: 0,
      taxTotal: 0,
      total: 0,
      status: "Sent"
    }).returning();
    console.log("Success:", res);
  } catch (e: any) {
    console.error("Error inserting quotation:", e.message);
  }
  process.exit(0);
}
test();
