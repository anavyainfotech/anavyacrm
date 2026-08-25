import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/geetanjali_crm";
const client = postgres(connectionString, { prepare: false });

async function resetSequences() {
  console.log("Resetting sequences...");
  try {
    // Truncate tables and restart identity (serial IDs) from 1
    await client`TRUNCATE TABLE "quotations" RESTART IDENTITY CASCADE;`;
    await client`TRUNCATE TABLE "agreements" RESTART IDENTITY CASCADE;`;
    
    console.log("Sequences reset to 1 successfully!");
  } catch (error) {
    console.error("Failed to reset sequences:", error);
  } finally {
    process.exit(0);
  }
}

resetSequences();
