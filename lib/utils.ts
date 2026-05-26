import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function getStageColor(stage: string) {
  const colors: Record<string, string> = {
    INTAKE: "#0EA5E9",
    WORKPAPER: "#7C3AED",
    PREP: "#F97316",
    DELIVERY: "#22C55E",
  };
  return colors[stage] || "#6B7280";
}

export function getStatusColor(status: string) {
  const colors: Record<string, { bg: string; text: string }> = {
    ACTIVE: { bg: "bg-blue-100", text: "text-blue-700" },
    STALLED: { bg: "bg-amber-100", text: "text-amber-700" },
    OVERDUE: { bg: "bg-red-100", text: "text-red-700" },
    COMPLETE: { bg: "bg-green-100", text: "text-green-700" },
    ARCHIVED: { bg: "bg-gray-100", text: "text-gray-700" },
  };
  return colors[status] || { bg: "bg-gray-100", text: "text-gray-700" };
}

export function getReturnTypeLabel(type: string) {
  const labels: Record<string, string> = {
    F1040: "Form 1040",
    F1120S: "Form 1120-S",
    F1065: "Form 1065",
    F1041: "Form 1041",
    F990: "Form 990",
  };
  return labels[type] || type;
}

export function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    OWNER: "Owner/Admin",
    MANAGER: "Manager",
    PREPARER: "Preparer",
    REVIEWER: "Reviewer",
    ADMIN_STAFF: "Admin Staff",
    READ_ONLY: "Read-Only Auditor",
  };
  return labels[role] || role;
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
