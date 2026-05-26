"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle, ArrowRight, ShieldAlert, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getStageColor, getStatusColor, getReturnTypeLabel, formatDate } from "@/lib/utils";

interface ProjectHeaderProps {
  project: {
    id: string;
    year: number;
    returnType: string;
    stage: string;
    status: string;
    dueDate: string | null;
    assigneeName: string;
  };
  clientName: string | null;
}

export default function ProjectHeader({ project, clientName }: ProjectHeaderProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(project.stage);
  const [status, setStatus] = useState(project.status);

  const stages = [
    { id: "INTAKE", name: "Intake", index: 1, action: "Request Documents" },
    { id: "WORKPAPER", name: "Workpaper", index: 2, action: "Review Workpapers" },
    { id: "PREP", name: "Prep", index: 3, action: "Prepare Tax Form" },
    { id: "DELIVERY", name: "Delivery", index: 4, action: "Final Sign-off" },
  ];

  const currentStageIndex = stages.findIndex((s) => s.id === stage) + 1;

  const handleAdvanceStage = async () => {
    const nextIndex = currentStageIndex;
    if (nextIndex >= 4) return; // already in Delivery

    const nextStage = stages[nextIndex].id;
    setLoading(true);

    try {
      const res = await fetch(`/api/v1/projects/${project.id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: nextStage }),
      });

      if (res.ok) {
        setStage(nextStage);
        router.refresh();
        // Redirect to new stage tab
        router.push(`/projects/${project.id}/${nextStage.toLowerCase()}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${project.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusCol = getStatusColor(status);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Top row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors text-xs font-semibold uppercase tracking-wider mb-2"
          >
            <ChevronLeft size={14} />
            Pipeline
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900 leading-snug">
              {clientName}
            </h1>
            <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
              {getReturnTypeLabel(project.returnType)}
            </span>
            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
              TY {project.year}
            </span>
            <select
              value={status}
              disabled={loading}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md appearance-none border-0 text-center font-sans ${statusCol.bg} ${statusCol.text} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer`}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="STALLED">STALLED</option>
              <option value="OVERDUE">OVERDUE</option>
              <option value="COMPLETE">COMPLETE</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            Assigned Preparer: <span className="text-gray-700 font-bold">{project.assigneeName}</span>
            {project.dueDate && (
              <span className="ml-3">
                • Due: <span className="text-gray-700 font-bold">{formatDate(project.dueDate)}</span>
              </span>
            )}
          </p>
        </div>

        {/* Advance Stage button */}
        {currentStageIndex < 4 && (
          <button
            onClick={handleAdvanceStage}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed self-start md:self-center"
          >
            <span>Advance to {stages[currentStageIndex].name}</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      {/* Progress Track */}
      <div className="border-t border-gray-100 pt-6">
        <div className="relative flex justify-between items-center w-full max-w-3xl mx-auto">
          {/* Connector Line behind steps */}
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />

          {/* Active portion connector line */}
          <div
            className="absolute left-0 top-1/2 h-0.5 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500"
            style={{
              width: `${((currentStageIndex - 1) / 3) * 100}%`,
            }}
          />

          {stages.map((s) => {
            const isCompleted = s.index < currentStageIndex;
            const isActive = s.index === currentStageIndex;
            const stageColor = getStageColor(s.id);

            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center space-y-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : isActive
                      ? "bg-white border-indigo-600 text-indigo-700 ring-4 ring-indigo-50"
                      : "bg-white border-gray-200 text-gray-400"
                  }`}
                  style={{
                    borderColor: isCompleted || isActive ? stageColor : undefined,
                    color: isCompleted ? "white" : isActive ? stageColor : undefined,
                    background: isCompleted ? stageColor : undefined,
                  }}
                >
                  {isCompleted ? <CheckCircle size={16} /> : s.index}
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    isActive ? "text-gray-900 font-bold" : "text-gray-400"
                  }`}
                  style={{ color: isActive ? stageColor : undefined }}
                >
                  {s.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
