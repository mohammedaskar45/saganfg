import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifySessionOrToken } from "@/lib/auth-helper";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await verifySessionOrToken(req, id);
    if (!authResult.authorized) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { description } = await req.json();

    if (!description) {
      return new NextResponse("Missing description field", { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.firmId !== authResult.firmId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Get last sort order
    const lastItem = await prisma.checklistItem.findFirst({
      where: { projectId: id },
      orderBy: { sortOrder: "desc" },
    });

    const sortOrder = lastItem ? lastItem.sortOrder + 1 : 0;

    const newItem = await prisma.checklistItem.create({
      data: {
        projectId: id,
        firmId: authResult.firmId as string,
        description,
        status: "MISSING",
        isCustom: true,
        sortOrder,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        firmId: authResult.firmId as string,
        userId: authResult.userId as string,
        userEmail: authResult.userEmail ?? "portal_client@saganfg.local",
        action: "checklist.item_created",
        resource: "checklist_item",
        resourceId: newItem.id,
        metadata: JSON.stringify({ description }),
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (err) {
    console.error("POST checklist item error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await verifySessionOrToken(req, id);
    if (!authResult.authorized) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { itemId, status } = await req.json();

    if (!itemId || !status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.firmId !== authResult.firmId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const updatedItem = await prisma.checklistItem.update({
      where: { id: itemId },
      data: { status },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        firmId: authResult.firmId as string,
        userId: authResult.userId as string,
        userEmail: authResult.userEmail ?? "portal_client@saganfg.local",
        action: "checklist.item_status_updated",
        resource: "checklist_item",
        resourceId: itemId,
        metadata: JSON.stringify({ status }),
      },
    });

    return NextResponse.json(updatedItem);
  } catch (err) {
    console.error("PATCH checklist item error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
