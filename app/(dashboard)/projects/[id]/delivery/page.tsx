import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import DeliveryClient from "./DeliveryClient";

export default async function DeliveryStagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  // Fetch project, client, invoices, signature requests, K-1s
  const project = await prisma.project.findUnique({
    where: {
      id,
    },
    include: {
      client: true,
      invoices: {
        orderBy: {
          createdAt: "desc",
        },
      },
      signatureRequests: {
        orderBy: {
          createdAt: "desc",
        },
      },
      k1Distributions: {
        orderBy: {
          createdAt: "desc",
        },
      },
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
      email: project.client.email,
    },
    invoices: project.invoices.map((i) => ({
      id: i.id,
      amount: i.amount,
      status: i.status,
      invoiceNumber: i.invoiceNumber,
      dueDate: i.dueDate ? i.dueDate.toISOString() : null,
    })),
    signatureRequests: project.signatureRequests.map((s) => ({
      id: s.id,
      signerName: s.signerName,
      signerEmail: s.signerEmail,
      status: s.status,
      signedAt: s.signedAt ? s.signedAt.toISOString() : null,
    })),
    k1Distributions: project.k1Distributions.map((k) => ({
      id: k.id,
      recipientName: k.recipientName,
      recipientEmail: k.recipientEmail,
      status: k.status,
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Delivery & Closeout Hub</h2>
        <p className="text-xs text-gray-500 mt-1">
          Generate firm invoice bills, request IRS Form 8879 signatures, and distribute K-1 packages
        </p>
      </div>

      <DeliveryClient project={serializedProject} />
    </div>
  );
}
