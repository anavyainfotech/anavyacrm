export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { getInvoicesAction } from "@/features/invoices/actions";
import InvoicesView from "./InvoicesView";

export default async function InvoicesPage() {
  let invoicesList: any[] = [];
  let clientsList: any[] = [];

  try {
    const invRes = await getInvoicesAction();
    if (invRes.success && Array.isArray(invRes.invoices)) {
      invoicesList = JSON.parse(JSON.stringify(invRes.invoices));
    }

    const rawClients = await db
      .select({ id: clients.id, name: clients.name, company: clients.company })
      .from(clients);
    clientsList = JSON.parse(JSON.stringify(rawClients));
  } catch (error) {
    console.error("Failed to load invoices page data:", error);
  }

  return <InvoicesView initialInvoices={invoicesList} clientsList={clientsList} />;
}
