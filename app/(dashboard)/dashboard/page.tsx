import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch initial project data scoped by active firm
  const projects = await prisma.project.findMany({
    where: {
      firmId: (session.user as any).firmId as string,
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
    email: fu.user.email,
  }));

  return (
    <div className="space-y-6">
      {/* Title / Intro */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Firm Workflow</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time status of all active tax engagements
          </p>
        </div>
      </div>

      {/* Main Interactive Client-side Dashboard */}
      <DashboardClient initialProjects={projects} staff={staff} />
    </div>
  );
}
