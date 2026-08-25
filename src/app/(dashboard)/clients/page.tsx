export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { clients, users as usersTable } from "@/lib/db/schema";
import { desc, eq, and } from "drizzle-orm";
import ClientsView from "./ClientsView";
import { auth } from "@/auth/auth";
import { hasPermission } from "@/lib/permissions";

export default async function ClientsPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const permissions = (session?.user as any)?.permissions;
  const currentUserId = (session?.user as any)?.id ? parseInt((session?.user as any).id, 10) : null;

  if (!hasPermission(role, permissions, "canViewLeads")) {
    return (
      <div className="py-12 text-center bg-white rounded-sm border border-gray-200 p-8 my-6">
        <h2 className="text-lg font-bold text-gray-900">Access Denied</h2>
        <p className="text-sm text-gray-500 mt-1">You do not have permission to view leads or clients.</p>
      </div>
    );
  }

  const orgId = (session?.user as any)?.orgId 
    ? parseInt((session?.user as any).orgId, 10) 
    : null;

  let allClients: any[] = [];
  let allUsers: any[] = [];

  try {
    const isOwnerOrAdmin = role === "owner" || role === "admin";

    if (isOwnerOrAdmin) {
      // Owner/Admin sees ALL leads in the organization
      if (orgId) {
        allClients = await db
          .select()
          .from(clients)
          .where(eq(clients.orgId, orgId))
          .orderBy(desc(clients.createdAt));
      } else {
        allClients = await db
          .select()
          .from(clients)
          .orderBy(desc(clients.createdAt));
      }
    } else {
      // Executives / Interns ONLY see leads assigned to them!
      if (orgId && currentUserId) {
        allClients = await db
          .select()
          .from(clients)
          .where(and(eq(clients.orgId, orgId), eq(clients.assignedTo, currentUserId)))
          .orderBy(desc(clients.createdAt));
      } else if (currentUserId) {
        allClients = await db
          .select()
          .from(clients)
          .where(eq(clients.assignedTo, currentUserId))
          .orderBy(desc(clients.createdAt));
      }
    }

    allUsers = await db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable);
  } catch (error) {
    console.error("DB Error:", error);
    allClients = [];
    allUsers = [];
  }

  return (
    <div className="w-full">
      <ClientsView initialClients={allClients} currentUser={session?.user} users={allUsers} />
    </div>
  );
}
