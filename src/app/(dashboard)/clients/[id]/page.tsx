import { db } from "@/lib/db";
import { clients, leadActivities, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import ClientDetailView from "./ClientDetailView";

export default async function ClientDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const clientId = parseInt(params.id, 10);
  if (isNaN(clientId)) return notFound();

  // Fetch client details
  const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
  if (!client) return notFound();

  // Fetch timeline activities
  const activities = await db
    .select({
      id: leadActivities.id,
      type: leadActivities.type,
      content: leadActivities.content,
      createdAt: leadActivities.createdAt,
      user: {
        id: users.id,
        name: users.name,
      }
    })
    .from(leadActivities)
    .leftJoin(users, eq(leadActivities.userId, users.id))
    .where(eq(leadActivities.clientId, clientId))
    .orderBy(desc(leadActivities.createdAt));

  // Fetch all users for assignment
  const allUsers = await db.select({ id: users.id, name: users.name }).from(users);

  // Fetch quotations
  const { quotations } = await import("@/lib/db/schema");
  const quotationsData = await db.select().from(quotations).where(eq(quotations.clientId, clientId)).orderBy(desc(quotations.createdAt));

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <ClientDetailView 
          client={client} 
          activities={activities} 
          users={allUsers}
          quotations={quotationsData}
        />
      </div>
    </div>
  );
}
