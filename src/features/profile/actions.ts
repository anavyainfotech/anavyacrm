"use server";

import { db } from "@/lib/db";
import { users, organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth/auth";

export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authorized" };
  }

  const name = formData.get("name") as string;
  const image = formData.get("image") as string;

  if (!name) {
    return { error: "Name is required" };
  }

  try {
    await db.update(users)
      .set({ name, image: image || null })
      .where(eq(users.id, parseInt(session.user.id)));

    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { error: "Failed to update profile." };
  }
}

export async function updateWorkspaceAction(formData: FormData) {
  const session = await auth();
  const orgId = (session?.user as any)?.orgId;
  
  if (!session?.user?.id || !orgId) {
    return { error: "Not authorized" };
  }

  const orgName = formData.get("orgName") as string;

  if (!orgName) {
    return { error: "Organization name is required" };
  }

  try {
    await db.update(organizations)
      .set({ name: orgName })
      .where(eq(organizations.id, parseInt(orgId)));

    return { success: true };
  } catch (error) {
    console.error("Failed to update workspace:", error);
    return { error: "Failed to update workspace." };
  }
}
