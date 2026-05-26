"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  Clock,
  CheckCircle,
  CreditCard,
  PenTool,
  Lock,
  Plus,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PortalClientProps {
  project: {
    id: string;
    year: number;
    returnType: string;
    client: {
      name: string;
      email: string;
    };
    checklistItems: any[];
    invoices: any[];
    signatureRequests: any[];
  };
  portalToken: string;
}

export default function PortalClient({ project, portalToken }: PortalClientProps) {
  const router = useRouter();
  const [checklist, setChecklist] = useState(project.checklistItems);
  const [invoices, setInvoices] = useState(project.invoices);
  const [signatures, setSignatures] = useState(project.signatureRequests);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);

  // Client uploads requested document handler
  const handleUploadItem = async (itemId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Upload progress bar animation simulation
    setUploadProgress({ [itemId]: 10 });
    for (let p = 25; p <= 100; p += 25) {
      await new Promise((r) => setTimeout(r, 100));
      setUploadProgress({ [itemId]: p });
    }

    try {
      // Create document in database using FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", project.id);

      const docRes = await fetch(`/api/v1/documents`, {
        method: "POST",
        headers: {
          "x-portal-token": portalToken,
        },
        body: formData,
      });

      if (docRes.ok) {
        // Toggle checklist status in database to RECEIVED
        const checkRes = await fetch(`/api/v1/projects/${project.id}/checklist`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-portal-token": portalToken,
          },
          body: JSON.stringify({ itemId, status: "RECEIVED" }),
        });

        if (checkRes.ok) {
          setChecklist(
            checklist.map((item) =>
              item.id === itemId ? { ...item, status: "RECEIVED" } : item
            )
          );
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadProgress({});
      router.refresh();
    }
  };

  // Pay invoice simulator
  const handlePayInvoice = async (invId: string) => {
    try {
      const res = await fetch(`/api/v1/projects/${project.id}/delivery/invoice/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-portal-token": portalToken,
        },
        body: JSON.stringify({ invId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        setInvoices(
          invoices.map((i) => (i.id === invId ? { ...i, status: "PAID" } : i))
        );
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Sign Form 8879 simulator
  const handleSignDocument = async (sigId: string) => {
    try {
      const res = await fetch(`/api/v1/projects/${project.id}/delivery/esign/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-portal-token": portalToken,
        },
        body: JSON.stringify({ sigId }),
      });

      if (res.ok) {
        setSignatures(
          signatures.map((s) => (s.id === sigId ? { ...s, status: "SIGNED" } : s))
        );
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Requested document list (2/3 width) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm space-y-5">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <FileText className="text-indigo-600" size={18} />
            Requested Source Documents
          </h3>

          <div className="divide-y divide-gray-100">
            {checklist.map((item) => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div>
                  <h4 className="text-xs font-bold text-gray-800 leading-snug">{item.description}</h4>
                  {item.formType && (
                    <span className="bg-gray-50 border border-gray-100 text-gray-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mt-1.5 block w-max tracking-wider">
                      {item.formType}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Indicator */}
                  {item.status === "RECEIVED" ? (
                    <div className="flex items-center gap-1.5 text-xs text-green-700 font-semibold bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                      <CheckCircle size={14} className="text-green-600" />
                      <span>Received</span>
                    </div>
                  ) : item.status === "NOT_APPLICABLE" ? (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                      <span>Not Applicable</span>
                    </div>
                  ) : (
                    /* Secure client upload action */
                    <div className="relative">
                      {uploadProgress[item.id] !== undefined ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg">
                          <span className="animate-pulse">Uploading {uploadProgress[item.id]}%</span>
                        </div>
                      ) : (
                        <label className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm shadow-indigo-100 cursor-pointer">
                          <UploadCloud size={14} />
                          Upload File
                          <input
                            type="file"
                            onChange={(e) => handleUploadItem(item.id, e.target.files)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Outstandings widgets (1/3 width) */}
      <div className="space-y-6">
        {/* Box 1: Form 8879 E-sign requests */}
        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <PenTool className="text-indigo-600" size={18} />
            <h3 className="font-bold text-gray-800 text-sm">Disclosures & Agreements</h3>
          </div>

          <p className="text-[10px] text-gray-400 leading-relaxed">
            Review and sign IRS Form 8879 to authorize electronic filing.
          </p>

          <div className="space-y-3 pt-2">
            {signatures.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No signatures required.
              </p>
            ) : (
              signatures.map((sig) => (
                <div key={sig.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">Form 8879 Filing Auth</h4>
                    <p className="text-[9px] text-gray-400 mt-0.5">{sig.signerEmail}</p>
                  </div>

                  {sig.status === "SIGNED" ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded uppercase">
                        Signed
                      </span>
                      {sig.signedDocumentKey && (
                        <a
                          href={`/uploads/projects/${project.id}/${sig.signedDocumentKey}`}
                          download
                          className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                        >
                          Download PDF
                        </a>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSignDocument(sig.id)}
                      className="text-[10px] font-bold py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all whitespace-nowrap shadow-sm shadow-indigo-100"
                    >
                      Sign Now
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Box 2: Billing & Invoices */}
        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="text-indigo-600" size={18} />
            <h3 className="font-bold text-gray-800 text-sm">Outstanding Balances</h3>
          </div>

          <p className="text-[10px] text-gray-400 leading-relaxed">
            Settle return preparation fees securely. Stripe payout logs integrate automatically.
          </p>

          <div className="space-y-3 pt-2">
            {invoices.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No unpaid balances.
              </p>
            ) : (
              invoices.map((inv) => (
                <div key={inv.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">Invoice #{inv.invoiceNumber}</h4>
                    <p className="text-[10px] text-gray-600 font-bold mt-0.5">{formatCurrency(inv.amount)}</p>
                  </div>

                  {inv.status === "PAID" ? (
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded uppercase">
                      Paid
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePayInvoice(inv.id)}
                      className="text-[10px] font-bold py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all whitespace-nowrap shadow-sm shadow-indigo-100"
                    >
                      Pay Bill
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
