import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.firmId !== (session.user as any).firmId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Upsert WorkpaperPack record to SQLite
    const pack = await prisma.workpaperPack.upsert({
      where: { projectId: id },
      update: {
        status: "UNDER_REVIEW",
        submittedAt: new Date(),
      },
      create: {
        projectId: id,
        firmId: (session.user as any).firmId as string,
        status: "UNDER_REVIEW",
        reviewLevel: 1,
        submittedAt: new Date(),
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        firmId: (session.user as any).firmId as string,
        userId: (session.user as any).id as string,
        userEmail: session.user.email as string,
        action: "workpaper.submitted",
        resource: "workpaper_pack",
        resourceId: pack.id,
        metadata: JSON.stringify({ status: "UNDER_REVIEW" }),
      },
    });

    return NextResponse.json(pack);
  } catch (err) {
    console.error("POST submit workpapers error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
