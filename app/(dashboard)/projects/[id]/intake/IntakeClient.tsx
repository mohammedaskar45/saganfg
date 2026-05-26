"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Copy,
  Check,
  Send,
  Plus,
  FileCheck,
  CheckSquare,
  Lock,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { getStageColor } from "@/lib/utils";

interface IntakeClientProps {
  project: {
    id: string;
    year: number;
    returnType: string;
    client: {
      name: string;
      email: string;
    };
    checklistItems: any[];
    magicLink: {
      token: string;
      expiresAt: string;
      revoked: boolean;
    } | null;
    engagementLetter: {
      name: string;
      status: string;
      sentAt: string | null;
      signedAt: string | null;
    } | null;
  };
}

export default function IntakeClient({ project }: IntakeClientProps) {
  const router = useRouter();
  const [checklist, setChecklist] = useState(project.checklistItems);
  const [copied, setCopied] = useState(false);
  const [letterStatus, setLetterStatus] = useState(project.engagementLetter?.status || "DRAFT");
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [loading, setLoading] = useState(false);

  const completedCount = checklist.filter((item) => item.status === "RECEIVED").length;
  const totalCount = checklist.filter((item) => item.status !== "NOT_APPLICABLE").length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Copy Magic Link handler
  const handleCopyLink = () => {
    const token = project.magicLink?.token || "demo-magic-token-john-smith-2024";
    const url = `${window.location.origin}/portal/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toggle checklist status handler
  const handleStatusChange = async (itemId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/projects/${project.id}/checklist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, status: newStatus }),
      });

      if (res.ok) {
        setChecklist(
          checklist.map((item) =>
            item.id === itemId ? { ...item, status: newStatus } : item
          )
        );
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Send Engagement Letter trigger
  const handleSendLetter = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${project.id}/engagement-letter`, {
        method: "POST",
      });
      if (res.ok) {
        setLetterStatus("SENT");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add custom checklist item handler
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;

    try {
      const res = await fetch(`/api/v1/projects/${project.id}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: newChecklistItem }),
      });

      if (res.ok) {
        const newItem = await res.json();
        setChecklist([...checklist, newItem]);
        setNewChecklistItem("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const portalUrl = `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/portal/${project.magicLink?.token || "demo-magic-token-john-smith-2024"}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Checklist & custom adder (2/3 width) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Checklist Widget */}
        <div className="border border-gray-200 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="text-indigo-600" size={20} />
              <h3 className="font-bold text-gray-900 text-sm">Document Checklist</h3>
            </div>
            {/* Checklist progress tracker */}
            <div className="flex items-center gap-3">
              <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-100">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-gray-700">
                {progressPercent}% ({completedCount}/{totalCount})
              </span>
            </div>
          </div>

          {/* List of items */}
          <div className="divide-y divide-gray-100">
            {checklist.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-gray-800 leading-snug">
                    {item.description}
                  </p>
                  {item.formType && (
                    <span className="bg-gray-50 border border-gray-100 text-gray-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider block w-max">
                      {item.formType}
                    </span>
                  )}
                </div>

                {/* Dropdown status selector */}
                <select
                  value={item.status}
                  onChange={(e) => handleStatusChange(item.id, e.target.value)}
                  className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer bg-white ${
                    item.status === "RECEIVED"
                      ? "border-green-200 text-green-700 bg-green-50/50"
                      : item.status === "NOT_APPLICABLE"
                      ? "border-gray-200 text-gray-500 bg-gray-50/50"
                      : "border-amber-200 text-amber-700 bg-amber-50/50"
                  }`}
                >
                  <option value="MISSING">MISSING</option>
                  <option value="RECEIVED">RECEIVED</option>
                  <option value="NOT_APPLICABLE">N/A</option>
                </select>
              </div>
            ))}
          </div>

          {/* Add custom item form */}
          <form onSubmit={handleAddItem} className="flex gap-2 pt-4 border-t border-gray-100">
            <input
              type="text"
              placeholder="Request custom document (e.g. 1099-NEC from Uber)..."
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-gray-50 focus:bg-white"
            />
            <button
              type="submit"
              className="flex items-center justify-center p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm shadow-indigo-100"
            >
              <Plus size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Magic links, engagement letter (1/3 width) */}
      <div className="space-y-6">
        {/* Secure Client Portal (Magic Link) Card */}
        <div className="border border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-indigo-900 to-[#0D1B4B] text-white shadow-md relative overflow-hidden flex flex-col justify-between space-y-4 min-h-[220px]">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-600/10 rounded-full blur-xl pointer-events-none" />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                Zero-Login Client Portal
              </span>
            </div>
            <h4 className="font-bold text-sm leading-snug">
              Secure Upload Link
            </h4>
            <p className="text-[11px] text-blue-200/90 leading-relaxed">
              Copy this link and send it to your client. They can upload documents, complete forms, sign letters and pay invoices without creating a password.
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all bg-indigo-600 hover:bg-indigo-700 border border-indigo-500 shadow-lg shadow-indigo-950/50"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied Link!" : "Copy Portal Link"}
              </button>
              <a
                href={portalUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-white transition-colors"
                title="Open client-facing portal"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Engagement Letter Card */}
        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FileCheck size={18} className="text-indigo-600" />
            <h4 className="font-bold text-gray-800 text-sm">Engagement Letter</h4>
          </div>

          <p className="text-[11px] text-gray-500 leading-relaxed">
            Protect your firm by securing a signed agreement prior to prepping.
          </p>

          <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
              Status
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                letterStatus === "SIGNED"
                  ? "bg-green-100 text-green-700"
                  : letterStatus === "SENT"
                  ? "bg-blue-100 text-blue-700 animate-pulse"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {letterStatus}
            </span>
          </div>

          {letterStatus === "DRAFT" && (
            <button
              onClick={handleSendLetter}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm shadow-indigo-100"
            >
              <Send size={12} />
              Send Engagement Letter
            </button>
          )}

          {letterStatus === "SENT" && (
            <div className="space-y-2">
              <button
                onClick={async () => {
                  // Simulate client signing it
                  await fetch(`/api/v1/projects/${project.id}/engagement-letter/sign`, { method: "POST" });
                  setLetterStatus("SIGNED");
                  router.refresh();
                }}
                className="w-full py-2.5 border border-indigo-600 text-indigo-600 hover:bg-indigo-50/20 text-xs font-bold rounded-xl transition-all"
              >
                Simulate Client Signature
              </button>
            </div>
          )}

          {letterStatus === "SIGNED" && (
            <div className="p-3 bg-green-50 border border-green-100 text-green-700 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-1.5">
              <CheckSquare size={16} />
              Agreement Securely Signed!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
