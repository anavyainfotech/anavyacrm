import { db } from "@/lib/db";
import { organizationMembers, clients } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function getNextRoundRobinAssignee(orgId: number): Promise<number | null> {
  try {
    // 1. Get all active members of the organization (filtering out inactive and on_leave)
    const members = await db
      .select({
        userId: organizationMembers.userId,
        role: organizationMembers.role,
        department: organizationMembers.department,
        shiftStart: organizationMembers.shiftStart,
        shiftEnd: organizationMembers.shiftEnd,
      })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, orgId),
          eq(organizationMembers.status, "active")
        )
      );

    // Strict Filter: Only assign Sales Leads to Sales / BD / Marketing team members (excluding SEO / Technical / Ops)
    const salesMembers = members.filter((m) => {
      const dept = (m.department || "").toLowerCase();
      const role = (m.role || "").toLowerCase();
      return (
        dept.includes("sales") ||
        dept.includes("marketing") ||
        dept.includes("bd") ||
        dept.includes("business dev") ||
        role === "manager" ||
        role === "owner"
      );
    });

    const eligiblePool = salesMembers.length > 0 ? salesMembers : members;
    if (eligiblePool.length === 0) return null;

    // Filter by shift hours if available
    const now = new Date();
    const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const inShiftMembers = eligiblePool.filter((m) => {
      const start = m.shiftStart || "00:00";
      const end = m.shiftEnd || "23:59";
      if (start <= end) {
        return currentHHMM >= start && currentHHMM <= end;
      } else {
        // Overnight shift (e.g. 22:00 to 06:00)
        return currentHHMM >= start || currentHHMM <= end;
      }
    });

    const eligibleMembers = inShiftMembers.length > 0 ? inShiftMembers : members;
    const teamUserIds = eligibleMembers.map((m) => m.userId);

    if (teamUserIds.length === 1) {
      return teamUserIds[0];
    }

    // 2. Find the last assigned lead in this org
    const lastAssignedLead = await db
      .select({ assignedTo: clients.assignedTo })
      .from(clients)
      .where(and(eq(clients.orgId, orgId)))
      .orderBy(desc(clients.id))
      .limit(1);

    const lastAssigneeId = lastAssignedLead[0]?.assignedTo;

    if (!lastAssigneeId) {
      return teamUserIds[0];
    }

    // 3. Find next index in sequence
    const currentIndex = teamUserIds.indexOf(lastAssigneeId);
    if (currentIndex === -1 || currentIndex === teamUserIds.length - 1) {
      return teamUserIds[0];
    }

    return teamUserIds[currentIndex + 1];
  } catch (error) {
    console.error("Round robin error:", error);
    return null;
  }
}
