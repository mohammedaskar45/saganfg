"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  FileCheck,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface DocumentsClientProps {
  projectId: string;
  initialDocuments: any[];
}

export default function DocumentsClient({
  projectId,
  initialDocuments,
}: DocumentsClientProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState(initialDocuments);
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; progress: number }[]>([]);
  const [dupWarning, setDupWarning] = useState<string | null>(null);

  // Real Multi-file Upload with Progress Simulation
  const handleSimulatedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).map((f) => ({ name: f.name, progress: 0 }));
    setUploadingFiles(newFiles);

    // Run simulated upload animation progress
    for (let p = 0; p <= 100; p += 25) {
      await new Promise((r) => setTimeout(r, 100));
      setUploadingFiles((prev) => prev.map((f) => ({ ...f, progress: p })));
    }

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Deduplication warning check
        const isDup = documents.some((d) => d.originalName === file.name);
        if (isDup) {
          setDupWarning(`Duplicate document alert: "${file.name}" was already uploaded to this project.`);
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", projectId);
        formData.append("isDuplicate", isDup ? "true" : "false");

        const res = await fetch(`/api/v1/documents`, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const newDoc = await res.json();
          setDocuments((prev) => [newDoc, ...prev]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingFiles([]);
      router.refresh();
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      const res = await fetch(`/api/v1/documents/${docId}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments(documents.filter((d) => d.id !== docId));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Deduplication warning modal/alert */}
      {dupWarning && (
        <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={16} />
            <span>{dupWarning}</span>
          </div>
          <button onClick={() => setDupWarning(null)} className="text-[10px] text-gray-500 hover:text-gray-700 underline font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Drag/Drop Box */}
      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 bg-gray-50/50 hover:bg-gray-50 hover:border-indigo-400 transition-all flex flex-col items-center justify-center text-center relative select-none">
        <UploadCloud className="text-indigo-600 mb-3" size={32} />
        <h3 className="font-bold text-gray-800 text-sm">Upload tax documents</h3>
        <p className="text-[11px] text-gray-400 mt-1 max-w-sm">
          Drag and drop W-2s, 1099s, bank sheets, or PDF portfolios. Our AI automatically processes, renames, and checks for duplication.
        </p>

        <label className="mt-4 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all cursor-pointer">
          Select Files
          <input
            type="file"
            multiple
            onChange={handleSimulatedUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Uploading Progress Bars */}
      {uploadingFiles.length > 0 && (
        <div className="border border-gray-200 rounded-2xl p-4 bg-white space-y-3 shadow-sm">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
            Uploading & AI Vision OCR organizing...
          </span>
          {uploadingFiles.map((uf, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-gray-700 truncate max-w-xs">{uf.name}</span>
                <span className="text-gray-500 font-bold">{uf.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uf.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Documents Grid Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Document Name</th>
              <th className="px-6 py-4">File Size</th>
              <th className="px-6 py-4">Form Type</th>
              <th className="px-6 py-4">Uploaded</th>
              <th className="px-6 py-4">AI OCR Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  No documents compiled yet. Drag & drop files to populate this list.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                  {/* File Name */}
                  <td className="px-6 py-4 font-bold text-gray-800 leading-normal flex items-center gap-3 max-w-xs">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate">{doc.smartName || doc.originalName}</span>
                        {doc.smartName && (
                          <span title="Smart Renamed by AI Vision" className="flex items-center">
                            <Sparkles size={12} className="text-indigo-500 flex-shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 truncate leading-snug font-medium">
                        Orig: {doc.originalName}
                      </p>
                    </div>
                  </td>

                  {/* Size */}
                  <td className="px-6 py-4 text-gray-600">
                    {(doc.sizeBytes / 1024).toFixed(1)} KB
                  </td>

                  {/* Form Type tag */}
                  <td className="px-6 py-4">
                    {doc.formType ? (
                      <span className="bg-gray-50 border border-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {doc.formType}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  {/* Upload Date */}
                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(doc.createdAt)}
                  </td>

                  {/* AI Status */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-green-700 font-semibold">
                      <CheckCircle size={14} className="text-green-600" />
                      <span>Ready</span>
                    </div>
                  </td>

                  {/* Action delete */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
