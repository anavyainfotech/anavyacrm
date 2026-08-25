import "dotenv/config";
import { db } from "../src/lib/db";
import { users, organizationMembers, organizations } from "../src/lib/db/schema";
import { hash } from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { ROLE_PRESETS } from "../src/lib/permissions";

async function main() {
  console.log("Creating BD Intern account...");

  const orgs = await db.select().from(organizations).limit(1);
  if (orgs.length === 0) {
    console.error("No organization found. Please run seed script first.");
    process.exit(1);
  }

  const orgId = orgs[0].id;
  const email = "intern@anavyainfotech.com";
  const rawPassword = "password123";

  // Check if existing user
  let existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  let userId: number;

  if (existingUser.length > 0) {
    userId = existingUser[0].id;
    console.log(`Found existing user with id ${userId}`);
  } else {
    const hashedPassword = await hash(rawPassword, 10);
    const [newUser] = await db
      .insert(users)
      .values({
        name: "Rahul Sharma (BD Intern)",
        email,
        password: hashedPassword,
      })
      .returning({ id: users.id });

    userId = newUser.id;
    console.log(`Created new user with id ${userId}`);
  }

  // Check if member exists in org
  const existingMember = await db
    .select()
    .from(organizationMembers)
    .where(and(eq(organizationMembers.organizationId, orgId), eq(organizationMembers.userId, userId)))
    .limit(1);

  const internPermissions = JSON.stringify({
    canViewLeads: true,
    canCreateLeads: true,
    canEditLeads: true,
    canDeleteLeads: false,
    canCreateQuotations: false,
    canCreateAgreements: false,
    canManageTeam: false,
  });

  if (existingMember.length > 0) {
    await db
      .update(organizationMembers)
      .set({
        memberCode: "AI-TM-002",
        designation: "Business Development Intern",
        department: "Sales & Cold Calling",
        phone: "+91 9876543210",
        employmentType: "Internship",
        workLocation: "Office",
        role: "executive",
        permissions: internPermissions,
      })
      .where(eq(organizationMembers.id, existingMember[0].id));

    console.log("Updated existing member profile with BD Intern details.");
  } else {
    await db.insert(organizationMembers).values({
      organizationId: orgId,
      userId,
      memberCode: "AI-TM-002",
      designation: "Business Development Intern",
      department: "Sales & Cold Calling",
      phone: "+91 9876543210",
      employmentType: "Internship",
      workLocation: "Office",
      role: "executive",
      permissions: internPermissions,
    });

    console.log("Inserted new member profile with BD Intern details.");
  }

  console.log("SUCCESS: BD Intern account ready.");
  console.log(`Email: ${email}`);
  console.log(`Password: ${rawPassword}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error creating BD Intern:", err);
  process.exit(1);
});
