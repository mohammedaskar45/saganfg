"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PenTool,
  CreditCard,
  Send,
  Users,
  CheckCircle,
  FileCheck,
  Plus,
  ArrowUpRight,
  ExternalLink,
  Info,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DeliveryClientProps {
  project: {
    id: string;
    year: number;
    returnType: string;
    client: {
      name: string;
      email: string;
    };
    invoices: any[];
    signatureRequests: any[];
    k1Distributions: any[];
  };
}

export default function DeliveryClient({ project }: DeliveryClientProps) {
  const router = useRouter();
  const [invoices, setInvoices] = useState(project.invoices);
  const [signatures, setSignatures] = useState(project.signatureRequests);
  const [k1s, setK1s] = useState(project.k1Distributions);

  // Forms states
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [signerName, setSignerName] = useState(project.client.name);
  const [signerEmail, setSignerEmail] = useState(project.client.email);
  const [k1Name, setK1Name] = useState("");
  const [k1Email, setK1Email] = useState("");

  const [loading, setLoading] = useState(false);

  // Create E-Signature handler
  const handleRequestSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/v1/projects/${project.id}/delivery/esign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signerName, signerEmail }),
      });

      if (res.ok) {
        const newSig = await res.json();
        setSignatures([newSig, ...signatures]);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Simulate client signing 8879
  const handleSimulateSign = async (sigId: string) => {
    try {
      const res = await fetch(`/api/v1/projects/${project.id}/delivery/esign/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sigId }),
      });

      if (res.ok) {
        setSignatures(
          signatures.map((s) =>
            s.id === sigId ? { ...s, status: "SIGNED", signedAt: new Date().toISOString() } : s
          )
        );
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Invoice handler
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceAmount.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${project.id}/delivery/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(invoiceAmount) }),
      });

      if (res.ok) {
        const newInv = await res.json();
        setInvoices([newInv, ...invoices]);
        setInvoiceAmount("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Simulate Stripe Webhook pay invoice
  const handleSimulatePayment = async (invId: string) => {
    try {
      const res = await fetch(`/api/v1/projects/${project.id}/delivery/invoice/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invId }),
      });

      if (res.ok) {
        setInvoices(
          invoices.map((i) => (i.id === invId ? { ...i, status: "PAID" } : i))
        );
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Distribute partnership K1s handler
  const handleDistributeK1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!k1Name.trim() || !k1Email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${project.id}/delivery/k1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientName: k1Name, recipientEmail: k1Email }),
      });

      if (res.ok) {
        const newK1 = await res.json();
        setK1s([newK1, ...k1s]);
        setK1Name("");
        setK1Email("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Box 1: E-Signatures (Form 8879 Request) */}
      <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b pb-2">
          <PenTool className="text-indigo-600" size={18} />
          <h3 className="font-bold text-gray-800 text-sm">Form 8879 E-Signatures</h3>
        </div>

        {/* Create esign request form */}
        <form onSubmit={handleRequestSignature} className="grid grid-cols-2 gap-3 items-end">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Signer Name
            </label>
            <input
              type="text"
              required
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all font-medium text-gray-700"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Signer Email
            </label>
            <input
              type="email"
              required
              value={signerEmail}
              onChange={(e) => setSignerEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all font-medium text-gray-700"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="col-span-2 py-2 px-4 rounded-xl text-white font-bold text-xs bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
          >
            <Send size={12} />
            Request E-Signature on Form 8879
          </button>
        </form>

        {/* Signatures List */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Signature Requests status
          </span>
          {signatures.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No signature requests yet.
            </p>
          ) : (
            signatures.map((sig) => (
              <div key={sig.id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-gray-800 leading-snug">{sig.signerName}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{sig.signerEmail}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      sig.status === "SIGNED"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {sig.status}
                  </span>

                  {sig.status === "PENDING" && (
                    <button
                      onClick={() => handleSimulateSign(sig.id)}
                      className="text-[10px] font-bold py-1 px-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-50/20 rounded-md transition-all whitespace-nowrap"
                    >
                      Simulate Sign
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Box 2: Billing & Invoices (Stripe integration) */}
      <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b pb-2">
          <CreditCard className="text-indigo-600" size={18} />
          <h3 className="font-bold text-gray-800 text-sm">Billing & Invoices</h3>
        </div>

        {/* Generate Invoice Form */}
        <form onSubmit={handleCreateInvoice} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Invoice Amount (USD)
            </label>
            <div className="relative">
              <input
                type="number"
                required
                placeholder="450"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all font-mono text-gray-700 font-bold"
              />
              <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold font-sans">$</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="py-2 px-4 rounded-xl text-white font-bold text-xs bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
          >
            <Plus size={12} />
            Add Invoice
          </button>
        </form>

        {/* Invoices List */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Outstanding billing
          </span>
          {invoices.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No outstanding invoices.
            </p>
          ) : (
            invoices.map((inv) => (
              <div key={inv.id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold text-gray-800 leading-snug">
                    Invoice #{inv.invoiceNumber}
                  </p>
                  <p className="text-[10px] text-gray-600 font-bold">{formatCurrency(inv.amount)}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      inv.status === "PAID"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {inv.status}
                  </span>

                  {inv.status === "DRAFT" && (
                    <button
                      onClick={() => handleSimulatePayment(inv.id)}
                      className="text-[10px] font-bold py-1 px-2 border border-green-600 text-green-600 hover:bg-green-50/20 rounded-md transition-all whitespace-nowrap"
                    >
                      Mark Paid
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Box 3: Partnership K-1 Distribution Logs (for Partnership Form 1065 / 1120S) */}
      {(project.returnType === "F1065" || project.returnType === "F1120S") && (
        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm space-y-6 lg:col-span-2">
          <div className="flex items-center gap-2 border-b pb-2">
            <Users className="text-indigo-600" size={18} />
            <h3 className="font-bold text-gray-800 text-sm">Schedule K-1 Distribution</h3>
          </div>

          <form onSubmit={handleDistributeK1} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Recipient Partner Name
              </label>
              <input
                type="text"
                required
                placeholder="Partner Name"
                value={k1Name}
                onChange={(e) => setK1Name(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all font-medium text-gray-700"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                required
                placeholder="partner@company.com"
                value={k1Email}
                onChange={(e) => setK1Email(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all font-medium text-gray-700"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-4 rounded-xl text-white font-bold text-xs bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
            >
              <Plus size={12} />
              Distribute Schedule K-1
            </button>
          </form>

          {/* K-1 distribution logs */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Distributed logs
            </span>
            {k1s.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No Schedule K-1 forms distributed yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {k1s.map((k) => (
                  <div key={k.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-800 leading-snug">{k.recipientName}</p>
                      <p className="text-[9px] text-gray-400 font-medium leading-none mt-0.5">{k.recipientEmail}</p>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-green-100 text-green-700">
                      {k.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
