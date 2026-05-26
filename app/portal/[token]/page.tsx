import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PortalClient from "./PortalClient";

export default async function PortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const magicLink = await prisma.magicLink.findUnique({
    where: { token },
    include: {
      project: {
        include: {
          client: true,
          checklistItems: {
            orderBy: { sortOrder: "asc" },
          },
          invoices: {
            orderBy: { createdAt: "desc" },
          },
          signatureRequests: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!magicLink || magicLink.revoked || new Date() > magicLink.expiresAt) {
    notFound();
  }

  const project = magicLink.project;
  const clientName = (project.client.type === "INDIVIDUAL"
    ? `${project.client.firstName ?? ""} ${project.client.lastName ?? ""}`.trim()
    : project.client.entityName) || "Unnamed Client";

  const serializedProject = {
    id: project.id,
    year: project.year,
    returnType: project.returnType,
    client: {
      name: clientName,
      email: project.client.email,
    },
    checklistItems: project.checklistItems,
    invoices: project.invoices.map((i) => ({
      id: i.id,
      amount: i.amount,
      status: i.status,
      invoiceNumber: i.invoiceNumber,
    })),
    signatureRequests: project.signatureRequests.map((s) => ({
      id: s.id,
      signerName: s.signerName,
      signerEmail: s.signerEmail,
      status: s.status,
    })),
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 leading-snug">
          Tax Prep Requirements Checklist
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Review documents requested by your preparer, upload secure files, sign disclosures, and settle outstanding balances
        </p>
      </div>

      <PortalClient project={serializedProject} portalToken={token} />
    </div>
  );
}
