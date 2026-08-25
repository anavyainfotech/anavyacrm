import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { auth } from "@/auth/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar user={session?.user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={session?.user} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
