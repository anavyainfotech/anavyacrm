import { DashboardShell } from "@/components/layout/DashboardShell";
import { auth } from "@/auth/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <DashboardShell user={session?.user}>
      {children}
    </DashboardShell>
  );
}
