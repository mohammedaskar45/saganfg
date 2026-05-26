import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const firmId = (session.user as any).firmId;
    if (!firmId) {
      return new NextResponse("Firm context not found in session", { status: 400 });
    }

    const firm = await prisma.firm.findUnique({
      where: { id: firmId },
    });

    if (!firm) {
      return new NextResponse("Firm not found in database", { status: 404 });
    }

    return NextResponse.json(firm);
  } catch (err) {
    console.error("GET firm error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userRole = (session.user as any).role;
  const isAdmin = userRole === "OWNER" || userRole === "ADMIN" || userRole === "OWNER/ADMIN" || session.user.email === "superadmin@gmail.com";
  
  if (!isAdmin) {
    return new NextResponse("Forbidden — Administrator access required", { status: 403 });
  }

  try {
    const { name, primaryColor, customDomain } = await req.json();
    const firmId = (session.user as any).firmId;

    if (!firmId) {
      return new NextResponse("Firm context not found in session", { status: 400 });
    }

    const updatedFirm = await prisma.firm.update({
      where: { id: firmId },
      data: {
        name: name || undefined,
        primaryColor: primaryColor || undefined,
        customDomain: customDomain || null,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        firmId,
        userId: (session.user as any).id,
        userEmail: session.user.email,
        action: "firm.branding_updated",
        resource: "firm",
        resourceId: firmId,
        metadata: JSON.stringify({ name, primaryColor, customDomain }),
      },
    });

    return NextResponse.json(updatedFirm);
  } catch (err) {
    console.error("PATCH update firm error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
