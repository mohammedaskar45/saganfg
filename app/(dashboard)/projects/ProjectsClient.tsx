"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Grid,
  List,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileCheck,
  Plus,
  User,
  Calendar,
  Layers,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Inbox,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  formatDate,
  getStatusColor,
  getReturnTypeLabel,
  getInitials,
} from "@/lib/utils";

interface ProjectsClientProps {
  initialProjects: any[];
  staff: any[];
}

export default function ProjectsClient({
  initialProjects,
  staff,
}: ProjectsClientProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [view, setView] = useState<"grid" | "table">("table");
  const [search, setSearch] = useState("");
  const [returnTypeFilter, setReturnTypeFilter] = useState("ALL");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");

  // Filtering Logic
  const filteredProjects = projects.filter((project) => {
    const clientName = project.client.type === "INDIVIDUAL"
      ? `${project.client.firstName || ""} ${project.client.lastName || ""}`.trim()
      : project.client.entityName || "";
    
    const ssnEin = (project.client.ssn || "") + (project.client.ein || "");
    const matchesSearch =
      clientName.toLowerCase().includes(search.toLowerCase()) ||
      ssnEin.toLowerCase().includes(search.toLowerCase());

    const matchesReturnType = returnTypeFilter === "ALL" || project.returnType === returnTypeFilter;
    const matchesStage = stageFilter === "ALL" || project.stage === stageFilter;
    const matchesStatus = statusFilter === "ALL" || project.status === statusFilter;
    const matchesAssignee = assigneeFilter === "ALL" || project.assigneeId === assigneeFilter;
    const matchesYear = yearFilter === "ALL" || project.year.toString() === yearFilter;

    return matchesSearch && matchesReturnType && matchesStage && matchesStatus && matchesAssignee && matchesYear;
  });

  // Calculate Metrics
  const totalCount = projects.length;
  const activeCount = projects.filter((p) => p.status === "ACTIVE" || p.status === "STALLED" || p.status === "OVERDUE").length;
  const completedCount = projects.filter((p) => p.status === "COMPLETE").length;
  const overdueCount = projects.filter(
    (p) =>
      p.status === "OVERDUE" ||
      (p.dueDate && new Date(p.dueDate) < new Date() && p.status !== "COMPLETE")
  ).length;

  const completionRate = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const stages = [
    { id: "INTAKE", name: "Intake", color: "#0EA5E9" },
    { id: "WORKPAPER", name: "Workpapers", color: "#7C3AED" },
    { id: "PREP", name: "Preparation", color: "#F97316" },
    { id: "DELIVERY", name: "Delivery", color: "#22C55E" },
  ];

  const handleRowClick = (id: string) => {
    router.push(`/projects/${id}`);
  };

  // Helper to compute project progress
  const getProjectProgress = (project: any) => {
    const totalTasks = project.tasks?.length || 0;
    const completedTasks = project.tasks?.filter((t: any) => t.status === "COMPLETE" || t.status === "COMPLETED").length || 0;
    
    const totalChecklist = project.checklistItems?.length || 0;
    const receivedChecklist = project.checklistItems?.filter((c: any) => c.status === "RECEIVED" || c.status === "COMPLETE").length || 0;

    const total = totalTasks + totalChecklist;
    const completed = completedTasks + receivedChecklist;

    return total ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6">
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Engagements",
            value: totalCount,
            icon: Layers,
            color: "text-indigo-600",
            bg: "bg-indigo-50 border-indigo-100",
            desc: "All returns in system"
          },
          {
            title: "Active Pipeline",
            value: activeCount,
            icon: Clock,
            color: "text-blue-600",
            bg: "bg-blue-50 border-blue-100",
            desc: "In-progress returns"
          },
          {
            title: "Completion Rate",
            value: `${completionRate}%`,
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-50 border-green-100",
            desc: "Percentage completed"
          },
          {
            title: "Overdue Returns",
            value: overdueCount,
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-50 border-red-100",
            desc: "Requires urgent attention"
          },
        ].map((stat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            key={stat.title}
            className={`border rounded-2xl p-5 flex items-center justify-between bg-white shadow-sm hover:shadow transition-shadow ${stat.bg}`}
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                {stat.title}
              </span>
              <span className="text-3xl font-bold text-gray-900 block">{stat.value}</span>
              <span className="text-xs text-gray-400 block">{stat.desc}</span>
            </div>
            <div className={`p-3 rounded-xl bg-white/80 shadow-sm ${stat.color}`}>
              <stat.icon size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dynamic Filter Panel */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left search */}
          <div className="relative w-full lg:max-w-md">
            <input
              type="text"
              placeholder="Search by client name, SSN, or EIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-800"
            />
            <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
          </div>

          {/* Right layout toggler & create button */}
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200">
              <button
                onClick={() => setView("table")}
                className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                  view === "table"
                    ? "bg-white text-gray-900 shadow-sm font-semibold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Table View"
              >
                <List size={16} />
                <span className="text-xs ml-1.5 font-medium hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                  view === "grid"
                    ? "bg-white text-gray-900 shadow-sm font-semibold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Grid View"
              >
                <Grid size={16} />
                <span className="text-xs ml-1.5 font-medium hidden sm:inline">Grid</span>
              </button>
            </div>

            <Link
              href="/projects/new"
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-100 hover:shadow-md"
            >
              <Plus size={16} />
              New Project
            </Link>
          </div>
        </div>

        {/* Horizontal filters grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-gray-100">
          {/* Tax Year Filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Tax Year</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700 font-medium cursor-pointer"
            >
              <option value="ALL">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          {/* Return Type Filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Return Type</label>
            <select
              value={returnTypeFilter}
              onChange={(e) => setReturnTypeFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700 font-medium cursor-pointer"
            >
              <option value="ALL">All Forms</option>
              <option value="F1040">Form 1040 (Ind)</option>
              <option value="F1120S">Form 1120-S (S-Corp)</option>
              <option value="F1065">Form 1065 (Partnership)</option>
              <option value="F1041">Form 1041 (Estate/Trust)</option>
              <option value="F990">Form 990 (Non-Profit)</option>
            </select>
          </div>

          {/* Pipeline Stage Filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Workflow Stage</label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700 font-medium cursor-pointer"
            >
              <option value="ALL">All Stages</option>
              <option value="INTAKE">Intake</option>
              <option value="WORKPAPER">Workpaper</option>
              <option value="PREP">Preparation</option>
              <option value="DELIVERY">Delivery</option>
            </select>
          </div>

          {/* Project Status Filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700 font-medium cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="STALLED">Stalled</option>
              <option value="OVERDUE">Overdue</option>
              <option value="COMPLETE">Complete</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Staff Assigned</label>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700 font-medium cursor-pointer"
            >
              <option value="ALL">All Staff</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid or Table Rendering */}
      {view === "table" ? (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Return Type</th>
                <th className="px-6 py-4">Tax Year</th>
                <th className="px-6 py-4">Pipeline Stage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Staff Assigned</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Inbox className="w-8 h-8 text-gray-300" />
                      <p className="font-semibold">No matching projects found</p>
                      <p className="text-xs text-gray-400">Try adjusting your filters or search term</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const clientName = project.client.type === "INDIVIDUAL"
                    ? `${project.client.firstName || ""} ${project.client.lastName || ""}`.trim()
                    : project.client.entityName || "Unnamed Client";
                  const statusCol = getStatusColor(project.status);
                  const stage = stages.find((s) => s.id === project.stage);
                  const initials = staff.find((s) => s.id === project.assigneeId)?.name || "U";
                  const progress = getProjectProgress(project);

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-gray-50/50 cursor-pointer transition-colors group"
                      onClick={() => handleRowClick(project.id)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-800 leading-normal group-hover:text-indigo-600 transition-colors">
                            {clientName}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                            {project.client.type === "INDIVIDUAL" ? "Individual" : "Business"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-50 border border-gray-100 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                          {getReturnTypeLabel(project.returnType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{project.year}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: stage?.color }}
                          />
                          <span className="font-semibold text-gray-800 text-xs uppercase tracking-wide">
                            {stage?.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${statusCol.bg} ${statusCol.text}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-gray-500 w-8">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {project.dueDate ? formatDate(project.dueDate) : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                            {getInitials(initials)}
                          </div>
                          <span className="text-xs text-gray-700 truncate max-w-[80px]">{initials}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/projects/${project.id}`}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Go to project"
                          >
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full bg-white border border-gray-200 rounded-2xl p-16 text-center text-gray-400">
              <div className="flex flex-col items-center justify-center space-y-2">
                <Inbox className="w-8 h-8 text-gray-300" />
                <p className="font-semibold">No matching projects found</p>
                <p className="text-xs text-gray-400">Try adjusting your filters or search term</p>
              </div>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const clientName = project.client.type === "INDIVIDUAL"
                ? `${project.client.firstName || ""} ${project.client.lastName || ""}`.trim()
                : project.client.entityName || "Unnamed Client";
              const statusCol = getStatusColor(project.status);
              const stage = stages.find((s) => s.id === project.stage);
              const initials = staff.find((s) => s.id === project.assigneeId)?.name || "U";
              const progress = getProjectProgress(project);

              return (
                <motion.div
                  key={project.id}
                  whileHover={{ y: -3 }}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-5 relative overflow-hidden"
                  onClick={() => handleRowClick(project.id)}
                >
                  {/* Left strip */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ background: stage?.color }}
                  />

                  <div className="space-y-3 pl-1.5">
                    {/* Header line */}
                    <div className="flex items-center justify-between">
                      <span className="bg-gray-50 border border-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {getReturnTypeLabel(project.returnType)}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${statusCol.bg} ${statusCol.text}`}>
                        {project.status}
                      </span>
                    </div>

                    {/* Client name */}
                    <div>
                      <h3 className="font-bold text-gray-800 text-base truncate leading-snug hover:text-indigo-600 transition-colors">
                        {clientName}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                        Tax Year {project.year} &bull; {project.client.type === "INDIVIDUAL" ? "Individual" : "Business"}
                      </p>
                    </div>

                    {/* Stage indicator */}
                    <div className="flex items-center gap-2 pt-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: stage?.color }}
                      />
                      <span className="font-bold text-gray-700 text-xs uppercase tracking-wide">
                        {stage?.name} Stage
                      </span>
                    </div>
                  </div>

                  {/* Progress panel */}
                  <div className="space-y-1.5 pl-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                      <span>Tasks Completed</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden w-full">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer info */}
                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center pl-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-400" />
                      <span className="text-[10px] font-bold">
                        {project.dueDate ? formatDate(project.dueDate) : "No due date"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center border border-white">
                        {getInitials(initials)}
                      </div>
                      <span className="text-[10px] font-bold text-gray-700">{initials}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
