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
    const { signerName, signerEmail } = await req.json();

    if (!signerName || !signerEmail) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.firmId !== (session.user as any).firmId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const sig = await prisma.signatureRequest.create({
      data: {
        projectId: id,
        firmId: (session.user as any).firmId as string,
        type: "FORM_8879",
        status: "PENDING",
        signerName,
        signerEmail,
        documentKey: `form-8879-prefill-${project.id}.pdf`,
        sentAt: new Date(),
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        firmId: (session.user as any).firmId as string,
        userId: (session.user as any).id as string,
        userEmail: session.user.email as string,
        action: "esign.requested",
        resource: "signature_request",
        resourceId: sig.id,
        metadata: JSON.stringify({ signerName, signerEmail }),
      },
    });

    return NextResponse.json(sig, { status: 201 });
  } catch (err) {
    console.error("POST delivery esign error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
