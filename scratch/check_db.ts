import { db } from "../src/lib/db";
import { clients } from "../src/lib/db/schema";

async function run() {
  const allClients = await db.select().from(clients);
  console.log("Clients in DB:", allClients);
  process.exit(0);
}

run().catch(console.error);
