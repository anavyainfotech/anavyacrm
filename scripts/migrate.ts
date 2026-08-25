import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "";

async function runMigration() {
  console.log("Running migration...");
  try {
    const migrationClient = postgres(connectionString, { max: 1, prepare: false });
    const db = drizzle(migrationClient);

    await migrate(db, { migrationsFolder: "./src/lib/db/migrations" });

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
