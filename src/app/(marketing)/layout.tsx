export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center border-b border-gray-100 px-6">
        <h1 className="text-xl font-bold text-blue-600">Anavya Infotech CRM</h1>
        <div className="ml-auto flex gap-4">
          <a href="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">Login</a>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Anavya Infotech. All rights reserved.
      </footer>
    </div>
  );
}
