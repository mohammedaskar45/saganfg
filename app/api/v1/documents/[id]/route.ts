import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    const doc = await prisma.document.findUnique({
      where: { id },
    });

    if (!doc || doc.firmId !== (session.user as any).firmId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    await prisma.document.delete({
      where: { id },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        firmId: (session.user as any).firmId as string,
        userId: (session.user as any).id as string,
        userEmail: session.user.email as string,
        action: "document.deleted",
        resource: "document",
        resourceId: id,
        metadata: JSON.stringify({ name: doc.smartName || doc.originalName }),
      },
    });

    return new NextResponse("Success", { status: 200 });
  } catch (err) {
    console.error("DELETE document error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
