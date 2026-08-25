"use server";

import { db } from "@/lib/db";
import { users, organizationMembers, organizations, clients } from "@/lib/db/schema";
import { auth } from "@/auth/auth";
import { hash } from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ROLE_PRESETS, parsePermissions } from "@/lib/permissions";

export async function getTeamMembersAction() {
  const session = await auth();
  if (!session?.user?.id || !(session.user as any).orgId) {
    return { error: "Unauthorized", members: [] };
  }

  const orgId = parseInt((session.user as any).orgId, 10);

  try {
    const members = await db
      .select({
        memberId: organizationMembers.id,
        memberCode: organizationMembers.memberCode,
        phone: organizationMembers.phone,
        designation: organizationMembers.designation,
        department: organizationMembers.department,
        employmentType: organizationMembers.employmentType,
        workLocation: organizationMembers.workLocation,
        salary: organizationMembers.salary,
        joiningDate: organizationMembers.joiningDate,
        dob: organizationMembers.dob,
        bloodGroup: organizationMembers.bloodGroup,
        emergencyContact: organizationMembers.emergencyContact,
        panNumber: organizationMembers.panNumber,
        aadhaarNumber: organizationMembers.aadhaarNumber,
        bankDetails: organizationMembers.bankDetails,
        address: organizationMembers.address,
        notes: organizationMembers.notes,
        status: organizationMembers.status,
        targetConversions: organizationMembers.targetConversions,
        targetRevenue: organizationMembers.targetRevenue,
        commissionRate: organizationMembers.commissionRate,
        shiftStart: organizationMembers.shiftStart,
        shiftEnd: organizationMembers.shiftEnd,
        role: organizationMembers.role,
        permissions: organizationMembers.permissions,
        createdAt: organizationMembers.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(organizationMembers.organizationId, orgId));

    // Also get lead performance counts and generated revenue per user
    const allLeads = await db
      .select({ id: clients.id, assignedTo: clients.assignedTo, status: clients.status, budget: clients.budget })
      .from(clients)
      .where(eq(clients.orgId, orgId));

    const enrichedMembers = members.map((m) => {
      const userLeads = allLeads.filter((l) => l.assignedTo === m.user.id);
      const convertedLeads = userLeads.filter((l) =>
        ["Advance Received", "Project Started", "Completed"].includes(l.status)
      );
      const generatedRevenue = convertedLeads.reduce((acc, lead) => acc + (lead.budget || 0), 0);
      const commissionRate = m.commissionRate || 0;
      const earnedCommission = Math.round((generatedRevenue * commissionRate) / 100);

      return {
        ...m,
        assignedLeadsCount: userLeads.length,
        convertedLeadsCount: convertedLeads.length,
        generatedRevenue,
        earnedCommission,
      };
    });

    return { success: true, members: enrichedMembers };
  } catch (error) {
    console.error("Error fetching team members:", error);
    return { error: "Failed to fetch team members", members: [] };
  }
}

export async function addEmployeeAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !(session.user as any).orgId) {
    return { error: "Unauthorized" };
  }

  const currentRole = (session.user as any).role;
  if (currentRole !== "owner" && currentRole !== "admin") {
    return { error: "Only owners/admins can add team members." };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = (formData.get("phone") as string) || null;
  const designation = (formData.get("designation") as string) || null;
  const department = (formData.get("department") as string) || null;
  const employmentType = (formData.get("employmentType") as string) || "Full-Time";
  const workLocation = (formData.get("workLocation") as string) || "Office";
  const salaryRaw = formData.get("salary");
  const salary = salaryRaw ? parseInt(salaryRaw as string, 10) : null;
  const joiningDate = (formData.get("joiningDate") as string) || null;
  const dob = (formData.get("dob") as string) || null;
  const bloodGroup = (formData.get("bloodGroup") as string) || null;
  const emergencyContact = (formData.get("emergencyContact") as string) || null;
  const panNumber = (formData.get("panNumber") as string) || null;
  const aadhaarNumber = (formData.get("aadhaarNumber") as string) || null;
  const bankDetails = (formData.get("bankDetails") as string) || null;
  const address = (formData.get("address") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const role = (formData.get("role") as string) || "executive";
  const permissionsJson = (formData.get("permissions") as string) || "{}";

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }

  const orgId = parseInt((session.user as any).orgId, 10);

  try {
    // 1. Check if user with this email already exists
    let existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let userId: number;

    if (existingUser.length > 0) {
      userId = existingUser[0].id;
      // Check if already in this organization
      const existingMember = await db
        .select()
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, orgId),
            eq(organizationMembers.userId, userId)
          )
        )
        .limit(1);

      if (existingMember.length > 0) {
        return { error: "This user is already a member of your workspace." };
      }
    } else {
      // Create new user account
      const hashedPassword = await hash(password, 10);
      const [newUser] = await db
        .insert(users)
        .values({
          name,
          email,
          password: hashedPassword,
        })
        .returning({ id: users.id });

      userId = newUser.id;
    }

    // Auto-generate Team ID like AI-TM-001, AI-TM-002...
    const existingMembersCount = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, orgId));

    const memberCode = `AI-TM-${String(existingMembersCount.length + 1).padStart(3, "0")}`;

    // Determine final permissions string
    let finalPermissions = permissionsJson;
    if (role !== "custom" && ROLE_PRESETS[role]) {
      finalPermissions = JSON.stringify(ROLE_PRESETS[role].permissions);
    }

    // Link user to organization with memberCode & full corporate profile
    await db.insert(organizationMembers).values({
      organizationId: orgId,
      userId,
      memberCode,
      phone,
      designation,
      department,
      employmentType,
      workLocation,
      salary,
      joiningDate,
      dob,
      bloodGroup,
      emergencyContact,
      panNumber,
      aadhaarNumber,
      bankDetails,
      address,
      notes,
      role,
      permissions: finalPermissions,
    });

    revalidatePath("/team");
    return { success: true };
  } catch (error: any) {
    console.error("Add employee error:", error);
    return { error: error.message || "Failed to add team member" };
  }
}

