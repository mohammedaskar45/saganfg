import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import IntakeClient from "./IntakeClient";

export default async function IntakeStagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  // Fetch project, client, checklist items, magic links, engagement letters
  const project = await prisma.project.findUnique({
    where: {
      id,
    },
    include: {
      client: true,
      checklistItems: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      magicLinks: {
        orderBy: {
          createdAt: "desc",
        },
      },
      engagementLetters: {
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
    checklistItems: project.checklistItems,
    magicLink: project.magicLinks[0]
      ? {
          token: project.magicLinks[0].token,
          expiresAt: project.magicLinks[0].expiresAt.toISOString(),
          revoked: project.magicLinks[0].revoked,
        }
      : null,
    engagementLetter: project.engagementLetters[0]
      ? {
          name: project.engagementLetters[0].name,
          status: project.engagementLetters[0].status,
          sentAt: project.engagementLetters[0].sentAt ? project.engagementLetters[0].sentAt.toISOString() : null,
          signedAt: project.engagementLetters[0].signedAt ? project.engagementLetters[0].signedAt.toISOString() : null,
        }
      : null,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Intake Hub</h2>
        <p className="text-xs text-gray-500 mt-1">
          Coordinate client onboarding, gather returns documents, and manage checklist items
        </p>
      </div>

      <IntakeClient project={serializedProject} />
    </div>
  );
}
