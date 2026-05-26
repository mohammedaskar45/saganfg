import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import WorkpaperClient from "./WorkpaperClient";

export default async function WorkpaperStagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  // Fetch project, client, documents, workpaper pack status
  const project = await prisma.project.findUnique({
    where: {
      id,
    },
    include: {
      client: true,
      documents: {
        orderBy: {
          createdAt: "desc",
        },
      },
      workpaperPack: true,
    },
  });

  if (!project || project.firmId !== (session.user as any).firmId) {
    notFound();
  }

  const clientName = (project.client.type === "INDIVIDUAL"
    ? `${project.client.firstName ?? ""} ${project.client.lastName ?? ""}`.trim()
    : project.client.entityName) || "Unnamed Client";

  const serializedProject = {
    id: project.id,
    year: project.year,
    returnType: project.returnType,
    client: {
      name: clientName,
    },
    documents: project.documents.map((d) => ({
      id: d.id,
      originalName: d.smartName || d.originalName,
      formType: d.formType,
      sizeBytes: d.sizeBytes,
      status: d.status,
    })),
    workpaperPack: project.workpaperPack
      ? {
          status: project.workpaperPack.status,
          reviewLevel: project.workpaperPack.reviewLevel,
          reviewNotes: project.workpaperPack.reviewNotes,
        }
      : null,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Workpapers tie-and-tick review</h2>
        <p className="text-xs text-gray-500 mt-1">
          Compile source documents, review, annotate with audit marks, and sign off on workpaper pack
        </p>
      </div>

      <WorkpaperClient project={serializedProject} />
    </div>
  );
}
