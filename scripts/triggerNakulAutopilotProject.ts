import { config } from "dotenv";
config();

import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_p3yvCBaeX9OG@ep-divine-night-azj4zlkh.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const sql = postgres(connectionString, { ssl: "require" });

async function triggerNakulAutopilot() {
  console.log("🤖 Running Autopilot: Creating Active Project & Tasks for Nakul Properties...");

  try {
    // 1. Get Client ID for Nakul Properties
    const clients = await sql`SELECT id, name, company, requirement, org_id FROM clients WHERE name = 'Nakul Properties' LIMIT 1;`;
    if (clients.length === 0) {
      console.error("Client Nakul Properties not found!");
      process.exit(1);
    }

    const client = clients[0];
    const clientId = client.id;
    const orgId = client.org_id || 1;

    // 2. Check existing projects
    const existingProjects = await sql`SELECT id FROM projects WHERE client_id = ${clientId};`;
    if (existingProjects.length > 0) {
      console.log("Project already exists for Nakul Properties!");
      await sql.end();
      process.exit(0);
    }

    // 3. Create Autopilot Active Project
    const projectName = "Nakul Properties — Website Development & SEO Growth";
    const projectCode = "ANV-PRJ-001";

    const [project] = await sql`
      INSERT INTO projects (
        name,
        code,
        description,
        client_id,
        status,
        priority,
        tech_stack,
        budget,
        org_id,
        created_at,
        updated_at
      ) VALUES (
        ${projectName},
        ${projectCode},
        'Automated Autopilot project generated upon full ₹10,000 UPI payment for Nakul Properties. Scope: Website Development & Real Estate SEO Growth.',
        ${clientId},
        'In Progress',
        'High',
        'Next.js, Tailwind CSS, Technical SEO, Node.js',
        10000,
        ${orgId},
        '2026-07-29T11:00:00.000Z',
        '2026-07-29T11:00:00.000Z'
      ) RETURNING id;
    `;

    const projectId = project.id;
    console.log(`✅ Autopilot Project created with ID: ${projectId} (${projectName})`);

    // 4. Create Milestone Project Tasks
    await sql`
      INSERT INTO project_tasks (
        project_id,
        task_code,
        title,
        description,
        type,
        status,
        priority,
        estimated_hours,
        created_at,
        updated_at
      ) VALUES 
      (
        ${projectId},
        'ANV-101',
        'Website Architecture, Wireframes & UI Setup',
        'Real estate website wireframes, responsive mobile layout, and brand color alignment.',
        'Task',
        'In Progress',
        'High',
        12,
        '2026-07-29T11:30:00.000Z',
        '2026-07-29T11:30:00.000Z'
      ),
      (
        ${projectId},
        'ANV-102',
        'Frontend Development & Property Listing Components',
        'Building Next.js pages, interactive property cards, and lead contact forms.',
        'Task',
        'To Do',
        'High',
        20,
        '2026-07-29T11:30:00.000Z',
        '2026-07-29T11:30:00.000Z'
      ),
      (
        ${projectId},
        'ANV-103',
        'Real Estate SEO Audit, Keywords & Schema Markup',
        'On-page SEO optimization for Faridabad real estate search keywords, schema tags, and meta titles.',
        'Improvement',
        'To Do',
        'Medium',
        10,
        '2026-07-29T11:30:00.000Z',
        '2026-07-29T11:30:00.000Z'
      ),
      (
        ${projectId},
        'ANV-104',
        'Domain DNS Setup, SSL & Production Launch',
        'Domain mapping, SSL certificate activation, and Google Search Console indexing.',
        'Task',
        'To Do',
        'Highest',
        8,
        '2026-07-29T11:30:00.000Z',
        '2026-07-29T11:30:00.000Z'
      );
    `;

    console.log("✨ SUCCESS: Autopilot Project & 4 Sprint Tasks added to Projects Board!");
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error running Autopilot project script:", error);
    await sql.end();
    process.exit(1);
  }
}

triggerNakulAutopilot();
