import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    const { stage } = await req.json();

    if (!stage) {
      return new NextResponse("Missing stage field", { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.firmId !== (session.user as any).firmId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: { stage },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        firmId: (session.user as any).firmId as string,
        userId: (session.user as any).id as string,
        userEmail: session.user.email as string,
        action: "project.stage_updated",
        resource: "project",
        resourceId: project.id,
        metadata: JSON.stringify({ oldStage: project.stage, newStage: stage }),
      },
    });

    return NextResponse.json(updatedProject);
  } catch (err) {
    console.error("PATCH project stage error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
