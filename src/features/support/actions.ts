"use server";

import { db } from "@/lib/db";
import { supportTickets, users } from "@/lib/db/schema";
import { auth } from "@/auth/auth";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createSupportTicketAction(formData: FormData) {
  try {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id, 10) : 1;
    const userName = session?.user?.name || "Employee";
    const userRole = (session?.user as any)?.role || "executive";

    const subject = formData.get("subject") as string;
    const category = formData.get("category") as string;
    const priority = formData.get("priority") as string;
    const description = formData.get("description") as string;

    if (!subject || !description) {
      return { success: false, error: "Subject and description are required." };
    }

    const ticketCode = `TCK-2026-${Math.floor(100 + Math.random() * 900)}`;

    await db.insert(supportTickets).values({
      ticketCode,
      userId,
      userName,
      userRole,
      subject,
      category: category || "Technical Support",
      priority: priority || "Normal",
      status: "Open",
      description,
    });

    revalidatePath("/support");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create support ticket:", error);
    return { success: false, error: error.message };
  }
}

export async function getSupportTicketsData() {
  try {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id, 10) : 1;
    const userRole = (session?.user as any)?.role || "owner";

    let ticketsList = [];

    // Owner and Admin see ALL raised employee tickets
    if (userRole === "owner" || userRole === "admin") {
      ticketsList = await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
    } else {
      // Employees see ONLY their own tickets
      ticketsList = await db
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.userId, userId))
        .orderBy(desc(supportTickets.createdAt));
    }

    return { success: true, tickets: ticketsList, currentUserRole: userRole };
  } catch (error: any) {
    console.error("Failed to fetch support tickets:", error);
    return { success: false, tickets: [], currentUserRole: "executive" };
  }
}

export async function updateTicketStatusAction(ticketId: number, status: string, reply?: string) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role || "owner";

    // Only owner or admin can update status and reply
    if (userRole !== "owner" && userRole !== "admin") {
      return { success: false, error: "Only Founder / Owner can update ticket status." };
    }

    await db
      .update(supportTickets)
      .set({
        status,
        reply: reply || undefined,
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, ticketId));

    revalidatePath("/support");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update ticket status:", error);
    return { success: false, error: error.message };
  }
}
