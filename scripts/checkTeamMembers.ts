import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "";

async function run() {
  const sql = postgres(connectionString, { ssl: "require" });
  const members = await sql`
    SELECT om.id, om.role, om.designation, om.department, u.name, u.email 
    FROM organization_members om 
    JOIN users u ON om.user_id = u.id
  `;
  console.log("Team Members in DB:", JSON.stringify(members, null, 2));
  await sql.end();
  process.exit(0);
}

run();
