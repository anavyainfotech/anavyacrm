import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/geetanjali_crm";
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

async function migrate() {
  console.log("Creating agreements table...");
  try {
    await client`
      CREATE TABLE IF NOT EXISTS "agreements" (
        "id" serial PRIMARY KEY NOT NULL,
        "client_id" integer NOT NULL,
        "user_id" integer NOT NULL,
        "status" text DEFAULT 'Draft' NOT NULL,
        "content" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    
    // Add foreign keys
    try {
      await client`ALTER TABLE "agreements" ADD CONSTRAINT "agreements_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;`;
    } catch (e: any) {
      if (!e.message.includes('already exists')) console.warn(e.message);
    }
    
    try {
      await client`ALTER TABLE "agreements" ADD CONSTRAINT "agreements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;`;
    } catch (e: any) {
      if (!e.message.includes('already exists')) console.warn(e.message);
    }
    
    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

migrate();
