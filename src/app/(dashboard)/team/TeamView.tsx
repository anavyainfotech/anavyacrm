"use client";

import { useState, useTransition } from "react";
import { UserPlus, Shield, Key, Trash2, Edit3, UserCheck, ShieldCheck, Mail, Check, X, BadgeCheck, Phone, Briefcase, Calendar, Building2, Eye, ExternalLink, Sparkles, MessageSquare, CreditCard, FileText, MapPin, Heart, Landmark, IndianRupee, Clock, Laptop, Lock, Target, TrendingUp, RefreshCw, UserX, Sliders, LayoutGrid, List, Trophy, Award, Zap, Percent, Clock3, Search } from "lucide-react";
import {
  addEmployeeAction,
  updateEmployeePermissionsAction,
  updateTeamMemberProfileAction,
  resetMemberPasswordAction,
  removeEmployeeAction,
  updateMemberStatusAction,
  updateMemberTargetsAction,
  reassignMemberLeadsAction,
  updateMemberCommissionAndShiftAction,
} from "@/features/team/actions";
import {
  ALL_PERMISSIONS,
  DEFAULT_PERMISSIONS,
  ROLE_PRESETS,
  parsePermissions,
  UserPermissions,
  PermissionKey,
} from "@/lib/permissions";

interface TeamMember {
  memberId: number;
  memberCode?: string | null;
  phone?: string | null;
  designation?: string | null;
  department?: string | null;
  employmentType?: string | null;
  workLocation?: string | null;
  salary?: number | null;
  joiningDate?: string | null;
  dob?: string | null;
  bloodGroup?: string | null;
  emergencyContact?: string | null;
  panNumber?: string | null;
  aadhaarNumber?: string | null;
  bankDetails?: string | null;
  address?: string | null;
  notes?: string | null;
  status?: string | null;
  targetConversions?: number | null;
  targetRevenue?: number | null;
  commissionRate?: number | null;
  shiftStart?: string | null;
  shiftEnd?: string | null;
  role: string;
  permissions: string;
  createdAt: string | Date;
  assignedLeadsCount?: number;
  convertedLeadsCount?: number;
  generatedRevenue?: number;
  earnedCommission?: number;
  user: {
    id: number;
    name: string;
    email: string;
    image?: string | null;
  };
}

