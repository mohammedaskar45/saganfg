import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ClientsClient from "./ClientsClient";

export default async function ClientsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const clients = await prisma.client.findMany({
    where: {
      firmId: (session.user as any).firmId as string,
    },
    include: {
      projects: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const serializedClients = clients.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    projects: c.projects.map((p) => ({
      id: p.id,
      year: p.year,
      stage: p.stage,
      status: p.status,
    })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage firm clients, tax returns, and contact details
        </p>
      </div>

      <ClientsClient initialClients={serializedClients} />
    </div>
  );
}
