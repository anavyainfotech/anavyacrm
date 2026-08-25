import { db } from "../src/lib/db";
import { clients } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  console.log("Updating old leads with status 'New' to 'New Lead'...");
  const res = await db.update(clients).set({ status: "New Lead" }).where(eq(clients.status, "New"));
  console.log("Updated!");
  process.exit(0);
}

run().catch(console.error);