export default function TeamView({
  initialMembers,
  currentUserRole,
}: {
  initialMembers: TeamMember[];
  currentUserRole: string;
}) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPermissionsMember, setEditingPermissionsMember] = useState<TeamMember | null>(null);
  const [resetPasswordMember, setResetPasswordMember] = useState<TeamMember | null>(null);
  const [profileModalMember, setProfileModalMember] = useState<TeamMember | null>(null);
  const [editingTargetsMember, setEditingTargetsMember] = useState<TeamMember | null>(null);
  const [reassigningLeadsMember, setReassigningLeadsMember] = useState<TeamMember | null>(null);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [targetConversionsInput, setTargetConversionsInput] = useState<number>(0);
  const [targetRevenueInput, setTargetRevenueInput] = useState<number>(0);
  const [commissionRateInput, setCommissionRateInput] = useState<number>(0);
  const [shiftStartInput, setShiftStartInput] = useState<string>("09:00");
  const [shiftEndInput, setShiftEndInput] = useState<string>("18:00");
  const [selectedReassignUserId, setSelectedReassignUserId] = useState<number | null>(null);

  const [selectedRole, setSelectedRole] = useState<string>("executive");
  const [permissionsState, setPermissionsState] = useState<UserPermissions>(
    ROLE_PRESETS.executive.permissions
  );

  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isOwnerOrAdmin = currentUserRole === "owner" || currentUserRole === "admin";

  // Calculate Leaderboard Rankings
  const leaderboardSorted = [...initialMembers].sort(
    (a, b) => (b.generatedRevenue || 0) - (a.generatedRevenue || 0) || (b.convertedLeadsCount || 0) - (a.convertedLeadsCount || 0)
  );

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    if (role !== "custom" && ROLE_PRESETS[role]) {
      setPermissionsState(ROLE_PRESETS[role].permissions);
    }
  };

  const togglePermission = (key: PermissionKey) => {
    setSelectedRole("custom");
    setPermissionsState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleOpenAddModal = () => {
    setErrorMsg(null);
    setSelectedRole("executive");
    setPermissionsState(ROLE_PRESETS.executive.permissions);
    setIsAddModalOpen(true);
  };

  const handleOpenEditPermissionsModal = (member: TeamMember) => {
    setErrorMsg(null);
    setEditingPermissionsMember(member);
    setSelectedRole(member.role);
    setPermissionsState(parsePermissions(member.permissions, member.role));
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);
    formData.set("role", selectedRole);
    formData.set("permissions", JSON.stringify(permissionsState));

    startTransition(async () => {
      const res = await addEmployeeAction(formData);
      if (res.success) {
        setIsAddModalOpen(false);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Failed to add team member");
      }
    });
  };

  const handleEditPermissionsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPermissionsMember) return;

    startTransition(async () => {
      const res = await updateEmployeePermissionsAction(
        editingPermissionsMember.memberId,
        selectedRole,
        permissionsState
      );
      if (res.success) {
        setEditingPermissionsMember(null);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Failed to update permissions");
      }
    });
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordMember || !newPasswordInput.trim()) return;

    setErrorMsg(null);
    startTransition(async () => {
      const res = await resetMemberPasswordAction(resetPasswordMember.memberId, newPasswordInput);
      if (res.success) {
        setResetPasswordMember(null);
        setNewPasswordInput("");
        alert(`🔑 Password for ${resetPasswordMember.user.name} updated successfully!`);
      } else {
        setErrorMsg(res.error || "Failed to reset password");
      }
    });
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profileModalMember) return;

    const formData = new FormData(e.currentTarget);
    formData.set("memberId", String(profileModalMember.memberId));

    startTransition(async () => {
      const res = await updateTeamMemberProfileAction(formData);
      if (res.success) {
        setIsEditingProfile(false);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Failed to update profile");
      }
    });
  };

  const handleRemove = (memberId: number, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from your team?`)) {
      startTransition(async () => {
        const res = await removeEmployeeAction(memberId);
        if (res.success) {
          window.location.reload();
        } else {
          alert(res.error || "Failed to remove member");
        }
      });
    }
  };

  const handleStatusChange = (memberId: number, newStatus: string) => {
    startTransition(async () => {
      const res = await updateMemberStatusAction(memberId, newStatus);
      if (res.success) {
        window.location.reload();
      } else {
        alert(res.error || "Failed to update status");
      }
    });
  };

  const handleOpenTargetsModal = (member: TeamMember) => {
    setErrorMsg(null);
    setEditingTargetsMember(member);
    setTargetConversionsInput(member.targetConversions || 0);
    setTargetRevenueInput(member.targetRevenue || 0);
    setCommissionRateInput(member.commissionRate || 0);
    setShiftStartInput(member.shiftStart || "09:00");
    setShiftEndInput(member.shiftEnd || "18:00");
  };

  const handleUpdateTargetsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTargetsMember) return;

    setErrorMsg(null);
    startTransition(async () => {
      const res1 = await updateMemberTargetsAction(
        editingTargetsMember.memberId,
        targetConversionsInput,
        targetRevenueInput
      );

      const res2 = await updateMemberCommissionAndShiftAction(
        editingTargetsMember.memberId,
        commissionRateInput,
        shiftStartInput,
        shiftEndInput
      );

      if (res1.success && res2.success) {
        setEditingTargetsMember(null);
        window.location.reload();
      } else {
        setErrorMsg(res1.error || res2.error || "Failed to update settings");
      }
    });
  };

  const handleOpenReassignModal = (member: TeamMember) => {
    setErrorMsg(null);
    setReassigningLeadsMember(member);
    const availableTargets = initialMembers.filter(
      (m) => m.user.id !== member.user.id && (m.status || "active") === "active"
    );
    setSelectedReassignUserId(availableTargets.length > 0 ? availableTargets[0].user.id : null);
  };

  const handleReassignLeadsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningLeadsMember || !selectedReassignUserId) return;

    setErrorMsg(null);
    startTransition(async () => {
      const res = await reassignMemberLeadsAction(reassigningLeadsMember.user.id, selectedReassignUserId);
      if (res.success) {
        setReassigningLeadsMember(null);
        alert(`Successfully reassigned leads to the selected team member!`);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Failed to reassign leads");
      }
    });
  };

  // Filter out Founder / Owner accounts from employee list
  const employeeMembers = initialMembers.filter((m) => m.role !== "owner");

  // Helper to categorize team member flexibly by department, designation, or role
  const getMemberCategory = (m: TeamMember) => {
    const text = `${m.department || ''} ${m.designation || ''} ${m.role || ''}`.toLowerCase();
    
    if (text.includes("seo") || text.includes("search engine") || text.includes("growth")) {
      return "SEO & Growth";
    }
    if (text.includes("tech") || text.includes("software") || text.includes("qa") || text.includes("testing") || text.includes("engineering") || text.includes("frontend") || text.includes("backend") || text.includes("fullstack") || text.includes("full stack") || text.includes("devops") || /\b(dev|developer|coder)\b/i.test(text)) {
      return "Tech & Engineering";
    }
    if (text.includes("design") || text.includes("ui") || text.includes("ux") || text.includes("creative") || text.includes("graphic")) {
      return "UI/UX & Design";
    }
    if (text.includes("project") || text.includes("pm") || text.includes("scrum")) {
      return "Project Management";
    }
    if (text.includes("hr") || text.includes("human") || text.includes("recruiter") || text.includes("operations") || text.includes("ops")) {
      return "Human Resources";
    }
    if (text.includes("support") || text.includes("finance") || text.includes("billing") || text.includes("account")) {
      return "Support & Finance";
    }
    if (text.includes("sales") || text.includes("bd") || text.includes("business dev") || text.includes("cold call") || text.includes("telecaller") || text.includes("marketing")) {
      return "Sales & Marketing";
    }

    return "Tech & Engineering";
  };

  const departmentsList = [
    { label: "All Employees", value: "All" },
    { label: "Sales & BD", value: "Sales & Marketing" },
    { label: "SEO & Growth", value: "SEO & Growth" },
    { label: "Tech & Dev", value: "Tech & Engineering" },
    { label: "UI/UX & Design", value: "UI/UX & Design" },
    { label: "Project Mgmt", value: "Project Management" },
    { label: "HR & Ops", value: "Human Resources" },
    { label: "Support & Finance", value: "Support & Finance" },
  ];

  const filteredMembers = employeeMembers.filter((m) => {
    // Department Tab Filter
    if (selectedDepartmentFilter !== "All") {
      const category = getMemberCategory(m);
      if (category !== selectedDepartmentFilter) return false;
    }
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3.5 rounded-sm border border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" /> Hybrid IT Team Directory & Management
          </h1>
          <p className="mt-0.5 text-xs text-gray-500">
            Enterprise OS for Software Engineers, Designers, Sales, Project Managers, HR & Support personnel.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* View Toggle */}
          <div className="inline-flex rounded-sm border border-gray-200 bg-gray-50 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-blue-600 border border-gray-200"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-blue-600 border border-gray-200"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <List className="w-3.5 h-3.5" /> Table
            </button>
          </div>

          {isOwnerOrAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center rounded-sm bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Department Filters Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-gray-200">
        {departmentsList.map((dept) => {
          const isActive = selectedDepartmentFilter === dept.value;
          const count = employeeMembers.filter((m) =>
            dept.value === "All" ? true : getMemberCategory(m) === dept.value
          ).length;

          return (
            <button
              key={dept.value}
              onClick={() => setSelectedDepartmentFilter(dept.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span>{dept.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? "bg-blue-700 text-blue-100" : "bg-gray-100 text-gray-600"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid View Mode */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((m, idx) => {
            const teamIdCode = m.memberCode || `AI-TM-${String(idx + 1).padStart(3, "0")}`;
            const currentStatus = m.status || "active";
            
            const conversionTarget = m.targetConversions || 0;
            const revenueTarget = m.targetRevenue || 0;
            const convertedCount = m.convertedLeadsCount || 0;
            const generatedRevenue = m.generatedRevenue || 0;

            const conversionPct = conversionTarget > 0 ? Math.min(100, Math.round((convertedCount / conversionTarget) * 100)) : 0;
            const revenuePct = revenueTarget > 0 ? Math.min(100, Math.round((generatedRevenue / revenueTarget) * 100)) : 0;

            return (
              <div
                key={m.memberId}
                className={`bg-white rounded-sm border border-gray-200 p-5 space-y-4 shadow-2xs hover:shadow-xs transition-shadow ${
                  currentStatus === "inactive" ? "opacity-75 bg-gray-50/60" : ""
                }`}
              >
                {/* Header Row: Member Info + Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0 border border-blue-200">
                      {m.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setProfileModalMember(m);
                          setIsEditingProfile(false);
                        }}
                        className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors text-left leading-snug block"
                      >
                        {m.user.name}
                      </button>
                      <p className="text-xs text-gray-500 font-mono flex items-center gap-1 mt-0.5">
                        <BadgeCheck className="w-3 h-3 text-blue-600" /> {teamIdCode}
                      </p>
                    </div>
                  </div>

                  {/* Status Dropdown / Badge */}
                  {isOwnerOrAdmin ? (
                    <select
                      value={currentStatus}
                      onChange={(e) => handleStatusChange(m.memberId, e.target.value)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-sm border cursor-pointer ${
                        currentStatus === "active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : currentStatus === "on_leave"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="on_leave">On Leave</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  ) : (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-sm border ${
                        currentStatus === "active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : currentStatus === "on_leave"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {currentStatus === "active" ? "Active" : currentStatus === "on_leave" ? "On Leave" : "Inactive"}
                    </span>
                  )}
                </div>

                {/* Designation & Contact */}
                <div className="bg-gray-50 p-2.5 rounded-sm border border-gray-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-gray-700 font-medium">
                    <span className="flex items-center gap-1 font-semibold text-gray-900">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" /> {m.designation || (m.role === "owner" ? "Founder & Admin" : "Specialist")}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                      {m.employmentType || "Full-Time"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400 shrink-0" /> <span className="truncate max-w-[140px]">{m.user.email}</span></span>
                    <span className="font-mono text-[10px] text-gray-600 bg-gray-200/60 px-1.5 py-0.2 rounded">Shift: {m.shiftStart || "09:00"}-{m.shiftEnd || "18:00"}</span>
                  </div>
                  {(m.commissionRate || 0) > 0 && (
                    <div className="flex items-center justify-between text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                      <span>Incentive ({m.commissionRate}%):</span>
                      <span>+₹{(m.earnedCommission || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* Performance & Targets - Render Sales metrics ONLY for Sales members */}
                {getMemberCategory(m) === "Sales & Marketing" ? (
                  <div className="space-y-2 border-t border-b border-gray-100 py-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-medium">Assigned Leads:</span>
                      <div className="flex items-center gap-1 font-bold text-gray-900">
                        <span>{m.assignedLeadsCount || 0} Leads</span>
                        {m.assignedLeadsCount && m.assignedLeadsCount > 0 && isOwnerOrAdmin ? (
                          <button
                            onClick={() => handleOpenReassignModal(m)}
                            title="Reassign active leads"
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {/* Target Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div>
                        <div className="flex justify-between text-[11px] text-gray-600 mb-0.5">
                          <span>Goal: {convertedCount}/{conversionTarget || "—"} Leads</span>
                          <span className="font-bold text-gray-800">{conversionTarget > 0 ? `${conversionPct}%` : "No target"}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden border border-gray-200">
                          <div
                            className={`h-full transition-all ${conversionPct >= 100 ? "bg-emerald-500" : conversionPct >= 50 ? "bg-blue-500" : "bg-amber-500"}`}
                            style={{ width: `${conversionPct}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-gray-600 mb-0.5">
                          <span>Rev Goal: ₹{generatedRevenue.toLocaleString('en-IN')}/{revenueTarget ? `₹${revenueTarget.toLocaleString('en-IN')}` : "—"}</span>
                          <span className="font-bold text-gray-800">{revenueTarget > 0 ? `${revenuePct}%` : "No target"}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden border border-gray-200">
                          <div
                            className={`h-full transition-all ${revenuePct >= 100 ? "bg-emerald-500" : revenuePct >= 50 ? "bg-indigo-500" : "bg-purple-500"}`}
                            style={{ width: `${revenuePct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 border-t border-b border-gray-100 py-3">
                    {getMemberCategory(m) === "SEO & Growth" ? (
                      <div className="bg-emerald-50/70 p-3 rounded-sm border border-emerald-200 text-xs space-y-1.5">
                        <div className="flex justify-between items-center font-bold text-emerald-900">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> SEO & Growth Specialist
                          </span>
                          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-mono">SEO active</span>
                        </div>
                        <p className="text-[11px] text-emerald-800 font-medium">Scope: SEO Audit, Keyword Rankings & Schema Markup</p>
                        <div className="text-[10px] text-emerald-900 font-mono bg-white p-1.5 rounded border border-emerald-200">
                          📌 Assigned Delivery: Nakul Properties Real Estate SEO
                        </div>
                      </div>
                    ) : getMemberCategory(m) === "UI/UX & Design" ? (
                      <div className="bg-rose-50/70 p-3 rounded-sm border border-rose-200 text-xs space-y-1.5">
                        <div className="flex justify-between items-center font-bold text-rose-900">
                          <span>🎨 UI/UX & Creative Design</span>
                          <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-mono">Figma</span>
                        </div>
                        <p className="text-[11px] text-rose-800 font-medium">Scope: Brand Wireframes, UI Systems & Mockups</p>
                      </div>
                    ) : (
                      <div className="bg-indigo-50/70 p-3 rounded-sm border border-indigo-200 text-xs space-y-1.5">
                        <div className="flex justify-between items-center font-bold text-indigo-900">
                          <span>💻 Tech & Software Engineering</span>
                          <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-mono">Full-Stack</span>
                        </div>
                        <p className="text-[11px] text-indigo-800 font-medium">Scope: Next.js, Node.js, REST APIs & DB Architecture</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Responsive Horizontal Scrollable Table View */
        <div className="overflow-x-auto rounded-sm border border-gray-200 bg-white shadow-2xs">
          <table className="w-full text-left divide-y divide-gray-200 min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status & ID</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Team Member</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Designation</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role / Leads</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Specialization / Progress</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-xs">
              {filteredMembers.map((m, idx) => {
                const teamIdCode = m.memberCode || `AI-TM-${String(idx + 1).padStart(3, "0")}`;
                const currentStatus = m.status || "active";
                const conversionTarget = m.targetConversions || 0;
                const revenueTarget = m.targetRevenue || 0;
                const convertedCount = m.convertedLeadsCount || 0;
                const generatedRevenue = m.generatedRevenue || 0;
                const isSalesMember = getMemberCategory(m) === "Sales & Marketing";

                const conversionPct = conversionTarget > 0 ? Math.min(100, Math.round((convertedCount / conversionTarget) * 100)) : 0;
                const revenuePct = revenueTarget > 0 ? Math.min(100, Math.round((generatedRevenue / revenueTarget) * 100)) : 0;

                return (
                  <tr key={m.memberId} className={`hover:bg-gray-50 transition-colors ${currentStatus === "inactive" ? "bg-gray-50/70 opacity-75" : ""}`}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setProfileModalMember(m);
                            setIsEditingProfile(false);
                          }}
                          className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-200 hover:bg-blue-100 cursor-pointer"
                        >
                          {teamIdCode}
                        </button>
                        {isOwnerOrAdmin ? (
                          <select
                            value={currentStatus}
                            onChange={(e) => handleStatusChange(m.memberId, e.target.value)}
                            className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-sm border cursor-pointer ${
                              currentStatus === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : currentStatus === "on_leave" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            <option value="active">Active</option>
                            <option value="on_leave">On Leave</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        ) : (
                          <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-sm border ${
                            currentStatus === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : currentStatus === "on_leave" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"
                          }`}>
                            {currentStatus === "active" ? "Active" : currentStatus === "on_leave" ? "On Leave" : "Inactive"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <button onClick={() => { setProfileModalMember(m); setIsEditingProfile(false); }} className="font-bold text-gray-900 hover:underline block text-left">
                          {m.user.name}
                        </button>
                        <span className="text-[11px] text-gray-500">{m.user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-indigo-900">{m.role === "owner" ? "Founder & Admin" : (m.designation || "Specialist")}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isSalesMember ? (
                        <div className="font-semibold text-gray-900 flex items-center gap-1">
                          <span>{m.assignedLeadsCount || 0} Leads ({convertedCount} Won)</span>
                          {m.assignedLeadsCount && m.assignedLeadsCount > 0 && isOwnerOrAdmin ? (
                            <button onClick={() => handleOpenReassignModal(m)} title="Reassign Leads" className="text-blue-600 hover:text-blue-800 cursor-pointer">
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          ) : null}
                        </div>
                      ) : (
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                          {m.department || getMemberCategory(m)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isSalesMember ? (
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-[10px] text-gray-600">
                            <span>{convertedCount}/{conversionTarget || "—"} Leads</span>
                            <span className="font-bold">{conversionTarget > 0 ? `${conversionPct}%` : "—"}</span>
                          </div>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full ${conversionPct >= 100 ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${conversionPct}%` }} />
                          </div>
                        </div>
                      ) : (
                        <span className="text-emerald-700 font-bold text-xs">Project Delivery & Sprint Tasks</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {isOwnerOrAdmin && (
                          <button onClick={() => handleOpenTargetsModal(m)} className="text-indigo-600 hover:underline font-semibold text-[11px] cursor-pointer">
                            Target
                          </button>
                        )}
                        <button onClick={() => { setProfileModalMember(m); setIsEditingProfile(false); }} className="text-gray-600 hover:underline font-semibold text-[11px] cursor-pointer">
                          Profile
                        </button>
                        {isOwnerOrAdmin && m.role !== "owner" && (
                          <>
                            <button onClick={() => handleOpenEditPermissionsModal(m)} className="text-blue-600 hover:underline font-semibold text-[11px] cursor-pointer">
                              Perms
                            </button>
                            {currentUserRole === "owner" && (
                              <button onClick={() => handleRemove(m.memberId, m.user.name)} className="text-red-500 hover:underline font-semibold text-[11px] cursor-pointer">
                                Remove
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Full Team Member Profile Modal */}
      {profileModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl rounded-sm bg-white border border-gray-200 overflow-y-auto max-h-[95vh] no-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-base">
                  {profileModalMember.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">
                    {profileModalMember.user.name}
                  </h2>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-xs">
                      {profileModalMember.memberCode || "AI-TM-001"}
                    </span>
                    • {profileModalMember.designation || (profileModalMember.role === "owner" ? "Founder & Owner" : "Team Member")} ({profileModalMember.department || (profileModalMember.role === "owner" ? "Management" : "Sales")})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalMember(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-light cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Quick Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50/60 p-3 rounded-sm border border-blue-100">
                <div className="flex items-center gap-4 text-xs font-semibold text-blue-900">
                  <span>📊 Assigned Leads: <strong>{profileModalMember.assignedLeadsCount || 0}</strong></span>
                  <span>✅ Converted: <strong>{profileModalMember.convertedLeadsCount || 0}</strong></span>
                  {profileModalMember.salary && (
                    <span>💰 Monthly Stipend/CTC: <strong>₹{profileModalMember.salary.toLocaleString('en-IN')}</strong></span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isOwnerOrAdmin && (
                    <button
                      onClick={() => {
                        const m = profileModalMember;
                        setProfileModalMember(null);
                        setErrorMsg(null);
                        setResetPasswordMember(m);
                        setNewPasswordInput("");
                      }}
                      className="inline-flex items-center gap-1 bg-amber-600 text-white text-xs px-2.5 py-1 rounded-sm font-medium hover:bg-amber-700 cursor-pointer"
                    >
                      <Key className="w-3 h-3" /> Reset Password
                    </button>
                  )}
                  {profileModalMember.phone && (
                    <>
                      <a
                        href={`tel:${profileModalMember.phone}`}
                        className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-sm font-medium hover:bg-emerald-700"
                      >
                        <Phone className="w-3 h-3" /> Call Member
                      </a>
                      <a
                        href={`https://wa.me/${profileModalMember.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 bg-green-600 text-white text-xs px-2.5 py-1 rounded-sm font-medium hover:bg-green-700"
                      >
                        <MessageSquare className="w-3 h-3" /> WhatsApp
                      </a>
                    </>
                  )}
                </div>
              </div>

              {!isEditingProfile ? (
                /* Read-Only Profile View */
                <div className="space-y-6">
                  {/* Personal & Contact Details */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      👤 Personal & Contact Details
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="bg-gray-50 p-3 rounded-sm border border-gray-200 space-y-1">
                        <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Email</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> {profileModalMember.user.email}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-sm border border-gray-200 space-y-1">
                        <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Phone</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {profileModalMember.phone || "Not specified"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-sm border border-gray-200 space-y-1">
                        <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Emergency Contact</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-red-400" /> {profileModalMember.emergencyContact || "—"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-sm border border-gray-200 space-y-1">
                        <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Date of Birth</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {profileModalMember.dob || "—"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-sm border border-gray-200 space-y-1">
                        <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Blood Group</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-red-500" /> {profileModalMember.bloodGroup || "—"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-sm border border-gray-200 space-y-1">
                        <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Joining Date</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> {profileModalMember.joiningDate || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Work & Employment Details */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      💼 Work & Employment Information
                    </h3>
                    <div className="grid grid-cols-4 gap-4 text-xs">
                      <div className="bg-gray-50 p-3 rounded-sm border border-gray-200 space-y-1">
                        <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Designation</p>
                        <p className="font-semibold text-gray-900">{profileModalMember.designation || (profileModalMember.role === "owner" ? "Founder & Owner" : "Sales Representative")}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-sm border border-gray-200 space-y-1">
                        <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Department</p>
                        <p className="font-semibold text-gray-900">{profileModalMember.department || (profileModalMember.role === "owner" ? "Management" : "Sales & Marketing")}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-sm border border-gray-200 space-y-1">
                        <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Employment Type</p>
                        <p className="font-semibold text-gray-900">{profileModalMember.employmentType || "Full-Time"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-sm border border-gray-200 space-y-1">
                        <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Work Location</p>
                        <p className="font-semibold text-gray-900">{profileModalMember.workLocation || "Office"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bank & Govt ID Details */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      💳 Bank & Government Identity
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="bg-gray-50 p-3 rounded-sm border border-gray-200 space-y-1">
                        <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">PAN Number</p>
                        <p className="font-mono font-semibold text-gray-900 uppercase">{profileModalMember.panNumber || "—"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-sm border border-gray-200 space-y-1">
                        <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Aadhaar Number</p>
                        <p className="font-mono font-semibold text-gray-900">{profileModalMember.aadhaarNumber || "—"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-sm border border-gray-200 space-y-1">
                        <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Bank Account & IFSC</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-1"><Landmark className="w-3.5 h-3.5 text-gray-400" /> {profileModalMember.bankDetails || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address & Notes */}
                  {(profileModalMember.address || profileModalMember.notes) && (
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      {profileModalMember.address && (
                        <div className="bg-gray-50 p-3 rounded-sm border border-gray-200 space-y-1">
                          <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Permanent Address</p>
                          <p className="text-gray-800 flex items-start gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" /> {profileModalMember.address}</p>
                        </div>
                      )}
                      {profileModalMember.notes && (
                        <div className="bg-gray-50 p-3 rounded-sm border border-gray-200 space-y-1">
                          <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Internal Notes</p>
                          <p className="text-gray-700 whitespace-pre-wrap">{profileModalMember.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Active Permissions Summary */}
                  <div className="border border-gray-200 p-3 rounded-sm space-y-2">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active System Permissions</p>
                    <div className="flex flex-wrap gap-1">
                      {ALL_PERMISSIONS.map((p) => {
                        const parsedPerms = parsePermissions(profileModalMember.permissions, profileModalMember.role);
                        const isGranted = parsedPerms[p.key];
                        return (
                          <span
                            key={p.key}
                            className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-sm ${
                              isGranted
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-gray-50 text-gray-400 border border-gray-200 line-through opacity-50"
                            }`}
                          >
                            {isGranted ? <Check className="w-2.5 h-2.5 mr-1 text-blue-600" /> : <X className="w-2.5 h-2.5 mr-1" />}
                            {p.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    {isOwnerOrAdmin && (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="rounded-sm bg-gray-100 border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 cursor-pointer flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Full Profile Details
                      </button>
                    )}
                    <button
                      onClick={() => setProfileModalMember(null)}
                      className="rounded-sm bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
                    >
                      Close Profile
                    </button>
                  </div>
                </div>
              ) : (
                /* Edit Profile Details Form */
                <form onSubmit={handleUpdateProfileSubmit} className="space-y-5">
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider pb-1 border-b border-gray-200">
                      👤 Personal & Contact Info
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                        <input type="text" name="name" defaultValue={profileModalMember.user.name} required className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                        <input type="text" name="phone" defaultValue={profileModalMember.phone || ""} placeholder="+91 9876543210" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Emergency Contact</label>
                        <input type="text" name="emergencyContact" defaultValue={profileModalMember.emergencyContact || ""} placeholder="Father/Spouse Phone" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
                        <input type="date" name="dob" defaultValue={profileModalMember.dob || ""} className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Group</label>
                        <select name="bloodGroup" defaultValue={profileModalMember.bloodGroup || ""} className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs bg-white">
                          <option value="">Select Blood Group</option>
                          <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                          <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider pb-1 border-b border-gray-200">
                      💼 Work & Payroll Info
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Designation</label>
                        <input type="text" name="designation" defaultValue={profileModalMember.designation || ""} placeholder="BD Intern" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                        <input type="text" name="department" defaultValue={profileModalMember.department || "Sales"} placeholder="Sales & Marketing" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Employment Type</label>
                        <select name="employmentType" defaultValue={profileModalMember.employmentType || "Full-Time"} className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs bg-white">
                          <option>Full-Time</option>
                          <option>Internship</option>
                          <option>Part-Time</option>
                          <option>Contractual</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Work Location</label>
                        <select name="workLocation" defaultValue={profileModalMember.workLocation || "Office"} className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs bg-white">
                          <option>Office</option>
                          <option>Remote (Work From Home)</option>
                          <option>Hybrid</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Monthly Stipend/Salary (₹)</label>
                        <input type="number" name="salary" defaultValue={profileModalMember.salary || ""} placeholder="15000" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Joining Date</label>
                        <input type="date" name="joiningDate" defaultValue={profileModalMember.joiningDate || ""} className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider pb-1 border-b border-gray-200">
                      💳 Bank & Identity IDs
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">PAN Number</label>
                        <input type="text" name="panNumber" defaultValue={profileModalMember.panNumber || ""} placeholder="ABCDE1234F" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs uppercase" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Aadhaar Number</label>
                        <input type="text" name="aadhaarNumber" defaultValue={profileModalMember.aadhaarNumber || ""} placeholder="1234 5678 9012" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Account & IFSC</label>
                        <input type="text" name="bankDetails" defaultValue={profileModalMember.bankDetails || ""} placeholder="HDFC0001234 - 50100234567" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Address</label>
                      <textarea name="address" rows={2} defaultValue={profileModalMember.address || ""} placeholder="Full address" className="block w-full rounded-sm border border-gray-200 p-2 text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Internal Notes</label>
                      <textarea name="notes" rows={2} defaultValue={profileModalMember.notes || ""} placeholder="Performance notes..." className="block w-full rounded-sm border border-gray-200 p-2 text-xs" />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="rounded-sm border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                    <button type="submit" disabled={isPending} className="rounded-sm bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
                      {isPending ? "Saving..." : "Save Profile Details"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetPasswordMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-sm bg-white border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-amber-50/50">
              <h2 className="text-base font-bold text-amber-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" /> Reset Password — {resetPasswordMember.user.name}
              </h2>
              <button
                onClick={() => setResetPasswordMember(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-light cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-red-50 text-red-600 text-xs p-2.5 rounded-sm text-center font-medium border border-red-200">
                  {errorMsg}
                </div>
              )}

              <p className="text-xs text-gray-600 leading-relaxed">
                Set a new login password for <strong>{resetPasswordMember.user.email}</strong>. They will use this password on the login screen.
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  New Password *
                </label>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  required
                  placeholder="Enter new password (min 6 chars)"
                  className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setResetPasswordMember(null)}
                  className="rounded-sm border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !newPasswordInput.trim()}
                  className="rounded-sm bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Updating Password..." : "Set New Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extended Wide Add Team Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl rounded-sm bg-white border border-gray-200 overflow-y-auto max-h-[92vh] no-scrollbar">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" /> Add New Team Member (Full Corporate Profile)
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-light cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-6">
              {errorMsg && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-sm text-center font-medium border border-red-200">
                  {errorMsg}
                </div>
              )}

              {/* Section 1: Personal & Login Credentials */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider pb-1 border-b border-gray-200 flex items-center gap-1.5">
                  👤 1. Personal Info & Login Credentials
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                    <input type="text" name="name" required placeholder="e.g. Rahul Sharma" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                    <input type="email" name="email" required placeholder="e.g. rahul@anavyainfotech.com" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Initial Login Password *</label>
                    <input type="password" name="password" required placeholder="Set password" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input type="text" name="phone" placeholder="+91 9876543210" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Emergency Contact Phone</label>
                    <input type="text" name="emergencyContact" placeholder="Parent/Spouse Phone" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
                    <input type="date" name="dob" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Section 2: Work & Employment Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider pb-1 border-b border-gray-200 flex items-center gap-1.5">
                  💼 2. Work & Employment Information
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Designation / Title</label>
                    <input
                      type="text"
                      name="designation"
                      list="designationsList"
                      placeholder="e.g. Full Stack Developer / BD Intern"
                      className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    />
                    <datalist id="designationsList">
                      <option value="Full Stack Developer" />
                      <option value="Frontend Developer (React/Next.js)" />
                      <option value="Backend Developer (Node/Python)" />
                      <option value="DevOps & Cloud Engineer" />
                      <option value="QA / Software Tester" />
                      <option value="UI/UX Designer" />
                      <option value="Project Manager" />
                      <option value="Technical Lead" />
                      <option value="BD Executive" />
                      <option value="BD Intern" />
                      <option value="HR Specialist" />
                      <option value="Customer Support Engineer" />
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                    <select name="department" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs bg-white focus:border-blue-500 focus:outline-none">
                      <option value="Tech & Engineering">Tech & Engineering</option>
                      <option value="Sales & Marketing">Sales & Marketing</option>
                      <option value="UI/UX & Design">UI/UX & Design</option>
                      <option value="Project Management">Project Management</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Support & Finance">Support & Finance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Employment Type</label>
                    <select name="employmentType" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs bg-white focus:border-blue-500 focus:outline-none">
                      <option>Full-Time</option>
                      <option>Internship</option>
                      <option>Part-Time</option>
                      <option>Contractual</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Work Location</label>
                    <select name="workLocation" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs bg-white focus:border-blue-500 focus:outline-none">
                      <option>Office</option>
                      <option>Remote (Work From Home)</option>
                      <option>Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Monthly Stipend / Salary (₹)</label>
                    <input type="number" name="salary" placeholder="e.g. 15000" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Joining Date</label>
                    <input type="date" name="joiningDate" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Section 3: Bank & Identity IDs */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider pb-1 border-b border-gray-200 flex items-center gap-1.5">
                  3. Bank & Identity IDs
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">PAN Number</label>
                    <input type="text" name="panNumber" placeholder="ABCDE1234F" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs uppercase focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Aadhaar Number</label>
                    <input type="text" name="aadhaarNumber" placeholder="1234 5678 9012" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Account & IFSC</label>
                    <input type="text" name="bankDetails" placeholder="HDFC0001234 - 50100234567" className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Section 4: Address & Notes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Permanent / Current Address</label>
                  <textarea name="address" rows={2} placeholder="Full address" className="block w-full rounded-sm border border-gray-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Internal Notes</label>
                  <textarea name="notes" rows={2} placeholder="Performance, incentives, or contract notes..." className="block w-full rounded-sm border border-gray-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none" />
                </div>
              </div>

              {/* Section 5: Role & Permissions */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider pb-1 border-b border-gray-200 flex items-center gap-1.5">
                  5. Role & Permission Checkboxes
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Assign Preset Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="developer">Software Developer / Engineer (Projects & Tech Workspace)</option>
                    <option value="designer">UI/UX & Graphic Designer (Projects & Design Assets)</option>
                    <option value="project_manager">Project Manager / Tech Lead (Projects & Sprint Management)</option>
                    <option value="executive">Sales & BD Executive (Leads & Quotations)</option>
                    <option value="manager">Sales Manager (Leads, Deals & Financials)</option>
                    <option value="support">Customer Support Specialist (Support Tickets)</option>
                    <option value="hr_finance">HR & Finance Officer (Team & Invoicing)</option>
                    <option value="owner">Founder / Owner (Full System Control)</option>
                    <option value="custom">Custom Role & Specific Permissions</option>
                  </select>
                </div>

                <div className="border border-gray-200 rounded-sm p-4 bg-gray-50/50 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ALL_PERMISSIONS.map((p) => {
                      const isChecked = permissionsState[p.key];
                      return (
                        <label
                          key={p.key}
                          className="flex items-start gap-2.5 p-2 rounded-sm hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(p.key)}
                            className="mt-0.5 h-4 w-4 rounded-xs border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <div>
                            <p className="text-xs font-semibold text-gray-900 leading-tight">{p.label}</p>
                            <p className="text-[11px] text-gray-500">{p.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-sm border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-sm bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Creating Team Member..." : "Create Full Team Member Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {editingPermissionsMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-sm bg-white border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" /> Edit Permissions — {editingPermissionsMember.user.name} ({editingPermissionsMember.memberCode || "AI-TM"})
              </h2>
              <button
                onClick={() => setEditingPermissionsMember(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-light cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditPermissionsSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-sm text-center font-medium border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Team Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white font-medium"
                >
                  <option value="developer">Software Developer / Engineer</option>
                  <option value="designer">UI/UX & Graphic Designer</option>
                  <option value="project_manager">Project Manager / Tech Lead</option>
                  <option value="executive">Sales & BD Executive</option>
                  <option value="manager">Sales Manager</option>
                  <option value="support">Customer Support Specialist</option>
                  <option value="hr_finance">HR & Finance Officer</option>
                  <option value="owner">Founder / Owner</option>
                  <option value="custom">Custom Role</option>
                </select>
              </div>

              {/* Permissions Checkboxes */}
              <div className="border border-gray-200 rounded-sm p-4 bg-gray-50/50 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ALL_PERMISSIONS.map((p) => {
                    const isChecked = permissionsState[p.key];
                    return (
                      <label
                        key={p.key}
                        className="flex items-start gap-2.5 p-2 rounded-sm hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(p.key)}
                          className="mt-0.5 h-4 w-4 rounded-xs border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div>
                          <p className="text-xs font-semibold text-gray-900 leading-tight">{p.label}</p>
                          <p className="text-[11px] text-gray-500">{p.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setEditingPermissionsMember(null)} className="rounded-sm border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isPending} className="rounded-sm bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
                  {isPending ? "Saving..." : "Save Permission Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Monthly Target Modal */}
      {editingTargetsMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-sm bg-white border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-indigo-50/50">
              <h2 className="text-base font-bold text-indigo-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" /> Set Monthly Target — {editingTargetsMember.user.name}
              </h2>
              <button
                onClick={() => setEditingTargetsMember(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-light cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateTargetsSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-red-50 text-red-600 text-xs p-2.5 rounded-sm text-center font-medium border border-red-200">
                  {errorMsg}
                </div>
              )}

              <p className="text-xs text-gray-600 leading-relaxed">
                Set monthly sales conversion & revenue goals for <strong>{editingTargetsMember.user.name}</strong>. Their progress will be displayed as live progress bars.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Conversion Goal (Leads)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={targetConversionsInput}
                    onChange={(e) => setTargetConversionsInput(parseInt(e.target.value, 10) || 0)}
                    placeholder="e.g. 5"
                    className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Revenue Target (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={targetRevenueInput}
                    onChange={(e) => setTargetRevenueInput(parseInt(e.target.value, 10) || 0)}
                    placeholder="e.g. 50000"
                    className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-indigo-600" /> Sales Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={commissionRateInput}
                    onChange={(e) => setCommissionRateInput(parseInt(e.target.value, 10) || 0)}
                    placeholder="e.g. 5 for 5% of deal value"
                    className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Incentive earned on every closed lead budget.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Clock3 className="w-3.5 h-3.5 text-indigo-600" /> Shift Start
                    </label>
                    <input
                      type="time"
                      value={shiftStartInput}
                      onChange={(e) => setShiftStartInput(e.target.value)}
                      className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Clock3 className="w-3.5 h-3.5 text-indigo-600" /> Shift End
                    </label>
                    <input
                      type="time"
                      value={shiftEndInput}
                      onChange={(e) => setShiftEndInput(e.target.value)}
                      className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500">Auto lead routing occurs only during active shift hours.</p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingTargetsMember(null)}
                  className="rounded-sm border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-sm bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Updating Goals..." : "Save Monthly Target"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Active Leads Modal */}
      {reassigningLeadsMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-sm bg-white border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-blue-50/50">
              <h2 className="text-base font-bold text-blue-900 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600" /> Reassign Active Leads — {reassigningLeadsMember.user.name}
              </h2>
              <button
                onClick={() => setReassigningLeadsMember(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-light cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReassignLeadsSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-red-50 text-red-600 text-xs p-2.5 rounded-sm text-center font-medium border border-red-200">
                  {errorMsg}
                </div>
              )}

              <p className="text-xs text-gray-600 leading-relaxed">
                Move all <strong>{reassigningLeadsMember.assignedLeadsCount || 0} active leads</strong> assigned to {reassigningLeadsMember.user.name} to another active team member so no leads get orphaned or lost.
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reassign All Leads To *
                </label>
                <select
                  value={selectedReassignUserId || ""}
                  onChange={(e) => setSelectedReassignUserId(parseInt(e.target.value, 10))}
                  required
                  className="block w-full rounded-sm border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none bg-white"
                >
                  {initialMembers
                    .filter((m) => m.user.id !== reassigningLeadsMember.user.id && (m.status || "active") === "active")
                    .map((m) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.name} ({m.designation || "Sales Exec"}) — {m.assignedLeadsCount || 0} Current Leads
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReassigningLeadsMember(null)}
                  className="rounded-sm border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !selectedReassignUserId}
                  className="rounded-sm bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Reassigning..." : "Reassign Leads Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
