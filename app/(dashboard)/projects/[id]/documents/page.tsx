import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import DocumentsClient from "./DocumentsClient";

export default async function DocumentsStagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  // Fetch project, client, documents
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
    },
  });

  if (!project || project.firmId !== (session.user as any).firmId) {
    notFound();
  }

  const serializedDocuments = project.documents.map((d) => ({
    id: d.id,
    originalName: d.originalName,
    smartName: d.smartName,
    formType: d.formType,
    sizeBytes: d.sizeBytes,
    status: d.status,
    isDuplicate: d.isDuplicate,
    createdAt: d.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Document Library</h2>
        <p className="text-xs text-gray-500 mt-1">
          Upload tax forms, auto-rename using AI Vision OCR, and manage document attachments
        </p>
      </div>

      <DocumentsClient
        projectId={project.id}
        initialDocuments={serializedDocuments}
      />
    </div>
  );
}
