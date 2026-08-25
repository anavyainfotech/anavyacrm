import { db } from "@/lib/db";
import { projects, projectTasks, clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function triggerAutopilotProjectCreation(clientId: number, budgetAmount: number) {
  try {
    // 1. Fetch Client Details
    const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
    if (!client) return { success: false, error: "Client not found" };

    // 2. Check if project already exists for this client
    const existingProjects = await db.select().from(projects).where(eq(projects.clientId, clientId));
    if (existingProjects.length > 0) {
      return { success: true, message: "Project already exists", project: existingProjects[0] };
    }

    // 3. Create Autopilot Active Project
    const projectName = `${client.company || client.name} — ${client.requirement || "Client Delivery Project"}`;
    const projectCode = `ANV-PRJ-${clientId.toString().padStart(3, "0")}`;

    const [newProject] = await db
      .insert(projects)
      .values({
        name: projectName,
        code: projectCode,
        description: `Automated Autopilot project generated upon full invoice payment for ${client.name}. Scope: ${client.requirement || "Web & SEO Growth"}.`,
        clientId: client.id,
        status: "In Progress",
        priority: "High",
        techStack: "Next.js, Tailwind CSS, Technical SEO, Node.js",
        budget: budgetAmount || 10000,
        orgId: client.orgId || 1,
      })
      .returning();

    // 4. Create Default Milestone Project Tasks
    const defaultTasks = [
      {
        taskCode: `${projectCode}-101`,
        title: "Website Architecture, Design Wireframes & Layout Setup",
        description: "Initial client branding alignment, UI design mockups, and mobile responsive structure.",
        type: "Task",
        status: "In Progress",
        priority: "High",
        estimatedHours: 12,
      },
      {
        taskCode: `${projectCode}-102`,
        title: "Frontend Codebase Implementation & Interactivity",
        description: "Building Next.js components, lead capture forms, and dynamic UI elements.",
        type: "Task",
        status: "To Do",
        priority: "High",
        estimatedHours: 20,
      },
      {
        taskCode: `${projectCode}-103`,
        title: "Technical Real Estate SEO Audit & Keyword Optimization",
        description: "On-page SEO optimization, Meta Title/Description tags, schema markup, and speed audit.",
        type: "Improvement",
        status: "To Do",
        priority: "Medium",
        estimatedHours: 10,
      },
      {
        taskCode: `${projectCode}-104`,
        title: "Domain DNS Setup, Cloudflare SSL & Final Launch",
        description: "Final client review, domain mapping, Google Search Console indexing, and production deployment.",
        type: "Task",
        status: "To Do",
        priority: "Highest",
        estimatedHours: 8,
      },
    ];

    for (const task of defaultTasks) {
      await db.insert(projectTasks).values({
        projectId: newProject.id,
        taskCode: task.taskCode,
        title: task.title,
        description: task.description,
        type: task.type,
        status: task.status,
        priority: task.priority,
        estimatedHours: task.estimatedHours,
      });
    }

    console.log(`🤖 Autopilot Created Active Project: ${projectName} with 4 Tasks!`);
    return { success: true, project: newProject };
  } catch (error: any) {
    console.error("Autopilot project creation error:", error);
    return { success: false, error: error.message };
  }
}
