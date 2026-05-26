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

    // Find the latest engagement letter
    const latestLetter = await prisma.engagementLetter.findFirst({
      where: { projectId: id, status: "SENT" },
      orderBy: { createdAt: "desc" },
    });

    if (!latestLetter) {
      return new NextResponse("No sent letter found to sign", { status: 400 });
    }

    const updatedLetter = await prisma.engagementLetter.update({
      where: { id: latestLetter.id },
      data: {
        status: "SIGNED",
        signedAt: new Date(),
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        firmId: (session.user as any).firmId as string,
        userId: (session.user as any).id as string,
        userEmail: session.user.email as string,
        action: "engagement_letter.signed",
        resource: "engagement_letter",
        resourceId: latestLetter.id,
        metadata: JSON.stringify({ signedBy: "Client" }),
      },
    });

    return NextResponse.json(updatedLetter);
  } catch (err) {
    console.error("POST sign engagement letter error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
