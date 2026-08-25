import { getSupportTicketsData } from "@/features/support/actions";
import SupportView from "./SupportView";

export const dynamic = 'force-dynamic';

export default async function SupportPage() {
  const data = await getSupportTicketsData();

  return (
    <SupportView 
      initialTickets={data.tickets || []} 
      currentUserRole={data.currentUserRole || "owner"} 
    />
  );
}
