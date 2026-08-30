export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { getInvoicesAction } from "@/features/invoices/actions";
import InvoicesView from "./InvoicesView";

import { auth } from "@/auth/auth";
import { hasPermission } from "@/lib/permissions";

export default async function InvoicesPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const permissions = (session?.user as any)?.permissions;

  if (!hasPermission(role, permissions, "canManageFinance") && !hasPermission(role, permissions, "canCreateQuotations")) {
    return (
      <div className="py-12 text-center bg-white rounded-sm border border-gray-200 p-8 my-6">
        <h2 className="text-lg font-bold text-gray-900">Access Denied</h2>
        <p className="text-sm text-gray-500 mt-1">You do not have permission to view billing or invoices.</p>
      </div>
    );
  }
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
