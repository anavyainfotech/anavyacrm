"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, UserCheck, FolderKanban, IndianRupee, 
  Clock, TrendingUp, Wallet, CheckSquare,
  Calendar, Globe, Server, X, PhoneCall, CheckCircle2, MessageSquare, ArrowRight,
  Trophy, Award, Zap, ShieldCheck, Target, Percent, Clock3, Briefcase, MapPin, CreditCard
} from "lucide-react";

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface TeamMemberLeaderboard {
  memberId: number;
  memberCode?: string | null;
  designation?: string | null;
  department?: string | null;
  employmentType?: string | null;
  workLocation?: string | null;
  salary?: number | null;
  shiftStart?: string | null;
  shiftEnd?: string | null;
  targetConversions?: number | null;
  targetRevenue?: number | null;
  commissionRate?: number | null;
  earnedCommission?: number;
  assignedLeadsCount?: number;
  convertedLeadsCount?: number;
  generatedRevenue?: number;
  user: {
    id: number;
    name: string;
    email: string;
    image?: string | null;
  };
}

export default function DashboardClient({ 
  dbStats,
  userRole,
  userName,
  leaderboardMembers = [],
  currentMemberRecord = null,
  recentActivities = [],
  myAssignedProjectTasks = [],
}: { 
  dbStats: { 
    totalLeads: string; 
    activeClients: string; 
    inProgress: string; 
    conversionRate: string;
    totalRevenue?: string;
    pendingPayments?: string;
    activeProjects?: string;
    pendingTasks?: string;
    myAssignedLeads: string;
    myConvertedLeads: string;
    myCalls: string;
  };
  userRole: string;
  userName: string;
  leaderboardMembers?: TeamMemberLeaderboard[];
  currentMemberRecord?: TeamMemberLeaderboard | null;
  recentActivities?: Array<{
    id: number;
    type: string;
    content: string;
    createdAt: string | Date;
    clientName?: string | null;
    userName?: string | null;
  }>;
  myAssignedProjectTasks?: Array<{
    id: number;
    taskCode: string;
    title: string;
    type: string;
    status: string;
    priority: string;
    estimatedHours?: number | null;
    dueDate?: string | null;
    projectName: string;
    projectCode: string;
  }>;
}) {
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }));
  }, []);

  const isExecutive = userRole === "executive";

  // Owner / Management Live PostgreSQL Stats
  const ownerStats = [
    { name: 'Total Revenue', value: dbStats.totalRevenue || '₹0', trend: 'Live Invoices Total', icon: IndianRupee, changeType: 'positive', hasDetails: false, href: '/invoices' },
    { name: 'Pending Payments', value: dbStats.pendingPayments || '₹0', trend: 'Outstanding Invoices', icon: Clock, changeType: 'negative', hasDetails: false, href: '/invoices' },
    { name: 'Total Leads', value: dbStats.totalLeads, trend: 'Pipeline queue', icon: Users, changeType: 'positive', hasDetails: true, href: '/clients' },
    { name: 'Active Clients', value: dbStats.activeClients, trend: 'Won deals', icon: UserCheck, changeType: 'positive', hasDetails: true, href: '/clients' },
    { name: 'Conversion Rate', value: dbStats.conversionRate, trend: 'Lead conversion', icon: TrendingUp, changeType: 'positive', hasDetails: false, href: '/clients' },
    { name: 'Active Projects', value: dbStats.activeProjects || '0', trend: 'In Progress', icon: FolderKanban, changeType: 'neutral', hasDetails: false, href: '/projects' },
    { name: 'Pending Tasks', value: dbStats.pendingTasks || '0', trend: 'Sprint tasks', icon: CheckSquare, changeType: 'neutral', hasDetails: true, href: '/projects' },
  ];

  // Executive / BD Intern Personal Stats
  const executiveStats = [
    { name: 'My Assigned Leads', value: dbStats.myAssignedLeads, trend: 'Active calling queue', icon: Users, changeType: 'positive', href: '/clients' },
    { name: 'Calls Logged', value: dbStats.myCalls, trend: 'Total summaries', icon: PhoneCall, changeType: 'positive', href: '/clients' },
    { name: 'Converted Clients', value: dbStats.myConvertedLeads, trend: 'Successful deals', icon: CheckCircle2, changeType: 'positive', href: '/clients' },
    { name: 'Follow-ups Needed', value: '0', trend: 'Scheduled calls', icon: Clock, changeType: 'neutral', href: '/clients' },
  ];

  // Target calculations for personal employee dashboard
  const conversionTarget = currentMemberRecord?.targetConversions || 0;
  const revenueTarget = currentMemberRecord?.targetRevenue || 0;
  const convertedCount = currentMemberRecord?.convertedLeadsCount || 0;
  const generatedRevenue = currentMemberRecord?.generatedRevenue || 0;
  const commissionRate = currentMemberRecord?.commissionRate || 0;
  const earnedCommission = currentMemberRecord?.earnedCommission || 0;

  const conversionPct = conversionTarget > 0 ? Math.min(100, Math.round((convertedCount / conversionTarget) * 100)) : 0;
  const revenuePct = revenueTarget > 0 ? Math.min(100, Math.round((generatedRevenue / revenueTarget) * 100)) : 0;

  return (
    <div className="w-full space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isExecutive ? `Welcome, ${userName}` : "Executive Dashboard"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isExecutive 
              ? "Here is your personal lead assignment, calling queue, performance targets, and leaderboard overview."
              : "Welcome back! Here is what's happening with your business today."}
          </p>
        </div>
        {currentDate && (
          <div className="flex items-center text-sm font-medium text-gray-500 bg-white px-3 py-1.5 rounded-sm border border-gray-200">
            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
            {currentDate}
          </div>
        )}
      </div>

      {/* Executive / BD Intern View */}
      {isExecutive ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {executiveStats.map((item) => (
              <div key={item.name} className="relative overflow-hidden rounded-sm bg-white border border-gray-200 p-5 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-sm bg-blue-50 text-blue-600 border border-blue-100">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-xs bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {item.trend}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{item.name}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Personal Employee Target Goals & Incentive Card */}
          {currentMemberRecord && (
            <div className="bg-white rounded-sm border border-gray-200 p-5 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">My Monthly Target & Incentive Payout Breakdown</h2>
                    <p className="text-xs text-gray-500">Live progress tracking of your conversion goals & commission payouts.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded border border-gray-200">
                    Shift: {currentMemberRecord.shiftStart || "09:00"} - {currentMemberRecord.shiftEnd || "18:00"}
                  </span>
                  <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded border border-blue-100">
                    {currentMemberRecord.workLocation || "Office"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Target Conversions Goal */}
                <div className="bg-gray-50 p-4 rounded-sm border border-gray-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 font-semibold">Conversion Goal</span>
                    <span className="font-bold text-indigo-600">{conversionPct}% Done</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {convertedCount} / {conversionTarget || "—"} <span className="text-xs font-normal text-gray-500">Leads Converted</span>
                  </p>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 transition-all" style={{ width: `${conversionPct}%` }} />
                  </div>
                </div>

                {/* Target Revenue Goal */}
                <div className="bg-gray-50 p-4 rounded-sm border border-gray-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 font-semibold">Closed Revenue Goal</span>
                    <span className="font-bold text-emerald-600">{revenuePct}% Done</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    ₹{generatedRevenue.toLocaleString('en-IN')} / {revenueTarget ? `₹${revenueTarget.toLocaleString('en-IN')}` : "—"}
                  </p>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 transition-all" style={{ width: `${revenuePct}%` }} />
                  </div>
                </div>

                {/* Earned Commission Incentive */}
                <div className="bg-amber-50/60 p-4 rounded-sm border border-amber-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-amber-900 font-semibold">Earned Incentive Commission</span>
                    <span className="font-bold text-amber-700">{commissionRate}% Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-900">
                    +₹{earnedCommission.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-amber-800 font-medium">
                    Calculated on total closed deals revenue.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Action Box for BD Intern */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-base font-bold text-blue-950 flex items-center gap-2 justify-center sm:justify-start">
                <PhoneCall className="w-5 h-5 text-blue-600" /> Start Calling Assigned Leads
              </h3>
              <p className="text-xs text-blue-800">
                You have leads auto-assigned to your account. Open your leads queue to make calls, add call summaries, and update lead status.
              </p>
            </div>
            <Link
              href="/clients"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-sm font-semibold text-xs hover:bg-blue-700 transition-colors shadow-2xs shrink-0"
            >
              Go to My Leads Queue <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* My Assigned Project Tasks & Daily Deliverables */}
          {myAssignedProjectTasks && myAssignedProjectTasks.length > 0 && (
            <div className="bg-white rounded-sm border border-gray-200 overflow-hidden shadow-2xs space-y-3 p-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-gray-900">My Assigned Tasks & Deliverables</h3>
                </div>
                <Link href="/projects" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  Open Project Sprint Board <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {myAssignedProjectTasks.map((t) => (
                  <div key={t.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                          {t.taskCode}
                        </span>
                        <span className="font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                          {t.projectName}
                        </span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          t.type === "Bug" ? "bg-red-50 text-red-700 border border-red-200" :
                          t.type === "SEO" ? "bg-cyan-50 text-cyan-700 border border-cyan-200" :
                          "bg-purple-50 text-purple-700 border border-purple-200"
                        }`}>
                          {t.type}
                        </span>
                      </div>
                      <p className="font-bold text-gray-900">{t.title}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                        t.status === "Done" ? "bg-emerald-100 text-emerald-800" :
                        t.status === "In Progress" ? "bg-indigo-100 text-indigo-800" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {t.status}
                      </span>

                      <button
                        onClick={async () => {
                          const newStatus = t.status === "Done" ? "In Progress" : "Done";
                          const { updateTaskStatusAction } = await import("@/features/projects/actions");
                          await updateTaskStatusAction(t.id, newStatus);
                          window.location.reload();
                        }}
                        className={`px-3 py-1 rounded-sm text-xs font-semibold cursor-pointer border transition-colors ${
                          t.status === "Done" 
                            ? "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                            : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-2xs"
                        }`}
                      >
                        {t.status === "Done" ? "Re-open Task" : "✓ Mark Complete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Owner / Management View */
        <div className="space-y-6">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ownerStats.map((item) => (
              <div key={item.name} className="relative overflow-hidden rounded-sm bg-white border border-gray-200 flex flex-col">
                <div className="px-4 pb-2 pt-5 sm:px-6 sm:pt-6">
                  <dt>
                    <div className="absolute rounded-sm p-3 bg-blue-50 text-blue-600">
                      <item.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-gray-900">{item.name}</p>
                  </dt>
                  <dd className="ml-16 flex items-baseline pb-4">
                    <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                    <p className={classNames(item.changeType === 'positive' ? 'text-green-600' : item.changeType === 'negative' ? 'text-red-600' : 'text-gray-500', 'ml-2 flex items-baseline text-sm font-semibold')}>
                      {item.trend}
                    </p>
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Auto-Ranked Monthly Leaderboard List View (Visible to ALL roles) */}
      {leaderboardMembers.length > 0 && (
        <div className="bg-white rounded-sm border border-gray-200 overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-slate-900 text-white">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider">Monthly Sales & BD Performance Leaderboard</h2>
                <p className="text-[11px] text-slate-400 font-normal">Ranked automatically by closed deals revenue & lead conversion targets.</p>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              Sales & BD Rankings
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-gray-200 min-w-[700px]">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-center">Rank</th>
                  <th className="px-5 py-3">Team Member</th>
                  <th className="px-5 py-3">Department & Designation</th>
                  <th className="px-5 py-3 text-center">Leads Converted</th>
                  <th className="px-5 py-3 text-right">Revenue Closed</th>
                  <th className="px-5 py-3 text-right">Incentive Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white text-xs">
                {leaderboardMembers.map((member, index) => {
                  const rank = index + 1;
                  const isTop1 = rank === 1;
                  const isTop2 = rank === 2;
                  const isTop3 = rank === 3;

                  const badgeClass = isTop1 
                    ? "bg-amber-500 text-white font-extrabold shadow-2xs" 
                    : isTop2 
                    ? "bg-slate-400 text-white font-bold" 
                    : isTop3 
                    ? "bg-amber-700 text-white font-bold" 
                    : "bg-gray-100 text-gray-700 font-semibold";

                  const badgeIcon = isTop1 ? "#1 Top Producer" : isTop2 ? "#2 Lead Converter" : isTop3 ? "#3 Sales Star" : `#${rank}`;
                  const generatedRevenue = member.generatedRevenue || 0;
                  const convertedCount = member.convertedLeadsCount || 0;
                  const commissionRate = member.commissionRate || 0;
                  const earnedCommission = member.earnedCommission || 0;
                  const isCurrentLoggedInUser = currentMemberRecord && member.memberId === currentMemberRecord.memberId;

                  return (
                    <tr key={member.memberId} className={isCurrentLoggedInUser ? "bg-blue-50/70 font-semibold border-l-4 border-l-blue-600" : isTop1 ? "bg-amber-50/30 font-medium" : "hover:bg-gray-50/50"}>
                      {/* Rank Badge */}
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <span className={`inline-block text-xs px-2.5 py-1 rounded-full ${badgeClass}`}>
                          {badgeIcon}
                        </span>
                      </td>

                      {/* Team Member Profile */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {member.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                              <span>{member.user.name}</span>
                              {isCurrentLoggedInUser && <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">You</span>}
                            </p>
                            <p className="text-[11px] text-gray-500">{member.user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Department & Designation */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="font-semibold text-gray-800">{member.designation || "Sales Representative"}</p>
                        <p className="text-[11px] text-gray-500">{member.department || "Sales & Marketing"}</p>
                      </td>

                      {/* Converted Leads */}
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                          {convertedCount} Deals
                        </span>
                      </td>

                      {/* Revenue Closed */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap font-bold text-emerald-700">
                        ₹{generatedRevenue.toLocaleString('en-IN')}
                      </td>

                      {/* Incentive Earned */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        {commissionRate > 0 ? (
                          <div className="font-bold text-amber-700">
                            +₹{earnedCommission.toLocaleString('en-IN')} <span className="text-[10px] text-gray-500">({commissionRate}%)</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px]">No commission set</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
