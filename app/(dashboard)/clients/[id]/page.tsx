import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, User, Building, Mail, Phone, Calendar, ArrowRight, FolderPlus } from "lucide-react";
import { formatDate, getStageColor, getStatusColor, getReturnTypeLabel } from "@/lib/utils";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  // Fetch client details
  const client = await prisma.client.findUnique({
    where: {
      id,
    },
    include: {
      projects: {
        orderBy: {
          year: "desc",
        },
      },
    },
  });

  if (!client || client.firmId !== (session.user as any).firmId) {
    notFound();
  }

  const clientName = client.type === "INDIVIDUAL"
    ? `${client.firstName} ${client.lastName}`
    : client.entityName;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/clients"
        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
      >
        <ChevronLeft size={16} />
        Back to Clients
      </Link>

      {/* Header Profile Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
            {client.type === "INDIVIDUAL" ? <User size={24} /> : <Building size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 leading-snug">
                {clientName}
              </h1>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  client.type === "INDIVIDUAL"
                    ? "bg-sky-50 text-sky-700 border border-sky-100"
                    : "bg-purple-50 text-purple-700 border border-purple-100"
                }`}
              >
                {client.type}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-1">
              Client ID: {client.id}
            </p>
          </div>
        </div>

        {/* Create return button */}
        <Link
          href={`/projects/new?clientId=${client.id}`}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-100 text-center"
        >
          <FolderPlus size={16} />
          Create Return
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column - Profile Details */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
          <h2 className="font-bold text-gray-800 text-sm pb-3 border-b">
            Contact & Profile Info
          </h2>

          <div className="space-y-4 text-xs font-medium">
            <div className="space-y-1">
              <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[10px]">
                Email Address
              </span>
              <div className="flex items-center gap-2 text-gray-700">
                <Mail size={14} className="text-gray-400" />
                <span>{client.email}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[10px]">
                Phone Number
              </span>
              <div className="flex items-center gap-2 text-gray-700">
                <Phone size={14} className="text-gray-400" />
                <span>{client.phone || "—"}</span>
              </div>
            </div>

            {client.type === "INDIVIDUAL" ? (
              <div className="space-y-1">
                <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[10px]">
                  Social Security Number (SSN)
                </span>
                <span className="text-gray-700 block tracking-wider">
                  {client.ssn ? client.ssn : "—"}
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[10px]">
                  Employer Identification Number (EIN)
                </span>
                <span className="text-gray-700 block tracking-wider">
                  {client.ein ? client.ein : "—"}
                </span>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[10px]">
                Billing Address
              </span>
              <span className="text-gray-700 block leading-relaxed">
                {client.address || "—"}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[10px]">
                Created
              </span>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar size={14} className="text-gray-400" />
                <span>{formatDate(client.createdAt)}</span>
              </div>
            </div>
          </div>

          {client.notes && (
            <div className="space-y-2 border-t pt-4">
              <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[10px]">
                Internal Notes
              </span>
              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                {client.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Project Engagements History */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-bold text-gray-800 text-sm">Engagement History</h2>
            <span className="bg-gray-100 text-gray-600 font-semibold text-xs px-2.5 py-0.5 rounded-full">
              {client.projects.length} Total
            </span>
          </div>

          {client.projects.length === 0 ? (
            <div className="bg-white border border-gray-200 border-dashed rounded-2xl p-12 text-center shadow-sm">
              <p className="text-gray-400 text-sm">No tax return history found for this client.</p>
              <Link
                href={`/projects/new?clientId=${client.id}`}
                className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Create first tax return <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {client.projects.map((project) => {
                const statusCol = getStatusColor(project.status);

                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="bg-white border border-gray-200 hover:border-indigo-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-2 md:space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-50 border border-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {getReturnTypeLabel(project.returnType)}
                        </span>
                        <span className="font-bold text-gray-900 text-sm">
                          Tax Year {project.year}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                        <div className="flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: getStageColor(project.stage) }}
                          />
                          <span className="font-semibold text-gray-800 uppercase text-[10px] tracking-wide">
                            {project.stage}
                          </span>
                        </div>
                        {project.dueDate && (
                          <div className="flex items-center gap-1">
                            <span>• Due {formatDate(project.dueDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-between md:justify-end">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${statusCol.bg} ${statusCol.text}`}>
                        {project.status}
                      </span>
                      <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 group-hover:text-indigo-600 transition-colors">
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
