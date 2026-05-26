"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, User, Building, ChevronRight, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { getStageColor } from "@/lib/utils";

interface ClientsClientProps {
  initialClients: any[];
}

export default function ClientsClient({ initialClients }: ClientsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const filteredClients = initialClients.filter((client) => {
    const clientName = client.type === "INDIVIDUAL"
      ? `${client.firstName} ${client.lastName}`
      : client.entityName;
    const matchesSearch =
      clientName?.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase()) ||
      (client.phone && client.phone.includes(search));

    const matchesType = typeFilter === "ALL" || client.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter Row */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search bar */}
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>

          {/* Type selector */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all text-gray-700 font-medium"
          >
            <option value="ALL">All Types</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="ENTITY">Entity</option>
          </select>
        </div>

        {/* CTA Button */}
        <Link
          href="/clients/new"
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all shadow-sm shadow-indigo-100"
        >
          <Plus size={16} />
          Add Client
        </Link>
      </div>

      {/* Clients Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Client Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Active Returns</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  No clients found.
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => {
                const clientName = client.type === "INDIVIDUAL"
                  ? `${client.firstName} ${client.lastName}`
                  : client.entityName;

                const activeReturns = client.projects.filter(
                  (p: any) => p.status !== "COMPLETE" && p.status !== "ARCHIVED"
                );

                return (
                  <tr
                    key={client.id}
                    onClick={() => router.push(`/clients/${client.id}`)}
                    className="hover:bg-gray-50/50 cursor-pointer transition-colors group"
                  >
                    {/* Name column */}
                    <td className="px-6 py-4 font-bold text-gray-800 leading-normal group-hover:text-indigo-600 transition-colors flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
                        {client.type === "INDIVIDUAL" ? (
                          <User size={16} />
                        ) : (
                          <Building size={16} />
                        )}
                      </div>
                      <span>{clientName}</span>
                    </td>

                    {/* Type column */}
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                          client.type === "INDIVIDUAL"
                            ? "bg-sky-50 text-sky-700 border border-sky-100"
                            : "bg-purple-50 text-purple-700 border border-purple-100"
                        }`}
                      >
                        {client.type}
                      </span>
                    </td>

                    {/* Email column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Mail size={14} className="text-gray-400" />
                        <span>{client.email}</span>
                      </div>
                    </td>

                    {/* Phone column */}
                    <td className="px-6 py-4">
                      {client.phone ? (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Phone size={14} className="text-gray-400" />
                          <span>{client.phone}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Active Returns badges */}
                    <td className="px-6 py-4">
                      {activeReturns.length === 0 ? (
                        <span className="text-xs text-gray-400">None</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {activeReturns.map((p: any) => (
                            <span
                              key={p.id}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white shadow-sm"
                              style={{ background: getStageColor(p.stage) }}
                              title={`Tax Year ${p.year} - Stage: ${p.stage}`}
                            >
                              {p.year}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Action column */}
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 group-hover:text-indigo-600 transition-all">
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
