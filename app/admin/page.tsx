import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ShieldAlert, Server, Activity, Users, Layers, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user || !(session.user as any).isSuperAdmin) {
    redirect("/dashboard");
  }

  // Query platform statistics
  const totalFirms = await prisma.firm.count();
  const totalUsers = await prisma.user.count();
  const totalProjects = await prisma.project.count();
  const totalDocs = await prisma.document.count();

  // Fetch all tenants
  const firms = await prisma.firm.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-red-500" size={24} />
          <h1 className="text-2xl font-bold text-white">SaaS Platform Control Center</h1>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Monitor multi-tenant infrastructure logs, billing plans, and database status
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Tenant Firms", value: totalFirms, icon: Layers, color: "text-blue-400 bg-blue-950/40 border-blue-900/40" },
          { title: "Registered Users", value: totalUsers, icon: Users, color: "text-purple-400 bg-purple-950/40 border-purple-900/40" },
          { title: "Engagement Projects", value: totalProjects, icon: Activity, color: "text-emerald-400 bg-emerald-950/40 border-emerald-900/40" },
          { title: "OCR Document Processing", value: totalDocs, icon: Server, color: "text-amber-400 bg-amber-950/40 border-amber-900/40" },
        ].map((card, idx) => (
          <div key={idx} className={`border rounded-2xl p-5 flex items-center justify-between shadow ${card.color}`}>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                {card.title}
              </span>
              <span className="text-3xl font-extrabold text-white block">{card.value}</span>
            </div>
            <div className="p-3 bg-gray-900/60 rounded-xl shadow-inner text-white">
              <card.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Active Tenants Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow">
        <div className="p-5 border-b border-gray-800">
          <h3 className="font-bold text-sm text-white">Active Tenant Firms</h3>
          <p className="text-[10px] text-gray-400 mt-1">Listing registered accounting firms configured on the platform</p>
        </div>

        <table className="w-full text-left border-collapse text-xs text-gray-300">
          <thead>
            <tr className="bg-gray-950 border-b border-gray-800 font-semibold text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Firm Name</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Active Plan</th>
              <th className="px-6 py-4">Joined Date</th>
              <th className="px-6 py-4">Tenant Status</th>
              <th className="px-6 py-4 text-right">Settings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {firms.map((firm) => (
              <tr key={firm.id} className="hover:bg-gray-900/30 transition-colors">
                <td className="px-6 py-4 font-bold text-white leading-normal flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-950 border border-gray-800 flex items-center justify-center font-extrabold text-indigo-400 text-xs">
                    {firm.name.charAt(0)}
                  </div>
                  <span>{firm.name}</span>
                </td>
                <td className="px-6 py-4 font-mono text-[10px] text-gray-400">{firm.slug}</td>
                <td className="px-6 py-4">
                  <span className="bg-indigo-950 border border-indigo-900/60 text-indigo-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                    {firm.plan}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">{formatDate(firm.createdAt)}</td>
                <td className="px-6 py-4">
                  <span className="bg-emerald-950 border border-emerald-900/60 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px]">
                    ACTIVE
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 hover:bg-gray-850 rounded text-gray-500 hover:text-white transition-colors">
                    <ExternalLink size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
