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
    const { recipientName, recipientEmail } = await req.json();

    if (!recipientName || !recipientEmail) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.firmId !== (session.user as any).firmId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const k1 = await prisma.k1Distribution.create({
      data: {
        projectId: id,
        firmId: (session.user as any).firmId as string,
        recipientName,
        recipientEmail,
        s3Key: `form-k1-${project.id}-${recipientName.replace(/\s+/g, "_")}.pdf`,
        status: "DISTRIBUTED",
        sentAt: new Date(),
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        firmId: (session.user as any).firmId as string,
        userId: (session.user as any).id as string,
        userEmail: session.user.email as string,
        action: "k1.distributed",
        resource: "k1_distribution",
        resourceId: k1.id,
        metadata: JSON.stringify({ recipientName, recipientEmail }),
      },
    });

    return NextResponse.json(k1, { status: 201 });
  } catch (err) {
    console.error("POST distribute K-1 error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
