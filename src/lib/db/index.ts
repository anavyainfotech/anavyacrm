import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_p3yvCBaeX9OG@ep-divine-night-azj4zlkh.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);
