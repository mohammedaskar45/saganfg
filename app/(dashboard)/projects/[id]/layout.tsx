import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ProjectHeader from "./ProjectHeader";
import ProjectTabs from "./ProjectTabs";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  // Fetch project details
  const project = await prisma.project.findUnique({
    where: {
      id,
    },
    include: {
      client: true,
    },
  });

  if (!project || project.firmId !== (session.user as any).firmId) {
    notFound();
  }

  // Fetch assignee details if exists
  let assigneeName = "Unassigned";
  if (project.assigneeId) {
    const assignee = await prisma.user.findUnique({
      where: { id: project.assigneeId },
    });
    if (assignee) assigneeName = assignee.name;
  }

  const clientName = project.client.type === "INDIVIDUAL"
    ? `${project.client.firstName} ${project.client.lastName}`
    : project.client.entityName;

  return (
    <div className="space-y-6">
      {/* Project Header Component (with stage track & quick advance action) */}
      <ProjectHeader
        project={{
          id: project.id,
          year: project.year,
          returnType: project.returnType,
          stage: project.stage,
          status: project.status,
          dueDate: project.dueDate ? project.dueDate.toISOString() : null,
          assigneeName,
        }}
        clientName={clientName}
      />

      {/* Tabs navigation */}
      <ProjectTabs projectId={project.id} currentStage={project.stage} />

      {/* Actual Stage Sub-view Page */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm min-h-[400px]">
        {children}
      </div>
    </div>
  );
}
