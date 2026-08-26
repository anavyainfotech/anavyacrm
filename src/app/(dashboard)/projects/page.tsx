export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth/auth";
import { getProjectsAction } from "@/features/projects/actions";
import { getTeamMembersAction } from "@/features/team/actions";
import ProjectsView from "./ProjectsView";

export default async function ProjectsPage() {
  const session = await auth();
  const user = session?.user as any;
  const currentUserRole = user?.role || "owner";

  let projectsList: any[] = [];
  let tasksList: any[] = [];
  let clientsList: any[] = [];
  let teamMembers: any[] = [];

  try {
    const projectsRes = await getProjectsAction();
    if (projectsRes.success) {
      projectsList = projectsRes.projects || [];
      tasksList = projectsRes.tasks || [];
    }

    const teamRes = await getTeamMembersAction();
    if (teamRes.members) {
      teamMembers = teamRes.members;
    }

    const orgId = user?.orgId ? parseInt(user.orgId, 10) : 1;

    clientsList = await db
      .select({ id: clients.id, name: clients.name, company: clients.company })
      .from(clients)
      .where(eq(clients.orgId, orgId));
  } catch (error) {
    console.error("Failed to load projects page data:", error);
  }

  return (
    <ProjectsView
      initialProjects={projectsList}
      initialTasks={tasksList}
      clientsList={clientsList}
      teamMembers={teamMembers}
      currentUserRole={currentUserRole}
    />
  );
}
