"use client";

import { useState, useTransition } from "react";
import { 
  FolderKanban, Plus, Bug, CheckCircle2, Clock, AlertCircle, 
  User, CheckSquare, Search, ChevronDown, ChevronUp, Tag, Sparkles, Filter, Code2, ArrowRight
} from "lucide-react";
import { 
  createProjectAction, 
  updateProjectStatusAction, 
  createProjectTaskAction, 
  updateTaskStatusAction, 
  deleteTaskAction 
} from "@/features/projects/actions";

interface Project {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  clientId?: number | null;
  clientName?: string | null;
  status: string;
  priority: string;
  techStack?: string | null;
  startDate?: string | null;
  deadline?: string | null;
  budget?: number | null;
  projectManagerId?: number | null;
  projectManagerName?: string | null;
  createdAt: string | Date;
}

interface ProjectTask {
  id: number;
  projectId: number;
  taskCode: string;
  title: string;
  description?: string | null;
  type: string; // Bug, Story, Task, Improvement, SEO
  status: string; // To Do, In Progress, Done
  priority: string; // Highest, High, Medium, Low
  assigneeId?: number | null;
  assigneeName?: string | null;
  estimatedHours?: number | null;
  loggedHours?: number | null;
  dueDate?: string | null;
  createdAt: string | Date;
}

