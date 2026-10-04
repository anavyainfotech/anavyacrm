import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/db/schema";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function checkQuotation3() {
  const queryClient = postgres(process.env.DATABASE_URL!);
  const db = drizzle(queryClient, { schema });
  
  try {
    const allQuotations = await db.query.quotations.findMany();
    console.log("All Quotations:", allQuotations);
  } catch (error) {
    console.error("Error fetching quotations:", error);
  } finally {
    await queryClient.end();
  }
}

checkQuotation3();
