import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Briefcase } from "lucide-react";

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Find project linked to magic link token
  const magicLink = await prisma.magicLink.findUnique({
    where: { token },
    include: {
      project: {
        include: {
          firm: true,
          client: true,
        },
      },
    },
  });

  if (!magicLink || magicLink.revoked || new Date() > magicLink.expiresAt) {
    notFound();
  }

  const project = magicLink.project;
  const clientName = project.client.type === "INDIVIDUAL"
    ? `${project.client.firstName} ${project.client.lastName}`
    : project.client.entityName;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Branded Header */}
      <header className="h-16 bg-[#0D1B4B] text-white border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: project.firm.primaryColor || "#4F46E5" }}
          >
            <Briefcase size={16} color="white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">{project.firm.name}</p>
            <p className="text-blue-300 text-[10px] mt-0.5">Secure Client Document Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-blue-200">Portal Session:</span>
          <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
            {clientName}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:py-10">
        {children}
      </main>
    </div>
  );
}
