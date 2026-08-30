export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth/auth";
import { getProjectsAction } from "@/features/projects/actions";
import { getTeamMembersAction } from "@/features/team/actions";
import ProjectsView from "./ProjectsView";

import { hasPermission } from "@/lib/permissions";

export default async function ProjectsPage() {
  const session = await auth();
  const user = session?.user as any;
  const currentUserRole = user?.role || "owner";

  if (!hasPermission(user?.role, user?.permissions, "canViewProjects")) {
    return (
      <div className="py-12 text-center bg-white rounded-sm border border-gray-200 p-8 my-6">
        <h2 className="text-lg font-bold text-gray-900">Access Denied</h2>
        <p className="text-sm text-gray-500 mt-1">You do not have permission to view projects or tasks.</p>
      </div>
    );
  }

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
