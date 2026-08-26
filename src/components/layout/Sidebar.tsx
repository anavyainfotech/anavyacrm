"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { dashboardNavigation, bottomNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { hasPermission, parsePermissions } from "@/lib/permissions";
import { LogOut } from "lucide-react";

export function Sidebar({ user, onItemClick }: { user?: any; onItemClick?: () => void }) {
  const pathname = usePathname();
  const role = user?.role;
  const permissions = user?.permissions;
  const userName = user?.name || "Admin User";
  const userEmail = user?.email || "admin@anavyainfotech.com";

  const parsedPerms = parsePermissions(permissions, role);

  return (
    <div className="flex h-full w-full flex-col bg-white border-r border-gray-200">
      {/* Brand Header */}
      <div className="flex h-14 shrink-0 items-center gap-3 px-5 border-b border-gray-100">
        <img src="/logo.png" alt="Anavya Infotech Logo" className="w-7 h-7 object-contain" />
        <h1 className="text-base font-extrabold text-blue-900 tracking-tight">{siteConfig.name}</h1>
      </div>

      {/* Navigation */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-3 py-3">
          {dashboardNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            // Strict Role & Permission Filtering for Sidebar Items
            if (item.href === "/clients" && !parsedPerms.canViewLeads) {
              return null;
            }
            if (item.href === "/projects" && role !== "owner" && role !== "manager" && !parsedPerms.canManageTeam) {
              return null; // Hide projects for BD Interns/Executives without project access
            }
            if (item.href === "/invoices" && !parsedPerms.canCreateQuotations && !parsedPerms.canCreateAgreements && role !== "owner" && role !== "manager") {
              return null; // Hide financial invoices for interns/executives
            }
            if (item.href === "/team" && !parsedPerms.canManageTeam) {
              return null; // Hide team management
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600",
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600",
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-1">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600",
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                )}
              >
                <item.icon className={cn(
                  isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600",
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors"
                )} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Logged-In Account Card Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate leading-tight">{userName}</p>
                <p className="text-[10px] text-gray-500 font-medium truncate">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={() => { window.location.href = "/api/auth/signout"; }}
              title="Sign Out"
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
