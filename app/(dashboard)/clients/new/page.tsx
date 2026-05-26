"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Building, ChevronLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewClientPage() {
  const router = useRouter();
  const [type, setType] = useState<"INDIVIDUAL" | "ENTITY">("INDIVIDUAL");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [entityName, setEntityName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ssn, setSsn] = useState("");
  const [ein, setEin] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          firstName: type === "INDIVIDUAL" ? firstName : null,
          lastName: type === "INDIVIDUAL" ? lastName : null,
          entityName: type === "ENTITY" ? entityName : null,
          email,
          phone,
          ssn: type === "INDIVIDUAL" ? ssn : null,
          ein: type === "ENTITY" ? ein : null,
          address,
          notes,
        }),
      });

      if (res.ok) {
        router.push("/clients");
        router.refresh();
      } else {
        const data = await res.text();
        setError(data || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to create client. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/clients"
        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
      >
        <ChevronLeft size={16} />
        Back to Clients
      </Link>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Client</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create an individual or business client entity profile
          </p>
        </div>
      </div>

      {/* Main Form Box */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
          {/* Client Type Selector */}
          <div className="p-6 space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              Client Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType("INDIVIDUAL")}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  type === "INDIVIDUAL"
                    ? "border-indigo-600 bg-indigo-50/20 text-indigo-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700 bg-white"
                }`}
              >
                <User size={24} />
                <span className="font-bold text-sm">Individual Client</span>
                <span className="text-xs text-gray-400 text-center">
                  Form 1040, Estates, Trusts, personal returns
                </span>
              </button>

              <button
                type="button"
                onClick={() => setType("ENTITY")}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  type === "ENTITY"
                    ? "border-indigo-600 bg-indigo-50/20 text-indigo-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700 bg-white"
                }`}
              >
                <Building size={24} />
                <span className="font-bold text-sm">Business Entity</span>
                <span className="text-xs text-gray-400 text-center">
                  Partnership (1065), S-Corp (1120S), corporations
                </span>
              </button>
            </div>
          </div>

          {/* Details Form Grid */}
          <div className="p-6 space-y-6">
            {type === "INDIVIDUAL" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="Tech Ventures LLC"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="555-0100"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {type === "INDIVIDUAL" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Security Number (SSN)
                </label>
                <input
                  type="text"
                  value={ssn}
                  onChange={(e) => setSsn(e.target.value)}
                  placeholder="XXX-XX-XXXX"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employer Identification Number (EIN)
                </label>
                <input
                  type="text"
                  value={ein}
                  onChange={(e) => setEin(e.target.value)}
                  placeholder="XX-XXXXXXX"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, Suite 100, Austin, TX 78701"
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internal Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any specific context, client preference or details..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-gray-50 flex justify-end gap-3 items-center">
            {error && <span className="text-xs text-red-600 font-semibold">{error}</span>}
            <Link
              href="/clients"
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {loading ? "Creating..." : "Create Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
