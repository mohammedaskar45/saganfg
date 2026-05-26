import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ProjectsClient from "./ProjectsClient";

export default async function ProjectsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const firmId = (session.user as any).firmId as string;

  // Fetch initial project data scoped by active firm
  const projects = await prisma.project.findMany({
    where: {
      firmId,
    },
    include: {
      client: true,
      tasks: true,
      checklistItems: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Fetch all staff members in the firm for assignees dropdown list
  const firmUsers = await prisma.firmUser.findMany({
    where: {
      firmId,
      isActive: true,
    },
    include: {
      user: true,
    },
  });

  const staff = firmUsers.map((fu) => ({
    id: fu.user.id,
    name: fu.user.name,
    email: fu.user.email,
    role: fu.role,
  }));

  // Serialize dates to prevent SSR hydration warnings with Dates
  const serializedProjects = projects.map((p) => ({
    ...p,
    dueDate: p.dueDate ? p.dueDate.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects Directory</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage, filter, and track all client returns across the four workflow stages
          </p>
        </div>
      </div>

      <ProjectsClient initialProjects={serializedProjects} staff={staff} />
    </div>
  );
}
