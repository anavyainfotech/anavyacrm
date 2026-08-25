"use server";

import { db } from "@/lib/db";
import { projects, projectTasks, users, clients } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth/auth";
import { eq, desc, and } from "drizzle-orm";

export async function getProjectsAction() {
  try {
    const session = await auth();
    const orgId = (session?.user as any)?.orgId
      ? parseInt((session?.user as any).orgId, 10)
      : 1;

    const allProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        code: projects.code,
        description: projects.description,
        clientId: projects.clientId,
        clientName: clients.name,
        status: projects.status,
        priority: projects.priority,
        techStack: projects.techStack,
        startDate: projects.startDate,
        deadline: projects.deadline,
        budget: projects.budget,
        projectManagerId: projects.projectManagerId,
        projectManagerName: users.name,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .leftJoin(users, eq(projects.projectManagerId, users.id))
      .where(eq(projects.orgId, orgId))
      .orderBy(desc(projects.createdAt));

    const allTasks = await db
      .select({
        id: projectTasks.id,
        projectId: projectTasks.projectId,
        taskCode: projectTasks.taskCode,
        title: projectTasks.title,
        description: projectTasks.description,
        type: projectTasks.type,
        status: projectTasks.status,
        priority: projectTasks.priority,
        assigneeId: projectTasks.assigneeId,
        assigneeName: users.name,
        estimatedHours: projectTasks.estimatedHours,
        loggedHours: projectTasks.loggedHours,
        dueDate: projectTasks.dueDate,
        createdAt: projectTasks.createdAt,
      })
      .from(projectTasks)
      .leftJoin(users, eq(projectTasks.assigneeId, users.id))
      .orderBy(desc(projectTasks.createdAt));

    return { success: true, projects: allProjects, tasks: allTasks };
  } catch (error: any) {
    console.error("Failed to fetch projects:", error);
    return { success: false, error: error.message || "Failed to fetch projects" };
  }
}

export async function createProjectAction(formData: FormData) {
  try {
    const session = await auth();
    const orgId = (session?.user as any)?.orgId
      ? parseInt((session?.user as any).orgId, 10)
      : 1;

    const name = (formData.get("name") as string || "").trim();
    const code = (formData.get("code") as string || "").trim().toUpperCase();
    const description = (formData.get("description") as string || "").trim();
    const clientIdRaw = formData.get("clientId");
    const clientId = clientIdRaw ? parseInt(clientIdRaw as string, 10) : null;
    const status = (formData.get("status") as string) || "In Progress";
    const priority = (formData.get("priority") as string) || "High";
    const techStack = (formData.get("techStack") as string || "").trim();
    const startDate = (formData.get("startDate") as string || "").trim();
    const deadline = (formData.get("deadline") as string || "").trim();
    const budgetRaw = formData.get("budget");
    const budget = budgetRaw ? parseInt(budgetRaw as string, 10) : 0;
    const pmRaw = formData.get("projectManagerId");
    const projectManagerId = pmRaw ? parseInt(pmRaw as string, 10) : null;

    if (!name) return { success: false, error: "Project name is required" };
    if (!code) return { success: false, error: "Project code prefix is required (e.g. ANV, CRM)" };

    await db.insert(projects).values({
      name,
      code,
      description,
      clientId,
      status,
      priority,
      techStack,
      startDate,
      deadline,
      budget,
      projectManagerId,
      orgId,
    });

    revalidatePath("/projects");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create project:", error);
    return { success: false, error: error.message || "Failed to create project" };
  }
}

export async function updateProjectStatusAction(projectId: number, newStatus: string) {
  try {
    await db
      .update(projects)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(projects.id, projectId));

    revalidatePath("/projects");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createProjectTaskAction(formData: FormData) {
  try {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

    const projectIdRaw = formData.get("projectId");
    const projectId = projectIdRaw ? parseInt(projectIdRaw as string, 10) : null;
    if (!projectId) return { success: false, error: "Project selection is required" };

    // Fetch project code
    const [prj] = await db.select({ code: projects.code }).from(projects).where(eq(projects.id, projectId));
    const prjCode = prj?.code || "PRJ";

    const title = (formData.get("title") as string || "").trim();
    const description = (formData.get("description") as string || "").trim();
    const type = (formData.get("type") as string) || "Task"; // Bug, Story, Task, Improvement
    const status = (formData.get("status") as string) || "To Do"; // Backlog, To Do, In Progress, Code Review, Testing, Done
    const priority = (formData.get("priority") as string) || "Medium"; // Highest, High, Medium, Low
    const assigneeRaw = formData.get("assigneeId");
    const assigneeId = assigneeRaw ? parseInt(assigneeRaw as string, 10) : null;
    const estRaw = formData.get("estimatedHours");
    const estimatedHours = estRaw ? parseInt(estRaw as string, 10) : 0;
    const dueDate = (formData.get("dueDate") as string || "").trim();

    if (!title) return { success: false, error: "Task title is required" };

    // Generate Task Code (e.g. CRM-101)
    const taskCountRes = await db.select().from(projectTasks).where(eq(projectTasks.projectId, projectId));
    const taskCode = `${prjCode}-${taskCountRes.length + 101}`;

    await db.insert(projectTasks).values({
      projectId,
      taskCode,
      title,
      description,
      type,
      status,
      priority,
      assigneeId,
      reporterId: userId,
      estimatedHours,
      dueDate,
    });

    revalidatePath("/projects");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create task:", error);
    return { success: false, error: error.message || "Failed to create task" };
  }
}

export async function updateTaskStatusAction(taskId: number, newStatus: string) {
  try {
    await db
      .update(projectTasks)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(projectTasks.id, taskId));

    revalidatePath("/projects");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTaskAction(taskId: number) {
  try {
    await db.delete(projectTasks).where(eq(projectTasks.id, taskId));
    revalidatePath("/projects");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
