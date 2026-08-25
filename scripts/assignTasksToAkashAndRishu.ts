import { config } from "dotenv";
config();

import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_p3yvCBaeX9OG@ep-divine-night-azj4zlkh.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const sql = postgres(connectionString, { ssl: "require" });

async function assignTasks() {
  console.log("👤 Assigning Nakul Properties Project Tasks to Akash Kumar & Rishu Kumar Tiwari...");

  try {
    // 1. Get Akash Kumar User Record
    const akashUsers = await sql`SELECT id, name FROM users WHERE name ILIKE '%Akash%' LIMIT 1;`;
    if (akashUsers.length === 0) {
      console.error("Akash Kumar user record not found!");
      process.exit(1);
    }
    const akashId = akashUsers[0].id;
    console.log(`✅ Akash Kumar User ID: ${akashId}`);

    // 2. Ensure Rishu Kumar Tiwari exists in users & organization_members
    let rishuId: number;
    const rishuUsers = await sql`SELECT id, name FROM users WHERE name ILIKE '%Rishu%' LIMIT 1;`;

    if (rishuUsers.length > 0) {
      rishuId = rishuUsers[0].id;
      console.log(`✅ Found existing Rishu Kumar Tiwari User ID: ${rishuId}`);
    } else {
      const orgs = await sql`SELECT id FROM organizations LIMIT 1;`;
      const orgId = orgs[0]?.id || 1;

      const [newRishu] = await sql`
        INSERT INTO users (
          name,
          email,
          password,
          created_at
        ) VALUES (
          'Rishu Kumar Tiwari',
          'rishu@anavyainfotech.com',
          '$2a$10$wK1W2mG7.Xv8x.9K.Lp5O.X7v0m1Z2Y3X4W5V6U7T8S9R0P1Q2O3',
          NOW()
        ) RETURNING id;
      `;

      rishuId = newRishu.id;

      await sql`
        INSERT INTO organization_members (
          organization_id,
          user_id,
          member_code,
          designation,
          department,
          employment_type,
          work_location,
          role,
          status
        ) VALUES (
          ${orgId},
          ${rishuId},
          'AI-TM-002',
          'SEO & Technical Growth Specialist',
          'SEO & Digital Growth',
          'Full-Time',
          'Office',
          'executive',
          'active'
        );
      `;

      console.log(`✅ Created Rishu Kumar Tiwari Team Record with User ID: ${rishuId}`);
    }

    // 3. Assign Website Tasks to Akash Kumar
    await sql`
      UPDATE project_tasks
      SET assignee_id = ${akashId}, reporter_id = ${akashId}, updated_at = NOW()
      WHERE task_code IN ('ANV-101', 'ANV-102', 'ANV-104');
    `;
    console.log("⚡ Website Development Tasks (ANV-101, ANV-102, ANV-104) assigned to Akash Kumar!");

    // 4. Assign SEO Tasks to Rishu Kumar Tiwari
    await sql`
      UPDATE project_tasks
      SET assignee_id = ${rishuId}, reporter_id = ${akashId}, updated_at = NOW()
      WHERE task_code = 'ANV-103';
    `;
    console.log("🔍 SEO Growth Task (ANV-103: Real Estate SEO Audit & Keywords) assigned to Rishu Kumar Tiwari!");

    console.log("✨ SUCCESS: All Website tasks assigned to Akash Kumar and SEO tasks assigned to Rishu Kumar Tiwari!");
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error assigning tasks:", error);
    await sql.end();
    process.exit(1);
  }
}

assignTasks();
