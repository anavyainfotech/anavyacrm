import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "";

async function run() {
  const sql = postgres(connectionString, { ssl: "require" });
  
  console.log("Creating projects & project_tasks tables in PostgreSQL...");

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      description TEXT,
      client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'In Progress',
      priority TEXT NOT NULL DEFAULT 'High',
      tech_stack TEXT,
      start_date TEXT,
      deadline TEXT,
      budget INTEGER DEFAULT 0,
      project_manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS project_tasks (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      task_code TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL DEFAULT 'Task',
      status TEXT NOT NULL DEFAULT 'To Do',
      priority TEXT NOT NULL DEFAULT 'Medium',
      assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      reporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      estimated_hours INTEGER DEFAULT 0,
      logged_hours INTEGER DEFAULT 0,
      due_date TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;

  console.log("Database tables 'projects' and 'project_tasks' created successfully!");
  
  await sql.end();
  process.exit(0);
}

run();