export default function ProjectsView({
  initialProjects = [],
  initialTasks = [],
  clientsList = [],
  teamMembers = [],
  currentUserRole = "owner",
}: {
  initialProjects: Project[];
  initialTasks: ProjectTask[];
  clientsList: any[];
  teamMembers: any[];
  currentUserRole?: string;
}) {
  const [projectsList, setProjectsList] = useState<Project[]>(initialProjects);
  const [tasksList, setTasksList] = useState<ProjectTask[]>(initialTasks);

  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(
    initialProjects.length > 0 ? initialProjects[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedProjectForNewTask, setSelectedProjectForNewTask] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const isOwnerOrAdmin = currentUserRole === "owner" || currentUserRole === "admin" || currentUserRole === "manager" || currentUserRole === "project_manager";

  // Filter Projects by Search
  const filteredProjects = projectsList.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || (p.clientName || "").toLowerCase().includes(q);
  });

  // Calculate System Metrics
  const totalBugs = tasksList.filter((t) => t.type === "Bug" && t.status !== "Done").length;
  const inProgressTasks = tasksList.filter((t) => t.status === "In Progress").length;
  const completedTasks = tasksList.filter((t) => t.status === "Done").length;

  const handleTaskStatusChange = (taskId: number, newStatus: string) => {
    startTransition(async () => {
      const res = await updateTaskStatusAction(taskId, newStatus);
      if (res.success) {
        setTasksList((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
      } else {
        alert("Failed to update task: " + res.error);
      }
    });
  };

  const handleProjectStatusChange = (projectId: number, newStatus: string) => {
    startTransition(async () => {
      const res = await updateProjectStatusAction(projectId, newStatus);
      if (res.success) {
        setProjectsList((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
        );
      } else {
        alert("Failed to update project status: " + res.error);
      }
    });
  };

  const handleAddProjectSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createProjectAction(formData);
      if (res.success) {
        setIsAddProjectModalOpen(false);
        window.location.reload();
      } else {
        alert("Failed to create project: " + res.error);
      }
    });
  };

  const handleAddTaskSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createProjectTaskAction(formData);
      if (res.success) {
        setIsAddTaskModalOpen(false);
        window.location.reload();
      } else {
        alert("Failed to create task: " + res.error);
      }
    });
  };

  const handleDeleteTask = (taskId: number, taskCode: string) => {
    if (!confirm(`Are you sure you want to delete task ${taskCode}?`)) return;
    startTransition(async () => {
      const res = await deleteTaskAction(taskId);
      if (res.success) {
        setTasksList((prev) => prev.filter((t) => t.id !== taskId));
      } else {
        alert("Failed to delete task: " + res.error);
      }
    });
  };

  return (
    <div className="space-y-3 w-full">
      {/* Header & Main Bar */}
      <div className="bg-white p-3.5 rounded-sm border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FolderKanban className="w-4.5 h-4.5 text-blue-600" /> Simplified Project & Task Deliverables Manager
          </h1>
          <p className="mt-0.5 text-xs text-gray-500">
            Simplified Part-by-Part Project Modules, Task Assignments & Real-time Progress Tracking for Team Members.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isOwnerOrAdmin && (
            <button
              onClick={() => setIsAddProjectModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" /> Add New Project
            </button>
          )}

          <button
            onClick={() => {
              setSelectedProjectForNewTask(projectsList.length > 0 ? projectsList[0].id : null);
              setIsAddTaskModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Assign New Task / Bug
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-2.5 rounded-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Projects</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{projectsList.length}</p>
          </div>
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
            <FolderKanban className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Tasks In Progress</p>
            <p className="text-lg font-bold text-indigo-600 mt-0.5">{inProgressTasks}</p>
          </div>
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Open Bugs</p>
            <p className="text-lg font-bold text-red-600 mt-0.5">{totalBugs}</p>
          </div>
          <div className="p-1.5 bg-red-50 text-red-600 rounded">
            <Bug className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Completed Tasks</p>
            <p className="text-lg font-bold text-emerald-600 mt-0.5">{completedTasks}</p>
          </div>
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-2 rounded-sm border border-gray-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, code, or client..."
            className="w-full text-xs py-1.5 outline-none border-b border-transparent focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-gray-500 font-medium">Task Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="font-semibold py-1 px-2.5 rounded-sm border border-gray-200 bg-white"
            >
              <option value="all">All Types</option>
              <option value="Bug">🐞 Bugs</option>
              <option value="Story">📖 Features</option>
              <option value="Task">🛠️ Tasks</option>
              <option value="Improvement">⚡ Improvements</option>
              <option value="SEO">🔍 SEO Tasks</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-gray-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="font-semibold py-1 px-2.5 rounded-sm border border-gray-200 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="To Do">Pending (To Do)</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects List & Part-by-Part Task Accordion Modules */}
      <div className="space-y-4">
        {filteredProjects.map((project) => {
          const isExpanded = expandedProjectId === project.id;
          const projectTasks = tasksList.filter((t) => {
            if (t.projectId !== project.id) return false;
            if (typeFilter !== "all" && t.type !== typeFilter) return false;
            if (statusFilter !== "all" && t.status !== statusFilter) return false;
            return true;
          });

          const totalPrjTasks = tasksList.filter((t) => t.projectId === project.id).length;
          const donePrjTasks = tasksList.filter((t) => t.projectId === project.id && t.status === "Done").length;
          const progressPct = totalPrjTasks > 0 ? Math.round((donePrjTasks / totalPrjTasks) * 100) : 0;

          return (
            <div
              key={project.id}
              className="bg-white rounded-sm border border-gray-200 overflow-hidden transition-all"
            >
              {/* Project Card Header Bar */}
              <div
                onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                className="p-4 bg-gray-50/70 hover:bg-gray-100/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded bg-blue-50 text-blue-700 font-mono font-extrabold text-xs border border-blue-200">
                    {project.code}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 leading-tight flex items-center gap-2">
                      {project.name}
                      {project.clientName && (
                        <span className="text-xs font-normal text-gray-500 font-sans">({project.clientName})</span>
                      )}
                    </h2>
                    {project.techStack && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.techStack.split(",").map((tech, idx) => (
                          <span key={idx} className="text-[10px] font-semibold bg-white text-gray-600 px-2 py-0.2 rounded border border-gray-200">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                  {/* Progress Bar */}
                  <div className="w-44 space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-gray-600">
                      <span>Progress</span>
                      <span className="text-blue-700 font-bold">{donePrjTasks}/{totalPrjTasks} Done ({progressPct}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                      project.status === "Completed" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {project.status}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProjectForNewTask(project.id);
                        setIsAddTaskModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-white px-2.5 py-1 rounded border border-blue-200 hover:bg-blue-50 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Task
                    </button>

                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Part-by-Part Task List */}
              {isExpanded && (
                <div className="p-4 border-t border-gray-200 bg-white space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 uppercase tracking-wider pb-2 border-b border-gray-100">
                    <span>Project Module Parts & Deliverables ({projectTasks.length} Tasks)</span>
                    <span className="text-gray-500 font-normal font-sans">PM: {project.projectManagerName || "Unassigned"}</span>
                  </div>

                  {projectTasks.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      No tasks or bugs assigned under this project yet. Click &quot;Add Task&quot; above to assign work to team members.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {projectTasks.map((task) => {
                        const isDone = task.status === "Done";
                        const isInProgress = task.status === "In Progress";

                        return (
                          <div
                            key={task.id}
                            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/60 p-2 rounded transition-colors text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                                  {task.taskCode}
                                </span>
                                <span
                                  className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                    task.type === "Bug"
                                      ? "bg-red-50 text-red-700 border border-red-200"
                                      : task.type === "SEO"
                                      ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                                      : task.type === "Story"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-blue-50 text-blue-700 border border-blue-200"
                                  }`}
                                >
                                  {task.type === "Bug" && "🐞 "}
                                  {task.type === "SEO" && "🔍 "}
                                  {task.type}
                                </span>

                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                    task.priority === "Highest"
                                      ? "bg-red-600 text-white"
                                      : task.priority === "High"
                                      ? "bg-orange-500 text-white"
                                      : "bg-blue-500 text-white"
                                  }`}
                                >
                                  {task.priority}
                                </span>
                              </div>

                              <p className={`font-bold text-gray-900 ${isDone ? "line-through text-gray-400" : ""}`}>
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-gray-500 text-[11px] line-clamp-1">{task.description}</p>
                              )}
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                              <div className="flex items-center gap-1.5 text-gray-700 font-semibold text-[11px]">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                <span>{task.assigneeName || "Unassigned"}</span>
                              </div>

                              {task.estimatedHours && task.estimatedHours > 0 ? (
                                <span className="text-[11px] text-gray-500 font-mono">⏱ {task.estimatedHours}h</span>
                              ) : null}

                              {/* Simplified Status Switcher Button */}
                              <select
                                value={task.status}
                                onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                                disabled={isPending}
                                className={`font-bold py-1 px-2.5 rounded border text-xs cursor-pointer ${
                                  isDone
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : isInProgress
                                    ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                                    : "bg-gray-100 text-gray-700 border-gray-200"
                                }`}
                              >
                                <option value="To Do">Pending (To Do)</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">✓ Done / Complete</option>
                              </select>

                              <button
                                onClick={() => handleDeleteTask(task.id, task.taskCode)}
                                className="text-gray-300 hover:text-red-600 font-bold px-1"
                                title="Delete task"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="bg-white p-12 text-center rounded-sm border border-gray-200 text-gray-500 text-xs">
            No projects found matching your search filter. Click &quot;Add New Project&quot; above to get started.
          </div>
        )}
      </div>

      {/* Add New Project Modal */}
      {isAddProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-sm bg-white border border-gray-200 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-blue-600" /> Create New Project & Deliverable
              </h2>
              <button
                onClick={() => setIsAddProjectModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-light cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProjectSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Project Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Villa Project / Client Engagement"
                    className="w-full rounded-sm border border-gray-200 p-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Project Code Prefix *</label>
                  <input
                    type="text"
                    name="code"
                    required
                    placeholder="e.g. PRJ-001, DELIV-101"
                    className="w-full rounded-sm border border-gray-200 p-2 uppercase font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Link CRM Client Deal</label>
                  <select name="clientId" className="w-full rounded-sm border border-gray-200 p-2 bg-white focus:border-blue-500 focus:outline-none">
                    <option value="">No Client (Internal Project)</option>
                    {clientsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Services / Category Tags</label>
                  <input
                    type="text"
                    name="techStack"
                    placeholder="e.g. Site Visit, Blueprint / Consultation"
                    className="w-full rounded-sm border border-gray-200 p-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Project Manager / Lead</label>
                  <select name="projectManagerId" className="w-full rounded-sm border border-gray-200 p-2 bg-white focus:border-blue-500 focus:outline-none">
                    <option value="">Assign PM</option>
                    {teamMembers.map((m) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.name} ({m.designation || m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Start Date</label>
                  <input type="date" name="startDate" className="w-full rounded-sm border border-gray-200 p-2 focus:border-blue-500 focus:outline-none" />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Deadline Date</label>
                  <input type="date" name="deadline" className="w-full rounded-sm border border-gray-200 p-2 focus:border-blue-500 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Project Description & Scope</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Detailed project scope and key milestones..."
                  className="w-full rounded-sm border border-gray-200 p-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddProjectModalOpen(false)}
                  className="rounded-sm border border-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-sm bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Creating Project..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Issue / Bug Modal */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-sm bg-white border border-gray-200 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Assign New Task / Bug Deliverable
              </h2>
              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-light cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTaskSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Select Project *</label>
                  <select
                    name="projectId"
                    required
                    defaultValue={selectedProjectForNewTask || (projectsList.length > 0 ? projectsList[0].id : "")}
                    className="w-full rounded-sm border border-gray-200 p-2 bg-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select Project</option>
                    {projectsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Task Type *</label>
                  <select name="type" defaultValue="Task" className="w-full rounded-sm border border-gray-200 p-2 bg-white focus:border-blue-500 focus:outline-none">
                    <option value="Task">🛠️ Engineering Task</option>
                    <option value="Bug">🐞 Bug / Code Error</option>
                    <option value="Story">📖 Feature / Deliverable</option>
                    <option value="Improvement">⚡ Enhancement / Improvement</option>
                    <option value="SEO">🔍 SEO / Marketing Task</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Task Title & Summary *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Build payment checkout API or Write SEO meta tags..."
                  className="w-full rounded-sm border border-gray-200 p-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Assign Team Member</label>
                  <select name="assigneeId" className="w-full rounded-sm border border-gray-200 p-2 bg-white focus:border-blue-500 focus:outline-none">
                    <option value="">Unassigned</option>
                    {teamMembers.map((m) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.name} ({m.designation || m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Priority</label>
                  <select name="priority" defaultValue="High" className="w-full rounded-sm border border-gray-200 p-2 bg-white focus:border-blue-500 focus:outline-none">
                    <option value="Highest">Highest (P0 - Blocker)</option>
                    <option value="High">High (P1)</option>
                    <option value="Medium">Medium (P2)</option>
                    <option value="Low">Low (P3)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Estimated Hours (h)</label>
                  <input
                    type="number"
                    name="estimatedHours"
                    placeholder="e.g. 4"
                    className="w-full rounded-sm border border-gray-200 p-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Detailed Requirements & Scope</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Type task details or instructions for the team member..."
                  className="w-full rounded-sm border border-gray-200 p-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="rounded-sm border border-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-sm bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Assigning Task..." : "Assign Task to Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
