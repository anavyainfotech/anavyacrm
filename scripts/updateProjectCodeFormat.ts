import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "";

async function run() {
  const sql = postgres(connectionString, { ssl: "require" });
  
  console.log("Updating project code to ANV-PRJ-001 format in PostgreSQL...");

  // Update existing project code
  await sql`
    UPDATE projects 
    SET code = 'ANV-PRJ-001' 
    WHERE code = 'ANV' OR code = 'PRJ';
  `;

  // Update task codes for this project
  const tasks = await sql`
    SELECT id, task_code FROM project_tasks;
  `;

  for (let i = 0; i < tasks.length; i++) {
    const newCode = `ANV-PRJ-001-${101 + i}`;
    await sql`
      UPDATE project_tasks 
      SET task_code = ${newCode} 
      WHERE id = ${tasks[i].id};
    `;
  }

  console.log("Project code updated to ANV-PRJ-001 and tasks formatted successfully!");

  await sql.end();
  process.exit(0);
}

run();
