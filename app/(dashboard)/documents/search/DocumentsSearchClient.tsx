"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  FileText,
  FileCheck,
  AlertTriangle,
  UploadCloud,
  CheckCircle,
  Clock,
  RotateCw,
  Scissors,
  Eye,
  Trash2,
  Calendar,
  Layers,
  Cpu,
  RefreshCw,
  FolderOpen,
  User,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  X,
  Database,
  ArrowRight,
  Info,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { formatDate, getReturnTypeLabel } from "@/lib/utils";

interface DocumentsSearchClientProps {
  initialDocuments: any[];
  clients: any[];
  firmId: string;
}

export default function DocumentsSearchClient({
  initialDocuments,
  clients,
  firmId,
}: DocumentsSearchClientProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>(initialDocuments);
  const [search, setSearch] = useState("");
  const [formTypeFilter, setFormTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedClient, setSelectedClient] = useState("ALL");
  
  // Interactive Simulator States
  const [uploadProjectId, setUploadProjectId] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState("");
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Focus States
  const [activeDoc, setActiveDoc] = useState<any | null>(null);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [splitDoc, setSplitDoc] = useState<any | null>(null);

  // Pre-seed mock database for client drawer to display extracted data if missing
  const getExtractedData = (doc: any) => {
    if (doc.extractedData) {
      try {
        return JSON.parse(doc.extractedData);
      } catch (e) {
        return {};
      }
    }
    // Return standard mock structures matching document types
    if (doc.formType === "W2") {
      return {
        wages: 82450.0,
        fedWithholding: 11450.0,
        socialSecurityTax: 5111.9,
        medicareTax: 1195.53,
        employerName: "Acro Corp Technologies LLC",
        ein: "12-3456789",
        employeeName: "John Smith",
      };
    } else if (doc.formType === "1099-INT") {
      return {
        interestIncome: 1240.5,
        fedWithholding: 0.0,
        payerName: "Chase Bank N.A.",
        recipientName: "John Smith",
        accountNumber: "xxxx-xxxx-8890",
      };
    } else if (doc.formType === "1099-DIV") {
      return {
        ordinaryDividends: 3450.0,
        qualifiedDividends: 2890.0,
        capitalGainDist: 450.0,
        fedWithholding: 120.0,
        payerName: "Fidelity Investments",
        recipientName: "John Smith",
      };
    } else if (doc.formType === "PRIOR_YEAR") {
      return {
        adjustedGrossIncome: 145890.0,
        taxableIncome: 121340.0,
        totalTax: 18450.0,
        refundAmount: 1240.0,
        taxYear: 2023,
      };
    }
    return {
      note: "Standard document scanned. Raw OCR text extracted successfully.",
    };
  };

  // Find all projects across all clients for dropdown selection
  const allProjects = clients.flatMap((c) =>
    c.projects.map((p: any) => ({
      ...p,
      clientName: c.name,
    }))
  );

  // Delete Action
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const res = await fetch(`/api/v1/documents/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDocuments(documents.filter((d) => d.id !== id));
        if (activeDoc?.id === id) setActiveDoc(null);
        if (previewDoc?.id === id) setPreviewDoc(null);
      } else {
        alert("Failed to delete document");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting document");
    }
  };

  // Resolve Duplicate Action
  const handleResolveDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocuments(
      documents.map((d) => {
        if (d.id === id) {
          return { ...d, isDuplicate: false, status: "READY" };
        }
        return d;
      })
    );
  };

  // Save Extracted Values Drawer Action
  const handleSaveExtracted = (id: string, data: any) => {
    setDocuments(
      documents.map((d) => {
        if (d.id === id) {
          return {
            ...d,
            extractedData: JSON.stringify(data),
            confidence: 1.0, // Mark 100% verified
          };
        }
        return d;
      })
    );
    setActiveDoc(null);
  };

  // Simulate Rotation Override Action
  const handleSaveRotation = () => {
    alert(`Rotation angle of ${rotationAngle}° applied. Document layout straightened and successfully re-rendered.`);
    setPreviewDoc(null);
  };

  // Filtered list
  const filteredDocs = documents.filter((doc) => {
    const clientName = doc.project?.client
      ? doc.project.client.type === "INDIVIDUAL"
        ? `${doc.project.client.firstName || ""} ${doc.project.client.lastName || ""}`.trim()
        : doc.project.client.entityName || ""
      : "Unnamed Client";

    const matchesSearch =
      doc.originalName.toLowerCase().includes(search.toLowerCase()) ||
      (doc.smartName || "").toLowerCase().includes(search.toLowerCase()) ||
      (doc.formType || "").toLowerCase().includes(search.toLowerCase()) ||
      (doc.issuer || "").toLowerCase().includes(search.toLowerCase()) ||
      clientName.toLowerCase().includes(search.toLowerCase());

    const matchesFormType = formTypeFilter === "ALL" || doc.formType === formTypeFilter;
    
    let matchesStatus = true;
    if (statusFilter === "ALL") matchesStatus = true;
    else if (statusFilter === "DUPLICATE") matchesStatus = doc.isDuplicate;
    else if (statusFilter === "READY") matchesStatus = !doc.isDuplicate && doc.status === "READY";
    else if (statusFilter === "PROCESSING") matchesStatus = doc.status === "PROCESSING";

    let matchesClient = true;
    if (selectedClient !== "ALL") {
      matchesClient = doc.project?.clientId === selectedClient;
    }

    return matchesSearch && matchesFormType && matchesStatus && matchesClient;
  });

  // Calculate stats
  const totalCount = documents.length;
  const duplicateCount = documents.filter((d) => d.isDuplicate).length;
  const readyCount = documents.filter((d) => d.status === "READY" && !d.isDuplicate).length;
  const ocrAvgConfidence = documents.length
    ? Math.round(
        (documents.reduce((acc, d) => acc + (d.confidence || 0.95), 0) / documents.length) * 100
      )
    : 0;

  // Simulator helper
  const runMockUploadSimulation = async (scenario: number) => {
    if (!uploadProjectId) {
      alert("Please select a target Client & Project first.");
      return;
    }

    setIsSimulating(true);
    setSimulationStep("Connecting to intake module...");
    setSimulationProgress(15);

    const targetProj = allProjects.find((p) => p.id === uploadProjectId);
    const clientName = targetProj ? targetProj.clientName : "Client";

    setTimeout(() => {
      setSimulationStep("Auto-converting file to search-optimized PDF...");
      setSimulationProgress(35);
    }, 800);

    setTimeout(() => {
      setSimulationStep("Analyzing rotation alignment (Auto-rotation)...");
      setSimulationProgress(55);
    }, 1500);

    if (scenario === 3) {
      // Split Scenario
      setTimeout(() => {
        setSimulationStep("Detecting document boundaries... Found 2 files! (W-2 & 1099-DIV)");
        setSimulationProgress(75);
      }, 2200);

      setTimeout(async () => {
        setSimulationStep("Applying AI Smart Rename & Extracting OCR Data...");
        setSimulationProgress(90);

        try {
          // Upload W-2 part
          const w2Res = await fetch("/api/v1/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: uploadProjectId,
              originalName: "split_w2_attachment.png",
              sizeBytes: 189200,
            }),
          });
          const w2Doc = await w2Res.json();

          // Upload 1099-DIV part
          const divRes = await fetch("/api/v1/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: uploadProjectId,
              originalName: "split_dividend_1099div.pdf",
              sizeBytes: 245000,
            }),
          });
          const divDoc = await divRes.json();

          // Update local state with beautiful custom extracted values
          const enrichedW2 = {
            ...w2Doc,
            smartName: "2024 W-2 Wage Statement — Acro Corp Technologies",
            formType: "W2",
            confidence: 0.98,
            status: "READY",
            extractedData: JSON.stringify({
              wages: 92100.0,
              fedWithholding: 13500.0,
              employerName: "Acro Corp Technologies",
              employeeName: clientName,
            }),
            project: { id: uploadProjectId, clientId: targetProj?.clientId, client: { firstName: clientName } },
          };

          const enrichedDiv = {
            ...divDoc,
            smartName: "2024 1099-DIV Dividends & Distributions — Fidelity",
            formType: "1099-DIV",
            confidence: 0.96,
            status: "READY",
            extractedData: JSON.stringify({
              ordinaryDividends: 4200.0,
              qualifiedDividends: 3100.0,
              payerName: "Fidelity Investments",
            }),
            project: { id: uploadProjectId, clientId: targetProj?.clientId, client: { firstName: clientName } },
          };

          setDocuments((prev) => [enrichedW2, enrichedDiv, ...prev]);
          setIsSimulating(false);
          setSimulationProgress(0);
          setSimulationStep("");
          alert("Smart Split complete! 1 bulk upload split into 2 smart documents, renamed, parsed, and routed successfully.");
        } catch (e) {
          console.error(e);
          setIsSimulating(false);
        }
      }, 3000);
    } else {
      // Standard / Duplicate Scenarios
      setTimeout(() => {
        setSimulationStep(scenario === 4 ? "Hashing document... Duplicate detected!" : "Smart parsing fields & identifying Form Type...");
        setSimulationProgress(75);
      }, 2200);

      setTimeout(async () => {
        setSimulationStep("Applying AI Smart Rename & Extracting OCR Data...");
        setSimulationProgress(90);

        try {
          const originalName =
            scenario === 1
              ? "scanned_invoice_w2.png"
              : scenario === 2
              ? "IMG_9824_tilted_interest.heic"
              : "duplicate_w2_chase.pdf";

          const res = await fetch("/api/v1/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: uploadProjectId,
              originalName,
              sizeBytes: scenario === 4 ? 354000 : 258000,
              isDuplicate: scenario === 4,
            }),
          });

          const doc = await res.json();

          // Customize mock extractions based on scenario
          let enrichedDoc = { ...doc };
          if (scenario === 1) {
            enrichedDoc = {
              ...doc,
              smartName: "2024 W-2 Wage Statement — Acro Corp Technologies",
              formType: "W2",
              confidence: 0.98,
              extractedData: JSON.stringify({
                wages: 85200.0,
                fedWithholding: 11450.0,
                employerName: "Acro Corp Technologies",
                employeeName: clientName,
              }),
            };
          } else if (scenario === 2) {
            enrichedDoc = {
              ...doc,
              smartName: "2024 1099-INT Interest Income — Chase Bank",
              formType: "1099-INT",
              confidence: 0.95,
              extractedData: JSON.stringify({
                interestIncome: 1450.0,
                payerName: "Chase Bank N.A.",
                recipientName: clientName,
              }),
            };
          } else if (scenario === 4) {
            enrichedDoc = {
              ...doc,
              smartName: "Duplicate Warning: 2024 W-2 Wage Statement — Acro Corp Technologies",
              formType: "W2",
              isDuplicate: true,
              confidence: 0.92,
              status: "DUPLICATE",
            };
          }

          enrichedDoc.project = {
            id: uploadProjectId,
            clientId: targetProj?.clientId,
            client: {
              firstName: clientName,
              type: targetProj?.returnType === "F1040" ? "INDIVIDUAL" : "BUSINESS",
            },
          };

          setDocuments((prev) => [enrichedDoc, ...prev]);
          setIsSimulating(false);
          setSimulationProgress(0);
          setSimulationStep("");
          alert(scenario === 4 ? "De-duplication warning raised! Duplicate file flagged for manual review." : "Upload and AI classification completed successfully!");
        } catch (e) {
          console.error(e);
          setIsSimulating(false);
        }
      }, 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: "Total Documents",
            value: totalCount,
            icon: FileText,
            color: "text-indigo-600",
            bg: "bg-indigo-50 border-indigo-100",
          },
          {
            title: "AI Smart Renamed",
            value: readyCount,
            icon: Cpu,
            color: "text-blue-600",
            bg: "bg-blue-50 border-blue-100",
          },
          {
            title: "Avg Confidence Score",
            value: `${ocrAvgConfidence}%`,
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-50 border-green-100",
          },
          {
            title: "Flagged Duplicates",
            value: duplicateCount,
            icon: AlertTriangle,
            color: "text-amber-600",
            bg: "bg-amber-50 border-amber-100",
          },
        ].map((stat, idx) => (
          <div
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
          </div>
        ))}
      </div>

      {/* Upload and Split Simulator Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Simulation Tool */}
        <div className="lg:col-span-1 bg-gradient-to-br from-[#0a071d] via-[#120a2e] to-[#040714] border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.25)] text-white rounded-2xl p-6 flex flex-col justify-between space-y-5 relative overflow-hidden backdrop-blur-xl transition-all duration-500 hover:shadow-[0_0_65px_rgba(139,92,246,0.35)] hover:border-indigo-400/40">
          
          {/* Cyber Scanning Lines & Particles Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(129,140,248,0.18),transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent animate-[pulse_2.5s_infinite] pointer-events-none" />
          
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-400/20 px-3 py-1 rounded-full text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <Sparkles size={13} className="text-indigo-400 animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider">AI Engine Co-Pilot</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[8px] font-extrabold text-emerald-400 uppercase tracking-widest">Active</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-black bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                Smart Intake Simulator
              </h3>
              <p className="text-[11px] text-slate-300/80 leading-relaxed font-medium">
                Select an active tax engagement, then execute custom AI ingestion pipelines to experience automated straightening, de-duplication, and semantic parsing.
              </p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            {/* Target Engagement dropdown */}
            <div className="space-y-1.5 text-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-indigo-300/80 uppercase tracking-wider">Target Tax Project</label>
                {uploadProjectId && (
                  <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-1.5 rounded">Selected</span>
                )}
              </div>
              <div className="relative">
                <select
                  value={uploadProjectId}
                  onChange={(e) => setUploadProjectId(e.target.value)}
                  className="w-full pl-3 pr-10 py-3 bg-[#0d0925]/80 border border-indigo-500/20 hover:border-indigo-400/40 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-white font-bold cursor-pointer transition-all hover:bg-[#120a2e] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
                >
                  <option value="" className="bg-[#0b071e] text-slate-400 font-medium">-- Choose Client Project --</option>
                  {allProjects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#0b071e] text-white">
                      {p.clientName} ({p.year} {getReturnTypeLabel(p.returnType)})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3.5 pointer-events-none text-indigo-400">
                  <Layers size={14} className="animate-[pulse_2s_infinite]" />
                </div>
              </div>
            </div>

            {/* Simulated Scenarios */}
            <div className="space-y-2.5 pt-1">
              <p className="text-[10px] font-bold text-indigo-300/80 uppercase tracking-wider">Simulate Upload File</p>
              
              <button
                disabled={isSimulating}
                onClick={() => runMockUploadSimulation(1)}
                className="w-full flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-indigo-500/40 rounded-xl transition-all duration-300 text-xs font-bold group disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)] group-hover:bg-indigo-500/20 group-hover:border-indigo-400 transition-all duration-300">
                    <FileText size={15} />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-white group-hover:text-indigo-300 transition-colors font-bold truncate">W-2 Image (PNG format)</p>
                    <p className="text-[10px] text-slate-400 font-normal mt-0.5 truncate">Auto-renaming, extraction & routing</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>

              <button
                disabled={isSimulating}
                onClick={() => runMockUploadSimulation(2)}
                className="w-full flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-indigo-500/40 rounded-xl transition-all duration-300 text-xs font-bold group disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)] group-hover:bg-cyan-500/20 group-hover:border-cyan-400 transition-all duration-300">
                    <RotateCw size={15} className="group-hover:rotate-45 transition-transform duration-300" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-white group-hover:text-cyan-300 transition-colors font-bold truncate">Tilted 1099-INT (HEIC)</p>
                    <p className="text-[10px] text-slate-400 font-normal mt-0.5 truncate">Orientation correction & conversion</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>

              <button
                disabled={isSimulating}
                onClick={() => runMockUploadSimulation(3)}
                className="w-full flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-violet-500/40 rounded-xl transition-all duration-300 text-xs font-bold group disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.2)] group-hover:bg-violet-500/20 group-hover:border-violet-400 transition-all duration-300">
                    <Scissors size={15} className="group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-white group-hover:text-violet-300 transition-colors font-bold truncate">Combined Intake (Multi-page PDF)</p>
                    <p className="text-[10px] text-slate-400 font-normal mt-0.5 truncate">Intelligent splitting into distinct forms</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>

              <button
                disabled={isSimulating}
                onClick={() => runMockUploadSimulation(4)}
                className="w-full flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-amber-500/40 rounded-xl transition-all duration-300 text-xs font-bold group disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)] group-hover:bg-amber-500/20 group-hover:border-amber-400 transition-all duration-300">
                    <AlertTriangle size={15} className="group-hover:animate-bounce transition-transform duration-300" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-white group-hover:text-amber-300 transition-colors font-bold truncate">Duplicate Chase W-2</p>
                    <p className="text-[10px] text-slate-400 font-normal mt-0.5 truncate">Hash checking & alert banner warning</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            </div>
          </div>

          {/* Stepper Active Simulator */}
          <AnimatePresence>
            {isSimulating && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: 10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: 10 }}
                className="bg-[#0b061d] border border-indigo-500/30 rounded-xl p-3.5 space-y-2.5 mt-2 overflow-hidden shadow-[0_0_25px_rgba(99,102,241,0.15)]"
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="flex items-center gap-2 text-indigo-300">
                    <RefreshCw className="animate-spin text-indigo-400" size={13} />
                    {simulationStep}
                  </span>
                  <span className="text-indigo-400 font-black">{simulationProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/5">
                  <div
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                    style={{ width: `${simulationProgress}%` }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Search and Document List */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h3 className="font-bold text-gray-800 text-base">All Scanned Files</h3>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <select
                  value={formTypeFilter}
                  onChange={(e) => setFormTypeFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-700 cursor-pointer"
                >
                  <option value="ALL">All Forms</option>
                  <option value="W2">W-2</option>
                  <option value="1099-INT">1099-INT</option>
                  <option value="1099-DIV">1099-DIV</option>
                  <option value="PRIOR_YEAR">Prior Returns</option>
                </select>
                <Filter className="absolute right-2 top-2 text-gray-400 pointer-events-none" size={12} />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-700 cursor-pointer"
                >
                  <option value="ALL">All Status</option>
                  <option value="READY">Ready</option>
                  <option value="DUPLICATE">Duplicates</option>
                </select>
                <Filter className="absolute right-2 top-2 text-gray-400 pointer-events-none" size={12} />
              </div>

              <div className="relative">
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-700 cursor-pointer"
                >
                  <option value="ALL">All Clients</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-2 top-2 text-gray-400 pointer-events-none" size={12} />
              </div>
            </div>
          </div>

          {/* Quick search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search documents by smart filename, original upload title, issuer, or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
          </div>

          {/* Documents display grid */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {filteredDocs.length === 0 ? (
                <div className="border border-dashed border-gray-200 rounded-2xl p-12 text-center text-xs text-gray-400 bg-gray-50/50">
                  <Database className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="font-semibold text-gray-600">No scanned documents found</p>
                  <p className="text-gray-400 mt-1">Select a client and run an AI simulator upload on the left to start parsing.</p>
                </div>
              ) : (
                filteredDocs.map((doc) => {
                  const clientName = doc.project?.client
                    ? doc.project.client.type === "INDIVIDUAL"
                      ? `${doc.project.client.firstName || ""} ${doc.project.client.lastName || ""}`.trim()
                      : doc.project.client.entityName || ""
                    : "Unnamed Client";
                  
                  const confidence = Math.round((doc.confidence || 0.96) * 100);

                  return (
                    <motion.div
                      layout
                      key={doc.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className={`border rounded-xl p-4 transition-all flex flex-col md:flex-row items-start justify-between gap-4 bg-white relative overflow-hidden group ${
                        doc.isDuplicate ? "border-amber-200 hover:border-amber-300 bg-amber-50/20" : "border-gray-200 hover:border-indigo-200"
                      }`}
                    >
                      {/* Left icon and titles */}
                      <div className="flex gap-3 items-start flex-1 min-w-0">
                        <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0">
                          <FileText size={20} />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="font-bold text-gray-800 text-sm truncate leading-snug group-hover:text-indigo-600 transition-colors">
                              {doc.smartName || doc.originalName}
                            </h4>
                            <span className="bg-indigo-100 border border-indigo-100 text-indigo-700 font-extrabold text-[9px] px-1.5 py-0.2 rounded uppercase">
                              AI Rename
                            </span>
                            {doc.isDuplicate && (
                              <span className="bg-amber-100 text-amber-700 font-extrabold text-[9px] px-1.5 py-0.2 rounded uppercase flex items-center gap-1">
                                <AlertTriangle size={8} />
                                Duplicate
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] text-gray-400 font-bold flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-gray-500">Original: {doc.originalName}</span>
                            <span>&bull;</span>
                            <span>{(doc.sizeBytes / 1024).toFixed(1)} KB</span>
                            <span>&bull;</span>
                            <span className="text-indigo-600 font-semibold">{clientName} (Proj: {doc.project?.year})</span>
                          </div>

                          {/* Preview OCR Snippet */}
                          {!doc.isDuplicate && doc.formType && (
                            <div className="text-[10px] text-gray-500 bg-gray-50 rounded-lg p-2 font-mono border border-gray-100 mt-1 max-w-md truncate">
                              {doc.formType === "W2"
                                ? `W-2 Wages: $${getExtractedData(doc).wages?.toLocaleString() || "82,450"} | Withholding: $${getExtractedData(doc).fedWithholding?.toLocaleString() || "11,450"}`
                                : doc.formType === "1099-INT"
                                ? `Interest: $${getExtractedData(doc).interestIncome?.toLocaleString() || "1,240"} | Chase Account: xxxx-8890`
                                : `Ordinary Dividends: $${getExtractedData(doc).ordinaryDividends?.toLocaleString() || "3,450"} | Issuer: Fidelity`}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right info, confidence and buttons */}
                      <div className="flex md:flex-col items-end justify-between md:justify-start gap-4 flex-shrink-0 w-full md:w-auto">
                        <div className="space-y-1.5 text-right w-full md:w-auto">
                          <div className="flex md:justify-end items-center gap-1">
                            <Cpu size={12} className="text-indigo-500" />
                            <span className="text-[10px] font-bold text-gray-400">Confidence</span>
                            <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                              confidence > 90 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                            }`}>
                              {confidence}%
                            </span>
                          </div>
                          <div className="w-24 bg-gray-100 rounded-full h-1 overflow-hidden hidden md:block">
                            <div
                              className={`h-1 rounded-full ${confidence > 90 ? "bg-green-500" : "bg-amber-500"}`}
                              style={{ width: `${confidence}%` }}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {doc.isDuplicate ? (
                            <button
                              onClick={(e) => handleResolveDuplicate(doc.id, e)}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg transition-all shadow-sm"
                              title="Resolve duplicate warning by approving this upload"
                            >
                              Resolve
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => setActiveDoc(doc)}
                                className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="View OCR Values"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => {
                                  setPreviewDoc(doc);
                                  setRotationAngle(0);
                                }}
                                className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="straighten orientation"
                              >
                                <RotateCw size={15} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={(e) => handleDelete(doc.id, e)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete file"
                          >
                            <Trash2 size={15} />
                          </button>
                          {doc.projectId && (
                            <Link
                              href={`/projects/${doc.projectId}`}
                              className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="Go to engagement"
                            >
                              <ExternalLink size={15} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Drawers and Modals */}
      
      {/* 1. OCR extracted values editor drawer */}
      <AnimatePresence>
        {activeDoc && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex justify-end backdrop-blur-xs">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="w-full max-w-lg bg-white h-screen shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2">
                    <Database className="text-indigo-600" size={20} />
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">OCR Extracted Fields</h3>
                      <p className="text-[10px] text-gray-400 font-medium">Verify or adjust classified fields below</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveDoc(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                    <X size={18} />
                  </button>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3 text-indigo-900 text-xs">
                  <Info size={16} className="text-indigo-600 flex-shrink-0" />
                  <p className="leading-normal">
                    This document was parsed via our <strong>Drake Tax Form Classifier</strong>. Check and match key line items before exporting into workpapers.
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Document Metadata</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Smart Name</label>
                      <input
                        type="text"
                        defaultValue={activeDoc.smartName || activeDoc.originalName}
                        className="w-full pl-3 pr-3 py-2 border rounded-xl text-xs focus:ring-indigo-500 focus:outline-none bg-gray-50 font-semibold"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Form Type</label>
                      <span className="w-full block pl-3 pr-3 py-2 border rounded-xl text-xs bg-indigo-50 font-extrabold text-indigo-700">
                        {activeDoc.formType || "Unknown"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider pt-2 border-t">Extracted OCR Form Values</p>

                  {/* Form fields based on classified type */}
                  {activeDoc.formType === "W2" ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Employer Name</label>
                        <input
                          id="employerName"
                          type="text"
                          defaultValue={getExtractedData(activeDoc).employerName || "Acro Corp Technologies LLC"}
                          className="w-full pl-3 pr-3 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Box 1: Wages, Tips, Compensation ($)</label>
                          <input
                            id="wages"
                            type="number"
                            defaultValue={getExtractedData(activeDoc).wages || 82450}
                            className="w-full pl-3 pr-3 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Box 2: Federal Income Tax Withheld ($)</label>
                          <input
                            id="fedWithholding"
                            type="number"
                            defaultValue={getExtractedData(activeDoc).fedWithholding || 11450}
                            className="w-full pl-3 pr-3 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-green-700 bg-green-50/20"
                          />
                        </div>
                      </div>
                    </div>
                  ) : activeDoc.formType === "1099-INT" ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Payer Name</label>
                        <input
                          id="payerName"
                          type="text"
                          defaultValue={getExtractedData(activeDoc).payerName || "Chase Bank N.A."}
                          className="w-full pl-3 pr-3 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Box 1: Interest Income ($)</label>
                          <input
                            id="interestIncome"
                            type="number"
                            defaultValue={getExtractedData(activeDoc).interestIncome || 1240.5}
                            className="w-full pl-3 pr-3 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Box 4: Federal Tax Withheld ($)</label>
                          <input
                            id="fedWithholding"
                            type="number"
                            defaultValue={getExtractedData(activeDoc).fedWithholding || 0}
                            className="w-full pl-3 pr-3 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Payer / Issuer</label>
                        <input
                          id="payerName"
                          type="text"
                          defaultValue={getExtractedData(activeDoc).payerName || "Fidelity Investments"}
                          className="w-full pl-3 pr-3 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Ordinary Dividends ($)</label>
                          <input
                            id="ordinaryDividends"
                            type="number"
                            defaultValue={getExtractedData(activeDoc).ordinaryDividends || 3450}
                            className="w-full pl-3 pr-3 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Qualified Dividends ($)</label>
                          <input
                            id="qualifiedDividends"
                            type="number"
                            defaultValue={getExtractedData(activeDoc).qualifiedDividends || 2890}
                            className="w-full pl-3 pr-3 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-green-700 bg-green-50/20"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer footer */}
              <div className="border-t pt-4 flex gap-3">
                <button
                  onClick={() => setActiveDoc(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const data: any = {};
                    if (activeDoc.formType === "W2") {
                      data.employerName = (document.getElementById("employerName") as HTMLInputElement)?.value;
                      data.wages = Number((document.getElementById("wages") as HTMLInputElement)?.value || 0);
                      data.fedWithholding = Number((document.getElementById("fedWithholding") as HTMLInputElement)?.value || 0);
                    } else {
                      data.payerName = (document.getElementById("payerName") as HTMLInputElement)?.value;
                      data.interestIncome = Number((document.getElementById("interestIncome") as HTMLInputElement)?.value || 0);
                    }
                    handleSaveExtracted(activeDoc.id, data);
                  }}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  Verify & Approve OCR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Straightener / Orientation Fix modal */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 space-y-6 flex flex-col"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <RotateCw className="text-indigo-600" size={18} />
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">straighten orientation</h3>
                    <p className="text-[10px] text-gray-400 font-medium">Straighten scanned or tilted page layout</p>
                  </div>
                </div>
                <button onClick={() => setPreviewDoc(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                  <X size={18} />
                </button>
              </div>

              {/* Page Canvas Simulation */}
              <div className="bg-slate-100 rounded-2xl border border-dashed border-gray-200 p-8 flex items-center justify-center min-h-[300px] overflow-hidden relative">
                <motion.div
                  animate={{ rotate: rotationAngle }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="w-48 h-64 bg-white shadow-lg border rounded-lg p-4 flex flex-col justify-between space-y-4 select-none"
                >
                  {/* Mock content of tilted document */}
                  <div className="flex justify-between items-start border-b pb-2">
                    <span className="text-[8px] font-bold text-gray-600">IRS Form W-2</span>
                    <span className="text-[8px] font-bold text-gray-400">2024</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center space-y-2">
                    <div className="h-2 w-full bg-slate-200 rounded" />
                    <div className="h-2 w-3/4 bg-slate-200 rounded" />
                    <div className="h-2 w-5/6 bg-slate-200 rounded" />
                    <div className="h-2 w-1/2 bg-slate-200 rounded" />
                  </div>
                  <div className="flex justify-between items-center text-[7px] font-bold text-indigo-600">
                    <span>Smart Straightened</span>
                    <CheckCircle size={10} />
                  </div>
                </motion.div>

                {rotationAngle !== 0 && (
                  <span className="absolute bottom-3 bg-indigo-900 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                    Angle Override: {rotationAngle}°
                  </span>
                )}
              </div>

              {/* Adjusters */}
              <div className="flex items-center justify-between bg-slate-50 border rounded-xl p-3">
                <span className="text-xs font-semibold text-gray-600">Quick Adjustments</span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRotationAngle((prev) => (prev - 90) % 360)}
                    className="p-2 bg-white border hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <RotateCw size={12} className="rotate-180" />
                    -90° Left
                  </button>
                  <button
                    onClick={() => setRotationAngle((prev) => (prev + 90) % 360)}
                    className="p-2 bg-white border hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <RotateCw size={12} />
                    +90° Right
                  </button>
                  <button
                    onClick={() => setRotationAngle(0)}
                    className="p-2 bg-white border hover:bg-red-50 hover:text-red-700 rounded-xl text-xs font-bold text-gray-600 transition-all shadow-xs"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRotation}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-indigo-100"
                >
                  Save Straightened PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
