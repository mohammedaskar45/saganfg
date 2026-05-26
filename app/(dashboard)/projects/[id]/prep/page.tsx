import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, UserCheck, Milestone, Check, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function PrepStagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  // Fetch project, client, assignee, reviewer, tasks
  const project = await prisma.project.findUnique({
    where: {
      id,
    },
    include: {
      client: true,
      tasks: {
        where: {
          stage: "PREP",
        },
      },
    },
  });

  if (!project || project.firmId !== (session.user as any).firmId) {
    notFound();
  }

  // Get assignee names
  let assigneeName = "Unassigned";
  if (project.assigneeId) {
    const user = await prisma.user.findUnique({ where: { id: project.assigneeId } });
    if (user) assigneeName = user.name;
  }

  let reviewerName = "Unassigned";
  if (project.reviewerId) {
    const user = await prisma.user.findUnique({ where: { id: project.reviewerId } });
    if (user) reviewerName = user.name;
  }

  // Default checklist for prep
  const defaultPrepTasks = [
    { title: "Review source documents tied in workpapers", desc: "Ensure all tickmarks are correct and tied." },
    { title: "Input client info and W-2 details to tax software", desc: "Cross-reference wages and tax withheld." },
    { title: "Deduct eligible business expenses (Sch C)", desc: "Schedule C deductions audit check." },
    { title: "Calculate estimated tax payments / Safe Harbor", desc: "Prevent underpayment penalties." },
    { title: "Run federal and state diagnostic checks", desc: "Confirm zero software flags." },
  ];

  const clientName = (project.client.type === "INDIVIDUAL"
    ? `${project.client.firstName ?? ""} ${project.client.lastName ?? ""}`.trim()
    : project.client.entityName) || "Unnamed Client";

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Preparation & Routing Hub</h2>
        <p className="text-xs text-gray-500 mt-1">
          Perform return prep input, monitor diagnostic checks, and route between preparer and reviewer
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Routing flow & Diagnostics checklist */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prep Checklist */}
          <div className="border border-gray-200 rounded-2xl p-6 space-y-4 bg-white">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <ShieldCheck className="text-indigo-600" size={18} />
              Preparation Quality Checklists
            </h3>
            <p className="text-xs text-gray-400">
              Complete these validation checklist tasks inside your tax software prior to routing for review.
            </p>

            <div className="space-y-3 pt-2">
              {defaultPrepTasks.map((t, idx) => (
                <div key={idx} className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl flex items-start gap-3">
                  <div className="w-5 h-5 rounded bg-green-100 border border-green-200 text-green-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={12} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">{t.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Routing controls & Team cards */}
        <div className="space-y-6">
          {/* Team Routing card */}
          <div className="border border-gray-200 rounded-2xl p-6 bg-white space-y-5">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <UserCheck className="text-indigo-600" size={18} />
              Tax Return Routing
            </h3>

            <div className="space-y-4 text-xs font-medium">
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">
                    Preparer Assigned
                  </span>
                  <span className="text-gray-800 font-bold block mt-0.5">{assigneeName}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  {assigneeName.charAt(0)}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">
                    Reviewer Assigned
                  </span>
                  <span className="text-gray-800 font-bold block mt-0.5">{reviewerName}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                  {reviewerName.charAt(0)}
                </div>
              </div>
            </div>

            {/* Preparation status indicator */}
            <div className="flex items-center gap-2.5 p-3.5 bg-indigo-50/50 border border-indigo-100/50 text-indigo-700 rounded-xl text-xs font-semibold">
              <Clock size={16} className="animate-pulse" />
              <span>Tax preparation is currently in-progress</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
