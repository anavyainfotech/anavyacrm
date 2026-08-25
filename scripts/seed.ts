import "dotenv/config";
import { db } from "../src/lib/db";
import { users, organizations, organizationMembers } from "../src/lib/db/schema";
import { hash } from "bcryptjs";

async function seed() {
  console.log("Seeding test user and organization...");
  try {
    const hashedPassword = await hash("password123", 10);
    
    const [newUser] = await db.insert(users).values({
      name: "Admin User",
      email: "admin@anavyainfotech.com",
      password: hashedPassword,
    }).returning({ id: users.id });

    const [newOrg] = await db.insert(organizations).values({
      name: "Anavya Infotech",
      orgCode: "AI-001",
    }).returning({ id: organizations.id });

    await db.insert(organizationMembers).values({
      userId: newUser.id,
      organizationId: newOrg.id,
      role: "owner",
    });
    
    console.log("✅ Seed completed successfully!");
    console.log("You can login with:");
    console.log("Email: admin@anavyainfotech.com");
    console.log("Password: password123");
  } catch (error) {
    console.error("❌ Seed failed:", error);
  }
  process.exit(0);
}

seed();
