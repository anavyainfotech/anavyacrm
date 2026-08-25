"use server";

import { db } from "@/lib/db";
import { users, organizations, organizationMembers } from "@/lib/db/schema";
import { hash } from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const companyName = formData.get("companyName") as string;

  if (!name || !email || !password || !companyName) {
    return { error: "All fields are required" };
  }

  try {
    // 1. Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return { error: "User with this email already exists." };
    }

    const hashedPassword = await hash(password, 10);

    // 2. Insert using a transaction so if one fails, all fail
    await db.transaction(async (tx) => {
      // Create User
      const [newUser] = await tx.insert(users).values({
        name,
        email,
        password: hashedPassword,
      }).returning({ id: users.id });

      // Auto-generate orgCode like AI-001, AI-002...
      const orgCountResult: any = await tx.execute(
        sql`SELECT COUNT(*) as count FROM organizations`
      );
      const firstRow = Array.isArray(orgCountResult) ? orgCountResult[0] : (orgCountResult?.rows?.[0] || {});
      const count = parseInt(firstRow?.count || '0', 10) + 1;
      const orgCode = `AI-${String(count).padStart(3, '0')}`;

      // Create Organization
      const [newOrg] = await tx.insert(organizations).values({
        name: companyName,
        orgCode,
      }).returning({ id: organizations.id });

      // Link User to Organization as 'owner'
      await tx.insert(organizationMembers).values({
        userId: newUser.id,
        organizationId: newOrg.id,
        role: "owner",
      });
    });

    // We can't redirect directly inside a try block with a return type for Server Actions safely if we return an object on error. 
    // It's better to return success and handle redirect in client, or redirect if no errors.
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to create account. Please try again later." };
  }
  
  redirect("/login?registered=true");
}

export async function loginAction(formData: FormData) {
  try {
    const { signIn } = await import("@/auth/auth");
    await signIn("credentials", formData);
  } catch (error: any) {
    if (error.name === "AuthError") {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong during login." };
      }
    }
    // Next.js redirects throw an error internally that must be re-thrown
    throw error;
  }
}
