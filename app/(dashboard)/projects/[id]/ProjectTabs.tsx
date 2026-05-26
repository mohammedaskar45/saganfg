"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Inbox, ClipboardList, PenTool, Milestone } from "lucide-react";

interface ProjectTabsProps {
  projectId: string;
  currentStage: string;
}

export default function ProjectTabs({ projectId, currentStage }: ProjectTabsProps) {
  const pathname = usePathname();

  const tabs = [
    {
      href: `/projects/${projectId}/intake`,
      label: "Intake",
      icon: Inbox,
      stageId: "INTAKE",
    },
    {
      href: `/projects/${projectId}/workpaper`,
      label: "Workpapers",
      icon: ClipboardList,
      stageId: "WORKPAPER",
    },
    {
      href: `/projects/${projectId}/prep`,
      label: "Prep",
      icon: Milestone,
      stageId: "PREP",
    },
    {
      href: `/projects/${projectId}/delivery`,
      label: "Delivery",
      icon: PenTool,
      stageId: "DELIVERY",
    },
    {
      href: `/projects/${projectId}/documents`,
      label: "Documents",
      icon: FileText,
      stageId: null,
    },
  ];

  return (
    <div className="flex border-b border-gray-200 w-full overflow-x-auto no-scrollbar gap-1">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const isPastOrCurrent =
          tab.stageId === null ||
          currentStage === "DELIVERY" ||
          (currentStage === "PREP" && tab.stageId !== "DELIVERY") ||
          (currentStage === "WORKPAPER" && tab.stageId !== "PREP" && tab.stageId !== "DELIVERY") ||
          (currentStage === "INTAKE" && tab.stageId === "INTAKE");

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-xs transition-all duration-150 whitespace-nowrap ${
              isActive
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/20"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <tab.icon size={15} className={isActive ? "text-indigo-600" : "text-gray-400"} />
            <span>{tab.label}</span>
            {tab.stageId && !isActive && isPastOrCurrent && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
