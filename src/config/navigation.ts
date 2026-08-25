import { LayoutDashboard, Users, FolderKanban, Receipt, Ticket, Settings, Briefcase } from "lucide-react";

export const dashboardNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients & Leads", href: "/clients", icon: Users },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Invoices", href: "/invoices", icon: Receipt },
  { name: "Support", href: "/support", icon: Ticket },
  { name: "Team", href: "/team", icon: Briefcase },
];

export const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
];
