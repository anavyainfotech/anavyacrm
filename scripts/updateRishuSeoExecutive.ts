import { config } from "dotenv";
config();

import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_p3yvCBaeX9OG@ep-divine-night-azj4zlkh.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const sql = postgres(connectionString, { ssl: "require" });

async function updateRishu() {
  console.log("👔 Updating Rishu Kumar Tiwari's Employee Profile to SEO Executive...");

  try {
    const rishuUsers = await sql`SELECT id, name FROM users WHERE name ILIKE '%Rishu%' LIMIT 1;`;
    if (rishuUsers.length === 0) {
      console.error("Rishu user not found!");
      process.exit(1);
    }
    const rishuId = rishuUsers[0].id;

    await sql`
      UPDATE organization_members
      SET 
        designation = 'SEO Executive',
        department = 'SEO & Digital Growth',
        employment_type = 'Full-Time',
        work_location = 'Office',
        role = 'executive',
        status = 'active'
      WHERE user_id = ${rishuId};
    `;

    console.log("✨ SUCCESS: Rishu Kumar Tiwari is now registered as an Active Employee with SEO Executive role!");
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating Rishu employee profile:", error);
    await sql.end();
    process.exit(1);
  }
}

updateRishu();
