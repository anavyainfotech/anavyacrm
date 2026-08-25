import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { users, organizationMembers, organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const email = typeof credentials?.email === 'string' ? credentials.email : "";
                const password = typeof credentials?.password === 'string' ? credentials.password : "";

                if (!email || !password) return null

                const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

                if (!user || user.length === 0) return null

                const validPassword = await compare(password, user[0].password)

                if (!validPassword) return null

                // Fetch organization info & permissions
                const orgMember = await db.select({
                  orgId: organizations.id,
                  orgName: organizations.name,
                  orgCode: organizations.orgCode,
                  role: organizationMembers.role,
                  permissions: organizationMembers.permissions,
                })
                .from(organizationMembers)
                .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
                .where(eq(organizationMembers.userId, user[0].id))
                .limit(1);

                return {
                    id: user[0].id.toString(),
                    name: user[0].name,
                    email: user[0].email,
                    image: user[0].image || null,
                    orgId: orgMember[0]?.orgId?.toString() || null,
                    orgName: orgMember[0]?.orgName || null,
                    orgCode: orgMember[0]?.orgCode || null,
                    role: orgMember[0]?.role || "member",
                    permissions: orgMember[0]?.permissions || "{}",
                }
            }
        })
    ],
    callbacks: {
      async jwt({ token, user, trigger, session }) {
        if (user) {
          token.id = user.id;
          token.orgId = (user as any).orgId;
          token.orgName = (user as any).orgName;
          token.orgCode = (user as any).orgCode;
          token.role = (user as any).role;
          token.permissions = (user as any).permissions;
          token.picture = user.image;
        }
        
        // Handle session update on client
        if (trigger === "update" && session) {
          if (session.name) token.name = session.name;
          if (session.image) token.picture = session.image;
          if (session.orgName) token.orgName = session.orgName;
          if (session.permissions) token.permissions = session.permissions;
        }
        
        return token;
      },
      async session({ session, token }) {
        if (token && session.user) {
          session.user.id = token.id as string;
          session.user.image = token.picture as string;
          (session.user as any).orgId = token.orgId;
          (session.user as any).orgName = token.orgName;
          (session.user as any).orgCode = token.orgCode;
          (session.user as any).role = token.role;
          (session.user as any).permissions = token.permissions;
        }
        return session;
      }
    }
}) 