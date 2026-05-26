"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, FolderPlus, Save, AlertCircle } from "lucide-react";
import Link from "next/link";

interface ClientOption {
  id: string;
  name: string | null;
}

interface StaffOption {
  id: string;
  name: string;
  role: string;
}

interface NewProjectClientProps {
  clients: ClientOption[];
  staff: StaffOption[];
  preselectedClientId?: string;
  currentUserId: string;
}

export default function NewProjectClient({
  clients,
  staff,
  preselectedClientId,
  currentUserId,
}: NewProjectClientProps) {
  const router = useRouter();
  const [clientId, setClientId] = useState(preselectedClientId || "");
  const [returnType, setReturnType] = useState("F1040");
  const [year, setYear] = useState(new Date().getFullYear());
  const [assigneeId, setAssigneeId] = useState(currentUserId);
  const [reviewerId, setReviewerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError("Please select a client.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          returnType,
          year: Number(year),
          assigneeId,
          reviewerId: reviewerId || null,
          dueDate: dueDate || null,
          notes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/projects/${data.id}/intake`);
        router.refresh();
      } else {
        const data = await res.text();
        setError(data || "Failed to create return. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to create tax return engagement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
      >
        <ChevronLeft size={16} />
        Back to Pipeline
      </Link>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Tax Return</h1>
          <p className="text-sm text-gray-500 mt-1">
            Initiate a new tax return engagement and workflow checklist
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Client Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Client <span className="text-red-500">*</span>
            </label>
            {clients.length === 0 ? (
              <div className="p-4 border border-dashed rounded-xl text-center space-y-2">
                <p className="text-xs text-gray-400">No clients configured yet in this firm.</p>
                <Link
                  href="/clients/new"
                  className="inline-block text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Create new client +
                </Link>
              </div>
            ) : (
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all text-gray-700 font-medium"
              >
                <option value="">-- Choose a client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Return Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tax Form / Return Type <span className="text-red-500">*</span>
              </label>
              <select
                value={returnType}
                onChange={(e) => setReturnType(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all text-gray-700 font-medium"
              >
                <option value="F1040">Form 1040 (Individual)</option>
                <option value="F1120S">Form 1120-S (S-Corp)</option>
                <option value="F1065">Form 1065 (Partnership)</option>
                <option value="F1041">Form 1041 (Estate/Trust)</option>
                <option value="F990">Form 990 (Non-Profit)</option>
              </select>
            </div>

            {/* Tax Year */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tax Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2000}
                max={2100}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assignee */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assigned Preparer <span className="text-red-500">*</span>
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all text-gray-700 font-medium"
              >
                <option value="">-- Select Preparer --</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Reviewer */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reviewer Assigned
              </label>
              <select
                value={reviewerId}
                onChange={(e) => setReviewerId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all text-gray-700 font-medium"
              >
                <option value="">-- Select Reviewer (Optional) --</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filing Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all text-gray-700 font-medium"
            />
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Internal Engagement Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add scope details, schedule timeline constraints, etc..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-700"
            />
          </div>

          {/* Footer Buttons */}
          <div className="border-t pt-6 flex justify-end gap-3 items-center">
            <Link
              href="/dashboard"
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {loading ? "Creating..." : "Start Engagement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
