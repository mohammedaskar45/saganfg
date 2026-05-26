import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import NewProjectClient from "./NewProjectClient";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { clientId } = await searchParams;

  // Fetch all clients in the firm for dropdown
  const clients = await prisma.client.findMany({
    where: {
      firmId: (session.user as any).firmId as string,
    },
    orderBy: {
      lastName: "asc",
    },
  });

  const serializedClients = clients.map((c) => ({
    id: c.id,
    name: c.type === "INDIVIDUAL" ? `${c.firstName} ${c.lastName}` : c.entityName,
  }));

  // Fetch all staff members in the firm for assignee dropdown
  const firmUsers = await prisma.firmUser.findMany({
    where: {
      firmId: (session.user as any).firmId as string,
      isActive: true,
    },
    include: {
      user: true,
    },
  });

  const staff = firmUsers.map((fu) => ({
    id: fu.user.id,
    name: fu.user.name,
    role: fu.role,
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <NewProjectClient
        clients={serializedClients}
        staff={staff}
        preselectedClientId={clientId}
        currentUserId={session.user.id || ""}
      />
    </div>
  );
}