export async function updateTeamMemberProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !(session.user as any).orgId) {
    return { error: "Unauthorized" };
  }

  const currentRole = (session.user as any).role;
  if (currentRole !== "owner" && currentRole !== "admin") {
    return { error: "Only owners/admins can edit team profile details." };
  }

  const memberIdRaw = formData.get("memberId");
  if (!memberIdRaw) return { error: "Member ID required" };

  const memberId = parseInt(memberIdRaw as string, 10);
  const name = formData.get("name") as string;
  const phone = (formData.get("phone") as string) || null;
  const designation = (formData.get("designation") as string) || null;
  const department = (formData.get("department") as string) || null;
  const employmentType = (formData.get("employmentType") as string) || "Full-Time";
  const workLocation = (formData.get("workLocation") as string) || "Office";
  const salaryRaw = formData.get("salary");
  const salary = salaryRaw ? parseInt(salaryRaw as string, 10) : null;
  const joiningDate = (formData.get("joiningDate") as string) || null;
  const dob = (formData.get("dob") as string) || null;
  const bloodGroup = (formData.get("bloodGroup") as string) || null;
  const emergencyContact = (formData.get("emergencyContact") as string) || null;
  const panNumber = (formData.get("panNumber") as string) || null;
  const aadhaarNumber = (formData.get("aadhaarNumber") as string) || null;
  const bankDetails = (formData.get("bankDetails") as string) || null;
  const address = (formData.get("address") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  const orgId = parseInt((session.user as any).orgId, 10);

  try {
    const member = await db
      .select({ userId: organizationMembers.userId })
      .from(organizationMembers)
      .where(and(eq(organizationMembers.id, memberId), eq(organizationMembers.organizationId, orgId)))
      .limit(1);

    if (member.length > 0) {
      if (name) {
        await db.update(users).set({ name }).where(eq(users.id, member[0].userId));
      }

      await db
        .update(organizationMembers)
        .set({
          phone,
          designation,
          department,
          employmentType,
          workLocation,
          salary,
          joiningDate,
          dob,
          bloodGroup,
          emergencyContact,
          panNumber,
          aadhaarNumber,
          bankDetails,
          address,
          notes,
        })
        .where(eq(organizationMembers.id, memberId));
    }

    revalidatePath("/team");
    return { success: true };
  } catch (error: any) {
    console.error("Update team profile error:", error);
    return { error: error.message || "Failed to update profile" };
  }
}

export async function updateEmployeePermissionsAction(
  memberId: number,
  role: string,
  permissionsObj: any
) {
  const session = await auth();
  if (!session?.user?.id || !(session.user as any).orgId) {
    return { error: "Unauthorized" };
  }

  const currentRole = (session.user as any).role;
  if (currentRole !== "owner" && currentRole !== "admin") {
    return { error: "Only owners/admins can edit team permissions." };
  }

  const orgId = parseInt((session.user as any).orgId, 10);

  try {
    let finalPermissions = JSON.stringify(permissionsObj);
    if (role !== "custom" && ROLE_PRESETS[role]) {
      finalPermissions = JSON.stringify(ROLE_PRESETS[role].permissions);
    }

    await db
      .update(organizationMembers)
      .set({
        role,
        permissions: finalPermissions,
      })
      .where(
        and(
          eq(organizationMembers.id, memberId),
          eq(organizationMembers.organizationId, orgId)
        )
      );

    revalidatePath("/team");
    return { success: true };
  } catch (error: any) {
    console.error("Update permissions error:", error);
    return { error: error.message || "Failed to update permissions" };
  }
}

export async function removeEmployeeAction(memberId: number) {
  const session = await auth();
  if (!session?.user?.id || !(session.user as any).orgId) {
    return { error: "Unauthorized" };
  }

  const currentRole = (session.user as any).role;
  if (currentRole !== "owner") {
    return { error: "Only the organization owner can remove team members." };
  }

  const orgId = parseInt((session.user as any).orgId, 10);

  try {
    await db
      .delete(organizationMembers)
      .where(
        and(
          eq(organizationMembers.id, memberId),
          eq(organizationMembers.organizationId, orgId)
        )
      );

    revalidatePath("/team");
    return { success: true };
  } catch (error: any) {
    console.error("Remove employee error:", error);
    return { error: error.message || "Failed to remove employee" };
  }
}

