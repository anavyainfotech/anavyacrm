export type PermissionKey =
  | "canViewLeads"
  | "canCreateLeads"
  | "canEditLeads"
  | "canDeleteLeads"
  | "canCreateQuotations"
  | "canCreateAgreements"
  | "canViewProjects"
  | "canManageProjects"
  | "canViewSupport"
  | "canManageFinance"
  | "canManageTeam";

export interface UserPermissions {
  canViewLeads: boolean;
  canCreateLeads: boolean;
  canEditLeads: boolean;
  canDeleteLeads: boolean;
  canCreateQuotations: boolean;
  canCreateAgreements: boolean;
  canViewProjects: boolean;
  canManageProjects: boolean;
  canViewSupport: boolean;
  canManageFinance: boolean;
  canManageTeam: boolean;
}

export const ALL_PERMISSIONS: { key: PermissionKey; label: string; description: string }[] = [
  { key: "canViewLeads", label: "View Leads", description: "Access the leads list & board view" },
  { key: "canCreateLeads", label: "Create Leads", description: "Add new leads to the pipeline" },
  { key: "canEditLeads", label: "Edit Leads", description: "Update lead status, assignment & notes" },
  { key: "canDeleteLeads", label: "Delete Leads", description: "Remove leads from database" },
  { key: "canCreateQuotations", label: "Create Quotations", description: "Generate PDF quotations for clients" },
  { key: "canCreateAgreements", label: "Create Agreements", description: "Generate PDF Master Services Agreements" },
  { key: "canViewProjects", label: "View Projects & Tasks", description: "Access project workspace & tech tasks" },
  { key: "canManageProjects", label: "Manage Projects", description: "Create/edit project milestones & sprint tasks" },
  { key: "canViewSupport", label: "View Support Tickets", description: "Access client support ticketing portal" },
  { key: "canManageFinance", label: "Manage Billing & Invoices", description: "Access client billing & invoice summaries" },
  { key: "canManageTeam", label: "Manage Team", description: "Add/remove employees & change permissions" },
];

export const DEFAULT_PERMISSIONS: UserPermissions = {
  canViewLeads: true,
  canCreateLeads: true,
  canEditLeads: true,
  canDeleteLeads: false,
  canCreateQuotations: true,
  canCreateAgreements: false,
  canViewProjects: true,
  canManageProjects: false,
  canViewSupport: true,
  canManageFinance: false,
  canManageTeam: false,
};

