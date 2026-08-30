import { auth } from "@/auth/auth";
import { getTeamMembersAction } from "@/features/team/actions";
import TeamView from "./TeamView";

import { hasPermission } from "@/lib/permissions";

export default async function TeamPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const permissions = (session?.user as any)?.permissions;

  if (!hasPermission(role, permissions, "canManageTeam")) {
    return (
      <div className="py-12 text-center bg-white rounded-sm border border-gray-200 p-8 my-6">
        <h2 className="text-lg font-bold text-gray-900">Access Denied</h2>
        <p className="text-sm text-gray-500 mt-1">You do not have permission to manage team members.</p>
      </div>
    );
  }
  const res = await getTeamMembersAction();
  const currentUserRole = (session?.user as any)?.role || "member";

  return (
    <div className="w-full">
      <TeamView
        initialMembers={res.members || []}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}
