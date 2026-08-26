"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Menu, X } from "lucide-react";

export function DashboardShell({
  user,
  children,
}: {
  user?: any;
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50/50">
      {/* Desktop Sidebar (visible on lg screens) */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar user={user} />
      </div>

      {/* Mobile Drawer Sidebar (slide-over on mobile/tablet screens < lg) */}
      {isMobileSidebarOpen && (
        <div className="relative z-50 lg:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 flex max-w-full">
            <div className="relative w-72 bg-white shadow-2xl flex flex-col">
              {/* Close Button on Mobile Drawer */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-900 rounded-sm hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sidebar Component */}
              <Sidebar user={user} onItemClick={() => setIsMobileSidebarOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header user={user} onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