export const ROLE_PRESETS: Record<string, { label: string; permissions: UserPermissions }> = {
  owner: {
    label: "Owner / Founder / Admin",
    permissions: {
      canViewLeads: true,
      canCreateLeads: true,
      canEditLeads: true,
      canDeleteLeads: true,
      canCreateQuotations: true,
      canCreateAgreements: true,
      canViewProjects: true,
      canManageProjects: true,
      canViewSupport: true,
      canManageFinance: true,
      canManageTeam: true,
    },
  },
  project_manager: {
    label: "Project Manager / Tech Lead",
    permissions: {
      canViewLeads: true,
      canCreateLeads: false,
      canEditLeads: false,
      canDeleteLeads: false,
      canCreateQuotations: true,
      canCreateAgreements: true,
      canViewProjects: true,
      canManageProjects: true,
      canViewSupport: true,
      canManageFinance: false,
      canManageTeam: false,
    },
  },
  developer: {
    label: "Software Developer / Engineer",
    permissions: {
      canViewLeads: false,
      canCreateLeads: false,
      canEditLeads: false,
      canDeleteLeads: false,
      canCreateQuotations: false,
      canCreateAgreements: false,
      canViewProjects: true,
      canManageProjects: true,
      canViewSupport: true,
      canManageFinance: false,
      canManageTeam: false,
    },
  },
  designer: {
    label: "UI/UX & Graphic Designer",
    permissions: {
      canViewLeads: false,
      canCreateLeads: false,
      canEditLeads: false,
      canDeleteLeads: false,
      canCreateQuotations: false,
      canCreateAgreements: false,
      canViewProjects: true,
      canManageProjects: false,
      canViewSupport: false,
      canManageFinance: false,
      canManageTeam: false,
    },
  },
  manager: {
    label: "Sales Manager",
    permissions: {
      canViewLeads: true,
      canCreateLeads: true,
      canEditLeads: true,
      canDeleteLeads: true,
      canCreateQuotations: true,
      canCreateAgreements: true,
      canViewProjects: true,
      canManageProjects: false,
      canViewSupport: true,
      canManageFinance: true,
      canManageTeam: false,
    },
  },
  executive: {
    label: "Sales & BD Executive",
    permissions: {
      canViewLeads: true,
      canCreateLeads: true,
      canEditLeads: true,
      canDeleteLeads: false,
      canCreateQuotations: true,
      canCreateAgreements: false,
      canViewProjects: false,
      canManageProjects: false,
      canViewSupport: false,
      canManageFinance: false,
      canManageTeam: false,
    },
  },
  support: {
    label: "Customer Support Specialist",
    permissions: {
      canViewLeads: false,
      canCreateLeads: false,
      canEditLeads: false,
      canDeleteLeads: false,
      canCreateQuotations: false,
      canCreateAgreements: false,
      canViewProjects: true,
      canManageProjects: false,
      canViewSupport: true,
      canManageFinance: false,
      canManageTeam: false,
    },
  },
  hr_finance: {
    label: "HR & Finance Officer",
    permissions: {
      canViewLeads: false,
      canCreateLeads: false,
      canEditLeads: false,
      canDeleteLeads: false,
      canCreateQuotations: true,
      canCreateAgreements: true,
      canViewProjects: true,
      canManageProjects: false,
      canViewSupport: false,
      canManageFinance: true,
      canManageTeam: true,
    },
  },
  custom: {
    label: "Custom Role",
    permissions: DEFAULT_PERMISSIONS,
  },
};

export function parsePermissions(rawJson?: string | null, role?: string): UserPermissions {
  if (role === "owner") {
    return ROLE_PRESETS.owner.permissions;
  }

  if (!rawJson || rawJson === "{}") {
    if (role && ROLE_PRESETS[role]) {
      return ROLE_PRESETS[role].permissions;
    }
    return DEFAULT_PERMISSIONS;
  }

  try {
    const parsed = JSON.parse(rawJson);
    return {
      canViewLeads: Boolean(parsed.canViewLeads ?? true),
      canCreateLeads: Boolean(parsed.canCreateLeads ?? true),
      canEditLeads: Boolean(parsed.canEditLeads ?? true),
      canDeleteLeads: Boolean(parsed.canDeleteLeads ?? false),
      canCreateQuotations: Boolean(parsed.canCreateQuotations ?? true),
      canCreateAgreements: Boolean(parsed.canCreateAgreements ?? false),
      canViewProjects: Boolean(parsed.canViewProjects ?? true),
      canManageProjects: Boolean(parsed.canManageProjects ?? false),
      canViewSupport: Boolean(parsed.canViewSupport ?? true),
      canManageFinance: Boolean(parsed.canManageFinance ?? false),
      canManageTeam: Boolean(parsed.canManageTeam ?? false),
    };
  } catch (e) {
    return DEFAULT_PERMISSIONS;
  }
}

export function hasPermission(
  userRole?: string,
  userPermissionsRaw?: string | UserPermissions,
  requiredPermission?: PermissionKey
): boolean {
  if (userRole === "owner") return true;
  if (!requiredPermission) return true;

  const permissions =
    typeof userPermissionsRaw === "string"
      ? parsePermissions(userPermissionsRaw, userRole)
      : userPermissionsRaw || DEFAULT_PERMISSIONS;

  return Boolean(permissions[requiredPermission]);
}
