import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import DocumentsSearchClient from "./DocumentsSearchClient";

export default async function DocumentsSearchPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const firmId = (session.user as any).firmId as string;

  // Query all documents uploaded across all projects for this firm
  const documents = await prisma.document.findMany({
    where: {
      firmId,
    },
    include: {
      project: {
        include: {
          client: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Query all clients & projects for upload associations
  const clients = await prisma.client.findMany({
    where: {
      firmId,
    },
    include: {
      projects: {
        select: {
          id: true,
          year: true,
          returnType: true,
          stage: true,
        },
      },
    },
    orderBy: {
      lastName: "asc",
    },
  });

  // Serialize the data safely for client rendering
  const serializedDocs = documents.map((doc) => ({
    ...doc,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }));

  const serializedClients = clients.map((c) => ({
    id: c.id,
    name: c.type === "INDIVIDUAL" ? `${c.firstName || ""} ${c.lastName || ""}`.trim() : c.entityName || "Unnamed Client",
    type: c.type,
    projects: c.projects.map((p) => ({
      id: p.id,
      year: p.year,
      returnType: p.returnType,
      stage: p.stage,
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Processing Hub</h1>
          <p className="text-sm text-gray-500 mt-1">
            Global search, bulk upload, smart AI renaming, automatic PDF conversion, and extraction details
          </p>
        </div>
      </div>

      <DocumentsSearchClient
        initialDocuments={serializedDocs}
        clients={serializedClients}
        firmId={firmId}
      />
    </div>
  );
}
