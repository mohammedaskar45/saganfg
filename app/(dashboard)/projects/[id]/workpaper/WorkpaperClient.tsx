"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  CheckSquare,
  Calculator,
  Award,
  ChevronRight,
  ShieldCheck,
  Check,
  Plus,
  Trash2,
  Bookmark,
  Layers,
} from "lucide-react";

interface WorkpaperClientProps {
  project: {
    id: string;
    year: number;
    returnType: string;
    client: {
      name: string;
    };
    documents: any[];
    workpaperPack: {
      status: string;
      reviewLevel: number;
      reviewNotes: string | null;
    } | null;
  };
}

export default function WorkpaperClient({ project }: WorkpaperClientProps) {
  const router = useRouter();
  const [packStatus, setPackStatus] = useState(project.workpaperPack?.status || "PENDING");
  const [activeDoc, setActiveDoc] = useState(project.documents[0] || null);
  const [loading, setLoading] = useState(false);

  // 10-Key Calculator Tape State
  const [tape, setTape] = useState<string[]>([]);
  const [calcInput, setCalcInput] = useState("");
  const [calcTotal, setCalcTotal] = useState(0);

  // Interactive Tickmarks and Stamps State
  const [selectedTool, setSelectedTool] = useState<"TICK_✔" | "TICK_TB" | "STAMP_REV" | "STAMP_APP" | null>(null);
  const [annotations, setAnnotations] = useState<{ id: string; x: number; y: number; type: string }[]>([]);

  // 10-key logic
  const handleCalcKeyPress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calcInput.trim()) return;

    const val = Number(calcInput);
    if (isNaN(val)) return;

    const newTape = [...tape, `+ ${val.toFixed(2)}`];
    const newTotal = calcTotal + val;

    setTape(newTape);
    setCalcTotal(newTotal);
    setCalcInput("");
  };

  const clearCalculator = () => {
    setTape([]);
    setCalcTotal(0);
  };

  // Fetch annotations on active document change
  useEffect(() => {
    if (!activeDoc) return;
    const fetchAnnotations = async () => {
      try {
        const res = await fetch(`/api/v1/projects/${project.id}/documents/${activeDoc.id}/annotations`);
        if (res.ok) {
          const data = await res.json();
          setAnnotations(data);
        }
      } catch (err) {
        console.error("Error fetching annotations:", err);
      }
    };
    fetchAnnotations();
  }, [activeDoc, project.id]);

  // Add Annotation on Document Canvas
  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedTool || !activeDoc) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newAnnoId = `anno_${Date.now()}`;
    const newAnno = {
      id: newAnnoId,
      type: selectedTool,
      pageNumber: 1,
      x,
      y,
    };

    // Optimistically update UI
    setAnnotations((prev) => [...prev, newAnno]);

    try {
      const res = await fetch(`/api/v1/projects/${project.id}/documents/${activeDoc.id}/annotations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAnno),
      });
      if (!res.ok) {
        setAnnotations((prev) => prev.filter((a) => a.id !== newAnnoId));
      } else {
        const saved = await res.json();
        setAnnotations((prev) => prev.map((a) => a.id === newAnnoId ? saved : a));
      }
    } catch (err) {
      console.error("Error saving annotation:", err);
      setAnnotations((prev) => prev.filter((a) => a.id !== newAnnoId));
    }
  };

  // Delete Annotation from database
  const handleDeleteAnnotation = async (annoId: string) => {
    if (!activeDoc) return;

    setAnnotations((prev) => prev.filter((a) => a.id !== annoId));

    try {
      await fetch(`/api/v1/projects/${project.id}/documents/${activeDoc.id}/annotations?id=${annoId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Error deleting annotation:", err);
      router.refresh();
    }
  };

  // Submit pack for review
  const handleSubmitReview = async () => {
    setLoading(true);
    try {
      // 1. Trigger the real PDF assembly
      await fetch(`/api/v1/projects/${project.id}/workpaper/assemble`, {
        method: "POST",
      });

      // 2. Submit for review
      const res = await fetch(`/api/v1/projects/${project.id}/workpaper/submit`, {
        method: "POST",
      });
      if (res.ok) {
        setPackStatus("UNDER_REVIEW");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Sign off & approve pack
  const handleApprovePack = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${project.id}/workpaper/approve`, {
        method: "POST",
      });
      if (res.ok) {
        setPackStatus("APPROVED");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left Column: Documents compilation list, Tools panel, and 10-Key Tape */}
      <div className="space-y-6">
        {/* Documents order selection list */}
        <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Bookmark className="text-indigo-600" size={16} />
            <h4 className="font-bold text-gray-800 text-sm">Workpapers Source Index</h4>
          </div>

          {project.documents.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">
              No documents uploaded yet. Go to Documents tab to upload source files.
            </p>
          ) : (
            <div className="space-y-2">
              {project.documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    setActiveDoc(doc);
                    setAnnotations([]); // reset annotations for new doc
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    activeDoc?.id === doc.id
                      ? "border-indigo-600 bg-indigo-50/20 text-indigo-900"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="text-xs font-semibold truncate leading-normal">
                      {doc.originalName}
                    </span>
                  </div>
                  {doc.formType && (
                    <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 uppercase">
                      {doc.formType}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Audit Tick Marks & Stamps Tool Palette */}
        <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <CheckSquare className="text-indigo-600" size={16} />
            <h4 className="font-bold text-gray-800 text-sm">Audit Tick Marks & Stamps</h4>
          </div>

          <p className="text-[10px] text-gray-400">
            Select a mark or stamp below, then click anywhere on the workpaper document to apply it.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "TICK_✔", label: "✔ Verified", style: "border-green-200 text-green-700 hover:bg-green-50" },
              { id: "TICK_TB", label: "TB Tied", style: "border-indigo-200 text-indigo-700 hover:bg-indigo-50" },
              { id: "STAMP_REV", label: "Stamp: REVIEWED", style: "border-rose-200 text-rose-700 hover:bg-rose-50" },
              { id: "STAMP_APP", label: "Stamp: APPROVED", style: "border-emerald-200 text-emerald-700 hover:bg-emerald-50" },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(selectedTool === tool.id ? null : (tool.id as any))}
                className={`py-2 px-3 border rounded-xl font-bold text-xs transition-all text-center ${tool.style} ${
                  selectedTool === tool.id ? "ring-2 ring-indigo-500 scale-102 bg-indigo-50/10 shadow-sm" : ""
                }`}
              >
                {tool.label}
              </button>
            ))}
          </div>
        </div>

        {/* 10-Key Audit Calculator Tape */}
        <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <Calculator className="text-indigo-600" size={16} />
              <h4 className="font-bold text-gray-800 text-sm">10-Key Audit Tape</h4>
            </div>
            {tape.length > 0 && (
              <button onClick={clearCalculator} className="text-xs text-red-500 hover:text-red-600 font-semibold">
                Clear
              </button>
            )}
          </div>

          {/* Calculator screen tape */}
          <div className="h-32 bg-gray-900 rounded-xl p-3 font-mono text-xs text-emerald-400 overflow-y-auto space-y-1">
            {tape.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Tape is empty</p>
            ) : (
              tape.map((t, i) => <div key={i}>{t}</div>)
            )}
            {tape.length > 0 && (
              <div className="border-t border-emerald-400/30 pt-1 font-bold flex justify-between">
                <span>TOTAL:</span>
                <span>*{calcTotal.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Calculator Input */}
          <form onSubmit={handleCalcKeyPress} className="flex gap-2">
            <input
              type="text"
              placeholder="0.00"
              value={calcInput}
              onChange={(e) => setCalcInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
            />
            <button
              type="submit"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors border"
            >
              Enter
            </button>
          </form>
        </div>
      </div>

      {/* Right 2 Columns: Live PDF / Annotation View Canvas */}
      <div className="xl:col-span-2 space-y-6">
        {/* Compilation and Review Panel */}
        <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-gray-800 text-sm">Workpapers Sign-Off Status</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Status:</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  packStatus === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : packStatus === "UNDER_REVIEW"
                    ? "bg-amber-100 text-amber-700 animate-pulse"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {packStatus}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {packStatus !== "PENDING" && (
              <a
                href={`/uploads/projects/${project.id}/assembled_workpapers.pdf`}
                download={`SaganFG_Project_${project.id}_Workpapers.pdf`}
                className="flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <FileText size={14} className="text-indigo-600" />
                Download PDF
              </a>
            )}

            {packStatus === "PENDING" && (
              <button
                onClick={handleSubmitReview}
                disabled={loading}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <Layers size={14} />
                Compile & Submit for Review
              </button>
            )}

            {packStatus === "UNDER_REVIEW" && (
              <button
                onClick={handleApprovePack}
                disabled={loading}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <ShieldCheck size={14} />
                Sign off & Approve Pack
              </button>
            )}

            {packStatus === "APPROVED" && (
              <div className="bg-green-50 border border-green-100 text-green-700 rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5">
                <Check size={14} />
                Workpapers Audited & Approved
              </div>
            )}
          </div>
        </div>

        {/* Main interactive workpaper canvas viewer */}
        <div className="border border-gray-200 rounded-2xl bg-gray-100 p-6 flex items-center justify-center min-h-[500px]">
          {activeDoc ? (
            <div className="space-y-4 w-full max-w-lg">
              <div className="bg-white border rounded-2xl shadow-md overflow-hidden relative select-none">
                {/* Title overlay */}
                <div className="bg-gray-50 border-b p-3 flex justify-between items-center text-xs font-bold text-gray-700">
                  <span className="truncate">{activeDoc.originalName}</span>
                  <span className="text-[10px] text-gray-400">Page 1 of 1</span>
                </div>

                {/* Canvas Sheet Drawing overlay */}
                <div
                  onClick={handleCanvasClick}
                  className="aspect-[3/4] bg-white p-8 relative overflow-hidden flex flex-col justify-between cursor-crosshair"
                >
                  {/* Decorative background grid and texts matching high-fidelity W-2 return details */}
                  <div className="space-y-6">
                    <div className="flex justify-between border-b pb-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-800">Form W-2 Wage Statement</p>
                        <p className="text-[8px] text-gray-400">Tax Year 2024</p>
                      </div>
                      <span className="text-[14px] font-extrabold text-indigo-600">Sagan Financial Group</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[9px]">
                      <div className="space-y-2 border-r pr-4">
                        <div>
                          <p className="text-gray-400 uppercase font-semibold text-[8px]">Employer Name</p>
                          <p className="font-bold text-gray-800">Acro Corp Technologies</p>
                        </div>
                        <div>
                          <p className="text-gray-400 uppercase font-semibold text-[8px]">Employee Name</p>
                          <p className="font-bold text-gray-800">{project.client.name}</p>
                        </div>
                      </div>

                      <div className="space-y-2 pl-2">
                        <div>
                          <p className="text-gray-400 uppercase font-semibold text-[8px]">Wages, tips, other comp.</p>
                          <p className="font-bold text-gray-800">$84,500.00</p>
                        </div>
                        <div>
                          <p className="text-gray-400 uppercase font-semibold text-[8px]">Federal income tax withheld</p>
                          <p className="font-bold text-gray-800">$12,450.00</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-[8px] text-gray-300 border-t pt-4">
                    Document verified and OCR organized by SaganFG AI Assistant
                  </div>

                  {/* Render annotations applied dynamically by client clicks */}
                  {annotations.map((anno) => (
                    <div
                      key={anno.id}
                      onClick={(e) => {
                        e.stopPropagation(); // Stop click propagating to canvas
                        handleDeleteAnnotation(anno.id);
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer font-bold text-xs select-none hover:opacity-75 active:scale-95 transition-all"
                      style={{ left: anno.x, top: anno.y }}
                      title="Click to delete this mark"
                    >
                      {anno.type === "TICK_✔" && (
                        <span className="bg-green-50 border border-green-200 text-green-700 px-1 py-0.5 rounded shadow text-[9px] flex items-center gap-0.5">
                          ✔ Verified
                        </span>
                      )}
                      {anno.type === "TICK_TB" && (
                        <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-1 py-0.5 rounded shadow text-[9px] flex items-center gap-0.5">
                          TB Tied
                        </span>
                      )}
                      {anno.type === "STAMP_REV" && (
                        <span className="bg-rose-50 border-2 border-dashed border-rose-500 text-rose-500 font-extrabold px-3 py-1 rounded-lg uppercase tracking-wider text-[11px] shadow-md rotate-[-6deg] block">
                          REVIEWED
                        </span>
                      )}
                      {anno.type === "STAMP_APP" && (
                        <span className="bg-emerald-50 border-2 border-dashed border-emerald-500 text-emerald-500 font-extrabold px-3 py-1 rounded-lg uppercase tracking-wider text-[11px] shadow-md rotate-[-6deg] block">
                          APPROVED
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-center text-gray-400 font-medium">
                {selectedTool ? (
                  <span className="text-indigo-600 font-bold">Tool active: click canvas to stamp</span>
                ) : (
                  "Select a stamp tool from the palette and click on the document sheet to mark it."
                )}
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400">No active workpaper selected</p>
          )}
        </div>
      </div>
    </div>
  );
}
