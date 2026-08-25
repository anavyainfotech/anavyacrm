import { auth } from "@/auth/auth";
import { getTeamMembersAction } from "@/features/team/actions";
import TeamView from "./TeamView";

export default async function TeamPage() {
  const session = await auth();
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
