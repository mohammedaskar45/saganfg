"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  KanbanSquare,
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
} from "lucide-react";
import Link from "next/link";
import {
  formatDate,
  getStageColor,
  getStatusColor,
  getReturnTypeLabel,
  getInitials,
} from "@/lib/utils";

interface DashboardClientProps {
  initialProjects: any[];
  staff: any[];
}

export default function DashboardClient({
  initialProjects,
  staff,
}: DashboardClientProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [returnTypeFilter, setReturnTypeFilter] = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");

  // Filtering Logic
  const filteredProjects = projects.filter((project) => {
    const clientName = project.client.type === "INDIVIDUAL"
      ? `${project.client.firstName} ${project.client.lastName}`
      : project.client.entityName;
    const matchesSearch = clientName?.toLowerCase().includes(search.toLowerCase());
    const matchesReturnType = returnTypeFilter === "ALL" || project.returnType === returnTypeFilter;
    const matchesAssignee = assigneeFilter === "ALL" || project.assigneeId === assigneeFilter;
    return matchesSearch && matchesReturnType && matchesAssignee;
  });

  // Calculate Metrics
  const activeCount = projects.filter((p) => p.status === "ACTIVE" || p.status === "STALLED" || p.status === "OVERDUE").length;
  const overdueCount = projects.filter((p) => p.status === "OVERDUE" || (p.dueDate && new Date(p.dueDate) < new Date() && p.status !== "COMPLETE")).length;
  const awaitingClientCount = projects.filter((p) => {
    return p.stage === "INTAKE" && p.checklistItems?.some((item: any) => item.status === "MISSING");
  }).length;
  const completeCount = projects.filter((p) => p.status === "COMPLETE").length;

  const stages = [
    { id: "INTAKE", name: "Intake", color: "#0EA5E9" },
    { id: "WORKPAPER", name: "Workpapers", color: "#7C3AED" },
    { id: "PREP", name: "Preparation", color: "#F97316" },
    { id: "DELIVERY", name: "Delivery", color: "#22C55E" },
  ];

  const handleCardClick = (id: string) => {
    router.push(`/projects/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8 py-2">
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Active Engagements",
            value: activeCount,
            icon: Layers,
            color: "text-blue-600",
            bg: "bg-blue-50 border-blue-100",
          },
          {
            title: "Overdue Items",
            value: overdueCount,
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-50 border-red-100",
          },
          {
            title: "Awaiting Client",
            value: awaitingClientCount,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50 border-amber-100",
          },
          {
            title: "Completed returns",
            value: completeCount,
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-50 border-green-100",
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
            </div>
            <div className={`p-3 rounded-xl bg-white/80 shadow-sm ${stat.color}`}>
              <stat.icon size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter and View Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search bar */}
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search by client name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>

          {/* Return type selector */}
          <div className="relative">
            <select
              value={returnTypeFilter}
              onChange={(e) => setReturnTypeFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all font-medium text-gray-700"
            >
              <option value="ALL">All Return Types</option>
              <option value="F1040">Form 1040 (Ind)</option>
              <option value="F1120S">Form 1120-S (S-Corp)</option>
              <option value="F1065">Form 1065 (Partnership)</option>
              <option value="F1041">Form 1041 (Estate/Trust)</option>
              <option value="F990">Form 990 (Non-Profit)</option>
            </select>
            <Filter className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={14} />
          </div>

          {/* Assignee selector */}
          <div className="relative">
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all font-medium text-gray-700"
            >
              <option value="ALL">All Staff</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <User className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={14} />
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200">
            <button
              onClick={() => setView("kanban")}
              className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                view === "kanban"
                  ? "bg-white text-gray-900 shadow-sm font-semibold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <KanbanSquare size={16} />
              <span className="text-xs ml-1.5 font-medium hidden sm:inline">Board</span>
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                view === "list"
                  ? "bg-white text-gray-900 shadow-sm font-semibold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <List size={16} />
              <span className="text-xs ml-1.5 font-medium hidden sm:inline">List</span>
            </button>
          </div>

          <Link
            href="/projects/new"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all shadow-sm shadow-indigo-100"
          >
            <Plus size={16} />
            New Project
          </Link>
        </div>
      </div>

      {/* Main Board vs List Rendering */}
      {view === "kanban" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {stages.map((stage) => {
            const stageProjects = filteredProjects.filter((p) => p.stage === stage.id);
            return (
              <div
                key={stage.id}
                className="flex flex-col space-y-4 bg-slate-100/60 border border-slate-200/40 rounded-2xl p-4 min-h-[500px]"
              >
                {/* Column Title */}
                <div className="flex items-center justify-between pb-1 px-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: stage.color }}
                    />
                    <span className="font-bold text-slate-800 text-sm tracking-wide">
                      {stage.name}
                    </span>
                    <span className="bg-slate-200/70 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded-full">
                      {stageProjects.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards Container */}
                <div className="flex-1 flex flex-col space-y-3">
                  <AnimatePresence mode="popLayout">
                    {stageProjects.length === 0 ? (
                      <div className="border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-gray-400 bg-white/50">
                        No active returns in {stage.name}
                      </div>
                    ) : (
                      stageProjects.map((project) => {
                        const statusCol = getStatusColor(project.status);
                        const initials = staff.find((s) => s.id === project.assigneeId)?.name || "U";
                        const clientName = project.client.type === "INDIVIDUAL"
                          ? `${project.client.firstName} ${project.client.lastName}`
                          : project.client.entityName;

                        return (
                          <motion.div
                            layout
                            key={project.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            whileHover={{ y: -3, scale: 1.01 }}
                            onClick={() => handleCardClick(project.id)}
                            className="bg-white border border-slate-200/80 hover:border-indigo-300 rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 group relative overflow-hidden"
                          >
                            {/* Left highlight strip matching stage */}
                            <div
                              className="absolute left-0 top-0 bottom-0 w-1.5"
                              style={{ background: stage.color }}
                            />

                            <div className="space-y-2 pl-1.5">
                              {/* Header badges */}
                              <div className="flex justify-between items-center">
                                <span className="bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider block">
                                  {getReturnTypeLabel(project.returnType)}
                                </span>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${statusCol.bg} ${statusCol.text}`}>
                                  {project.status}
                                </span>
                              </div>

                              {/* Client Name */}
                              <h3 className="font-bold text-slate-800 text-sm truncate leading-snug group-hover:text-indigo-600 transition-colors">
                                {clientName}
                              </h3>
                              <p className="text-[10px] text-slate-400 font-bold">
                                Tax Year {project.year}
                              </p>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-slate-100 pt-3 flex justify-between items-center pl-1.5">
                              {/* Due date */}
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Calendar size={12} />
                                <span className="text-[10px] font-bold">
                                  {project.dueDate ? formatDate(project.dueDate) : "No due date"}
                                </span>
                              </div>

                              {/* Assignee initials badge */}
                              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center border border-white hover:ring-2 hover:ring-indigo-300 transition-all">
                                {getInitials(initials)}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List view representation */
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Return Type</th>
                <th className="px-6 py-4">Tax Year</th>
                <th className="px-6 py-4">Pipeline Stage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Staff Assigned</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    No matching projects found.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const clientName = project.client.type === "INDIVIDUAL"
                    ? `${project.client.firstName} ${project.client.lastName}`
                    : project.client.entityName;
                  const statusCol = getStatusColor(project.status);
                  const stage = stages.find((s) => s.id === project.stage);
                  const initials = staff.find((s) => s.id === project.assigneeId)?.name || "U";

                  return (
                    <tr
                      key={project.id}
                      onClick={() => handleCardClick(project.id)}
                      className="hover:bg-gray-50/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-gray-800 leading-normal group-hover:text-indigo-600 transition-colors">
                        {clientName}
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
                      <td className="px-6 py-4 text-gray-600">
                        {project.dueDate ? formatDate(project.dueDate) : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                            {getInitials(initials)}
                          </div>
                          <span className="text-xs text-gray-700">{initials}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 group-hover:text-indigo-600 transition-all">
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