export async function resetMemberPasswordAction(memberId: number, newPassword: string) {
  const session = await auth();
  if (!session?.user?.id || !(session.user as any).orgId) {
    return { error: "Unauthorized" };
  }

  const currentRole = (session.user as any).role;
  if (currentRole !== "owner" && currentRole !== "admin") {
    return { error: "Only owners/admins can reset team member passwords." };
  }

  if (!newPassword || newPassword.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const orgId = parseInt((session.user as any).orgId, 10);

  try {
    const member = await db
      .select({ userId: organizationMembers.userId })
      .from(organizationMembers)
      .where(and(eq(organizationMembers.id, memberId), eq(organizationMembers.organizationId, orgId)))
      .limit(1);

    if (member.length === 0) {
      return { error: "Team member not found." };
    }

    const hashedPassword = await hash(newPassword, 10);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, member[0].userId));

    revalidatePath("/team");
    return { success: true };
  } catch (error: any) {
    console.error("Reset password error:", error);
    return { error: error.message || "Failed to reset password" };
  }
}

export async function updateMemberStatusAction(memberId: number, status: string) {
  const session = await auth();
  if (!session?.user?.id || !(session.user as any).orgId) {
    return { error: "Unauthorized" };
  }

  const currentRole = (session.user as any).role;
  if (currentRole !== "owner" && currentRole !== "admin") {
    return { error: "Only owners/admins can update team status." };
  }

  if (!["active", "inactive", "on_leave"].includes(status)) {
    return { error: "Invalid status value." };
  }

  const orgId = parseInt((session.user as any).orgId, 10);

  try {
    await db
      .update(organizationMembers)
      .set({ status })
      .where(and(eq(organizationMembers.id, memberId), eq(organizationMembers.organizationId, orgId)));

    revalidatePath("/team");
    return { success: true };
  } catch (error: any) {
    console.error("Update member status error:", error);
    return { error: error.message || "Failed to update status" };
  }
}

export async function updateMemberTargetsAction(
  memberId: number,
  targetConversions: number,
  targetRevenue: number
) {
  const session = await auth();
  if (!session?.user?.id || !(session.user as any).orgId) {
    return { error: "Unauthorized" };
  }

  const currentRole = (session.user as any).role;
  if (currentRole !== "owner" && currentRole !== "admin") {
    return { error: "Only owners/admins can update monthly targets." };
  }

  const orgId = parseInt((session.user as any).orgId, 10);

  try {
    await db
      .update(organizationMembers)
      .set({
        targetConversions: Math.max(0, targetConversions || 0),
        targetRevenue: Math.max(0, targetRevenue || 0),
      })
      .where(and(eq(organizationMembers.id, memberId), eq(organizationMembers.organizationId, orgId)));

    revalidatePath("/team");
    return { success: true };
  } catch (error: any) {
    console.error("Update targets error:", error);
    return { error: error.message || "Failed to update targets" };
  }
}

export async function reassignMemberLeadsAction(fromUserId: number, toUserId: number) {
  const session = await auth();
  if (!session?.user?.id || !(session.user as any).orgId) {
    return { error: "Unauthorized" };
  }

  const currentRole = (session.user as any).role;
  if (currentRole !== "owner" && currentRole !== "admin") {
    return { error: "Only owners/admins can reassign leads." };
  }

  const orgId = parseInt((session.user as any).orgId, 10);

  try {
    await db
      .update(clients)
      .set({ assignedTo: toUserId, updatedAt: new Date() })
      .where(and(eq(clients.orgId, orgId), eq(clients.assignedTo, fromUserId)));

    revalidatePath("/team");
    revalidatePath("/clients");
    return { success: true };
  } catch (error: any) {
    console.error("Reassign leads error:", error);
    return { error: error.message || "Failed to reassign leads" };
  }
}

export async function updateMemberCommissionAndShiftAction(
  memberId: number,
  commissionRate: number,
  shiftStart: string,
  shiftEnd: string
) {
  const session = await auth();
  if (!session?.user?.id || !(session.user as any).orgId) {
    return { error: "Unauthorized" };
  }

  const currentRole = (session.user as any).role;
  if (currentRole !== "owner" && currentRole !== "admin") {
    return { error: "Only owners/admins can update commission rates & shift hours." };
  }

  const orgId = parseInt((session.user as any).orgId, 10);

  try {
    await db
      .update(organizationMembers)
      .set({
        commissionRate: Math.max(0, Math.min(100, commissionRate || 0)),
        shiftStart: shiftStart || "09:00",
        shiftEnd: shiftEnd || "18:00",
      })
      .where(and(eq(organizationMembers.id, memberId), eq(organizationMembers.organizationId, orgId)));

    revalidatePath("/team");
    return { success: true };
  } catch (error: any) {
    console.error("Update commission & shift error:", error);
    return { error: error.message || "Failed to update settings" };
  }
}

