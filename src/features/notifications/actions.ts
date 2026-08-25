"use server";

import { db } from "@/lib/db";
import { clients, leadActivities, users, invoices, projects, projectTasks } from "@/lib/db/schema";
import { auth } from "@/auth/auth";
import { eq, desc, and, lt, gt } from "drizzle-orm";

export interface NotificationItem {
  id: string;
  type: "lead" | "activity" | "invoice" | "task";
  title: string;
  description: string;
  time: string;
  link?: string;
  unread: boolean;
  category: "call" | "alert" | "system" | "invoice";
}

export async function getNotificationsAction(): Promise<{ success: boolean; notifications: NotificationItem[]; unreadCount: number }> {
  try {
    const session = await auth();
    const user = session?.user as any;
    const userId = user?.id ? parseInt(user.id, 10) : null;
    const userRole = user?.role || "owner";

    const notificationList: NotificationItem[] = [];

    // 1. Fetch Overdue Invoices Alerts
    const overdueInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        amountDue: invoices.amountDue,
        clientName: clients.name,
        dueDate: invoices.dueDate,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(and(gt(invoices.amountDue, 0), lt(invoices.dueDate, new Date().toISOString().split("T")[0])))
      .limit(5);

    overdueInvoices.forEach((inv) => {
      notificationList.push({
        id: `inv-${inv.id}`,
        type: "invoice",
        title: `⚠️ Overdue Invoice Alert (${inv.invoiceNumber})`,
        description: `₹${inv.amountDue.toLocaleString("en-IN")} pending for client ${inv.clientName || "Client"}. Due date was ${inv.dueDate}.`,
        time: "Action Required",
        link: "/invoices",
        unread: true,
        category: "invoice",
      });
    });

    // 2. Fetch Recent Call Logs & Activities (last 10)
    const recentActivities = await db
      .select({
        id: leadActivities.id,
        type: leadActivities.type,
        content: leadActivities.content,
        createdAt: leadActivities.createdAt,
        clientName: clients.name,
        clientId: clients.id,
        userName: users.name,
      })
      .from(leadActivities)
      .leftJoin(clients, eq(leadActivities.clientId, clients.id))
      .leftJoin(users, eq(leadActivities.userId, users.id))
      .orderBy(desc(leadActivities.createdAt))
      .limit(8);

    recentActivities.forEach((act) => {
      notificationList.push({
        id: `act-${act.id}`,
        type: "activity",
        title: `📞 ${act.type || "Call Log"} by ${act.userName || "Team Member"}`,
        description: `Client: ${act.clientName || "Lead"} — ${act.content}`,
        time: act.createdAt ? new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
        link: act.clientId ? `/clients` : undefined,
        unread: true,
        category: "call",
      });
    });

    // 3. Fetch Recent New Leads (last 5)
    const recentLeads = await db
      .select({
        id: clients.id,
        name: clients.name,
        company: clients.company,
        createdAt: clients.createdAt,
        source: clients.source,
      })
      .from(clients)
      .orderBy(desc(clients.createdAt))
      .limit(5);

    recentLeads.forEach((lead) => {
      notificationList.push({
        id: `lead-${lead.id}`,
        type: "lead",
        title: `🚀 New Lead Captured: ${lead.name}`,
        description: `Source: ${lead.source || "Direct"}${lead.company ? ` | ${lead.company}` : ""}`,
        time: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "Today",
        link: `/clients`,
        unread: false,
        category: "system",
      });
    });

    // 4. Fetch Open High Priority Tasks / Bugs
    const recentTasks = await db
      .select({
        id: projectTasks.id,
        taskCode: projectTasks.taskCode,
        title: projectTasks.title,
        type: projectTasks.type,
        priority: projectTasks.priority,
        projectName: projects.name,
      })
      .from(projectTasks)
      .innerJoin(projects, eq(projectTasks.projectId, projects.id))
      .orderBy(desc(projectTasks.createdAt))
      .limit(5);

    recentTasks.forEach((t) => {
      notificationList.push({
        id: `task-${t.id}`,
        type: "task",
        title: `${t.type === "Bug" ? "🐞 Bug Alert" : "🛠️ Project Task"}: ${t.taskCode}`,
        description: `${t.title} (${t.projectName}) — Priority: ${t.priority}`,
        time: "Active Task",
        link: "/projects",
        unread: t.type === "Bug",
        category: "alert",
      });
    });

    const unreadCount = notificationList.filter((n) => n.unread).length;

    return {
      success: true,
      notifications: notificationList,
      unreadCount,
    };
  } catch (error: any) {
    console.error("Failed to fetch notifications:", error);
    return { success: false, notifications: [], unreadCount: 0 };
  }
}
