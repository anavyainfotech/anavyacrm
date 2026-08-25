import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "";

async function run() {
  const sql = postgres(connectionString, { ssl: "require" });
  
  console.log("Seeding demo Jira Project & Tasks into PostgreSQL...");

  // Fetch org_id from organizations
  const orgs = await sql`SELECT id FROM organizations LIMIT 1`;
  const orgId = orgs.length > 0 ? orgs[0].id : 1;

  // Fetch a client
  const clientsList = await sql`SELECT id, name FROM clients LIMIT 1`;
  const clientId = clientsList.length > 0 ? clientsList[0].id : null;

  // Fetch users
  const usersList = await sql`SELECT id, name FROM users ORDER BY id ASC`;
  const pmId = usersList.length > 0 ? usersList[0].id : 1;
  const devId = usersList.length > 1 ? usersList[1].id : pmId;

  // Insert Demo Project
  const insertedProjects = await sql`
    INSERT INTO projects (
      name, code, description, client_id, status, priority, 
      tech_stack, start_date, deadline, budget, project_manager_id, org_id
    ) VALUES (
      'Geetanjali Enterprise Portal & Mobile App',
      'ANV',
      'Full-stack Next.js ERP & CRM suite with PostgreSQL database, real-time lead routing, and mobile app integration.',
      ${clientId},
      'In Progress',
      'High',
      'Next.js 16, PostgreSQL, TailwindCSS, TypeScript',
      '2026-08-01',
      '2026-09-15',
      150000,
      ${pmId},
      ${orgId}
    ) RETURNING id, name, code;
  `;

  const prjId = insertedProjects[0].id;
  console.log(`Created Project: ${insertedProjects[0].name} (ID: ${prjId})`);

  // Insert Demo Tasks & Bugs
  const demoTasks = [
    {
      taskCode: "ANV-101",
      title: "🐞 Fix Payment Gateway Null Pointer Exception in Checkout",
      description: "Checkout fails when client pays via Razorpay webhook due to missing transaction ID payload.",
      type: "Bug",
      status: "In Progress",
      priority: "Highest",
      assigneeId: devId,
      estimatedHours: 4,
    },
    {
      taskCode: "ANV-102",
      title: "📖 Build Client Quotation & Invoice PDF Export Engine",
      description: "Allow Sales Executives to generate downloadable GST compliant PDF quotations directly from CRM.",
      type: "Story",
      status: "Testing",
      priority: "High",
      assigneeId: pmId,
      estimatedHours: 8,
    },
    {
      taskCode: "ANV-103",
      title: "🛠️ Optimize PostgreSQL Database Indexing & Connection Pooling",
      description: "Add index on client_id and created_at columns for faster query execution times.",
      type: "Task",
      status: "Done",
      priority: "Medium",
      assigneeId: devId,
      estimatedHours: 3,
    },
    {
      taskCode: "ANV-104",
      title: "⚡ Redesign Team Directory Mobile Responsiveness",
      description: "Ensure team filter tabs and employee cards adjust smoothly on iOS and Android viewports.",
      type: "Improvement",
      status: "To Do",
      priority: "Medium",
      assigneeId: devId,
      estimatedHours: 5,
    },
    {
      taskCode: "ANV-105",
      title: "🐞 Fix WhatsApp Direct API Message Special Character Encoding",
      description: "Special characters like & and + get stripped out when launching WhatsApp Web URL.",
      type: "Bug",
      status: "Backlog",
      priority: "High",
      assigneeId: pmId,
      estimatedHours: 2,
    },
  ];

  for (const t of demoTasks) {
    await sql`
      INSERT INTO project_tasks (
        project_id, task_code, title, description, type, status, priority, 
        assignee_id, reporter_id, estimated_hours, due_date
      ) VALUES (
        ${prjId}, ${t.taskCode}, ${t.title}, ${t.description}, ${t.type}, 
        ${t.status}, ${t.priority}, ${t.assigneeId}, ${pmId}, ${t.estimatedHours}, '2026-08-30'
      );
    `;
  }

  console.log(`Successfully seeded ${demoTasks.length} tasks/bugs for Project ANV!`);

  await sql.end();
  process.exit(0);
}

run();
