export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { db } from "@/lib/db";
import { clients, leadActivities, users, invoices, projects, projectTasks } from "@/lib/db/schema";
import { auth } from "@/auth/auth";
import { eq, sql, and, desc, ne } from "drizzle-orm";
import { getTeamMembersAction } from "@/features/team/actions";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as any;
  const userRole = user?.role || "owner";
  const userId = user?.id ? parseInt(user.id, 10) : null;

  let totalLeads = 0;
  let activeClients = 0;
  let inProgress = 0;
  let lostLeads = 0;

  let totalRevenue = 0;
  let pendingPayments = 0;
  let activeProjectsCount = 0;
  let pendingTasksCount = 0;

  // Personal stats for Executives / Interns
  let myAssignedLeadsCount = 0;
  let myConvertedLeadsCount = 0;
  let myCallsCount = 0;

  let leaderboardMembers: any[] = [];
  let currentMemberRecord: any = null;
  let recentActivities: any[] = [];

  const orgId = user?.orgId ? parseInt(user.orgId, 10) : 1;

  try {
    const teamRes = await getTeamMembersAction();
    if (teamRes.members) {
      if (userId) {
        currentMemberRecord = teamRes.members.find((m) => m.user.id === userId) || null;
      }
      leaderboardMembers = [...teamRes.members]
        .filter((m) => {
          if (m.role === "owner") return false;
          const dept = (m.department || "").toLowerCase();
          const role = (m.role || "").toLowerCase();
          const desig = (m.designation || "").toLowerCase();

          const isSalesDept = dept.includes("sales") || dept.includes("marketing") || dept.includes("bd") || dept.includes("business dev") || dept.includes("business development");
          const isSalesDesig = desig.includes("sales") || desig.includes("bd") || desig.includes("business dev") || desig.includes("account executive");
          const isSalesRole = role === "executive" || role === "bd_intern";

          // Strict Rule: ONLY Sales & Business Development (BD) profiles are allowed in Sales Leaderboard
          return isSalesDept || isSalesDesig || isSalesRole;
        })
        .sort(
          (a, b) => (b.generatedRevenue || 0) - (a.generatedRevenue || 0) || (b.convertedLeadsCount || 0) - (a.convertedLeadsCount || 0)
        );
    }

    if (userRole === "owner" || userRole === "manager") {
      // Company-wide stats scoped strictly to the user's Organization (orgId)
      const result = await db
        .select({ status: clients.status, count: sql<number>`count(*)::int` })
        .from(clients)
        .where(eq(clients.orgId, orgId))
        .groupBy(clients.status);

      result.forEach((row) => {
        if (row.status === 'New Lead' || row.status === 'New' || row.status === 'Contacted' || row.status === 'Qualified' || 
            row.status === 'Quotation Sent' || row.status === 'Negotiation') {
          totalLeads += row.count;
        }
        if (row.status === 'Won') activeClients += row.count;
        if (row.status === 'Lost') lostLeads += row.count;
        if (row.status === 'Negotiation') inProgress += row.count;
      });

      // Live Financial Revenue & Pending Payments Sum scoped to orgId
      const invoiceSums = await db
        .select({
          totalRev: sql<number>`COALESCE(SUM(total), 0)::int`,
          pendingPay: sql<number>`COALESCE(SUM(amount_due), 0)::int`,
        })
        .from(invoices)
        .where(eq(invoices.orgId, orgId));

      totalRevenue = invoiceSums[0]?.totalRev || 0;
      pendingPayments = invoiceSums[0]?.pendingPay || 0;

      // Active Projects Count scoped to orgId
      const activeProjects = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(projects)
        .where(and(eq(projects.orgId, orgId), ne(projects.status, 'Completed')));
      activeProjectsCount = activeProjects[0]?.count || 0;

      // Pending Tasks Count scoped to orgId
      const pendingTasks = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(projectTasks)
        .innerJoin(projects, eq(projectTasks.projectId, projects.id))
        .where(and(eq(projects.orgId, orgId), ne(projectTasks.status, 'Done')));
      pendingTasksCount = pendingTasks[0]?.count || 0;

      // Fetch live team call logs & activities scoped to orgId
      recentActivities = await db
        .select({
          id: leadActivities.id,
          type: leadActivities.type,
          content: leadActivities.content,
          createdAt: leadActivities.createdAt,
          clientName: clients.name,
          userName: users.name,
        })
        .from(leadActivities)
        .leftJoin(clients, eq(leadActivities.clientId, clients.id))
        .leftJoin(users, eq(leadActivities.userId, users.id))
        .where(eq(clients.orgId, orgId))
        .orderBy(desc(leadActivities.createdAt))
        .limit(10);
    } else {
      // Personal Stats for Executive / Intern
      if (userId) {
        const myLeads = await db
          .select({ status: clients.status, count: sql<number>`count(*)::int` })
          .from(clients)
          .where(eq(clients.assignedTo, userId))
          .groupBy(clients.status);

        myLeads.forEach((row) => {
          myAssignedLeadsCount += row.count;
          if (row.status === 'Won') myConvertedLeadsCount += row.count;
        });

        const myCalls = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(leadActivities)
          .where(and(eq(leadActivities.userId, userId), eq(leadActivities.type, 'call')));

        myCallsCount = myCalls[0]?.count || 0;
      }
    }
  } catch (e) {
    console.error("Dashboard DB error:", e);
  }

  let myAssignedProjectTasks: any[] = [];
  if (userId) {
    try {
      myAssignedProjectTasks = await db
        .select({
          id: projectTasks.id,
          taskCode: projectTasks.taskCode,
          title: projectTasks.title,
          type: projectTasks.type,
          status: projectTasks.status,
          priority: projectTasks.priority,
          estimatedHours: projectTasks.estimatedHours,
          dueDate: projectTasks.dueDate,
          projectName: projects.name,
          projectCode: projects.code,
        })
        .from(projectTasks)
        .innerJoin(projects, eq(projectTasks.projectId, projects.id))
        .where(eq(projectTasks.assigneeId, userId))
        .orderBy(desc(projectTasks.createdAt));
    } catch (e) {
      console.error("Failed to fetch assigned tasks:", e);
    }
  }

  const totalAllLeads = totalLeads + inProgress;
  const conversionRate = (totalAllLeads + activeClients + lostLeads) > 0 
    ? Math.round((activeClients / (totalAllLeads + activeClients + lostLeads)) * 100) 
    : 0;

  const dbStats = {
    totalLeads: totalLeads.toString(),
    activeClients: activeClients.toString(),
    inProgress: inProgress.toString(),
    conversionRate: `${conversionRate}%`,
    totalRevenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
    pendingPayments: `₹${pendingPayments.toLocaleString('en-IN')}`,
    activeProjects: activeProjectsCount.toString(),
    pendingTasks: pendingTasksCount.toString(),
    myAssignedLeads: myAssignedLeadsCount.toString(),
    myConvertedLeads: myConvertedLeadsCount.toString(),
    myCalls: myCallsCount.toString(),
  };

  return (
    <DashboardClient 
      dbStats={dbStats} 
      userRole={userRole} 
      userName={user?.name || "User"} 
      leaderboardMembers={leaderboardMembers} 
      currentMemberRecord={currentMemberRecord}
      recentActivities={recentActivities}
      myAssignedProjectTasks={myAssignedProjectTasks}
    />
  );
}