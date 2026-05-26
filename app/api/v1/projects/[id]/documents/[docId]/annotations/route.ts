import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id: projectId, docId } = await params;

    // Verify document exists and belongs to project
    const doc = await prisma.document.findFirst({
      where: {
        id: docId,
        projectId,
      },
    });

    if (!doc || doc.firmId !== (session.user as any).firmId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const annotations = await prisma.annotation.findMany({
      where: { documentId: docId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(annotations);
  } catch (err) {
    console.error("GET annotations error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id: projectId, docId } = await params;
    const body = await req.json();
    const { id: annotationId, type, pageNumber, x, y, width, height, content, color } = body;

    if (!type || pageNumber === undefined || x === undefined || y === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const doc = await prisma.document.findFirst({
      where: {
        id: docId,
        projectId,
      },
    });

    if (!doc || doc.firmId !== (session.user as any).firmId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    let annotation;
    if (annotationId) {
      // Upsert/Update
      annotation = await prisma.annotation.upsert({
        where: { id: annotationId },
        update: {
          type,
          pageNumber: Number(pageNumber),
          x: Number(x),
          y: Number(y),
          width: width !== undefined ? Number(width) : null,
          height: height !== undefined ? Number(height) : null,
          content: content ?? null,
          color: color ?? null,
        },
        create: {
          id: annotationId,
          documentId: docId,
          userId: (session.user as any).id as string,
          type,
          pageNumber: Number(pageNumber),
          x: Number(x),
          y: Number(y),
          width: width !== undefined ? Number(width) : null,
          height: height !== undefined ? Number(height) : null,
          content: content ?? null,
          color: color ?? null,
        },
      });
    } else {
      // Create new
      annotation = await prisma.annotation.create({
        data: {
          documentId: docId,
          userId: (session.user as any).id as string,
          type,
          pageNumber: Number(pageNumber),
          x: Number(x),
          y: Number(y),
          width: width !== undefined ? Number(width) : null,
          height: height !== undefined ? Number(height) : null,
          content: content ?? null,
          color: color ?? null,
        },
      });
    }

    return NextResponse.json(annotation);
  } catch (err) {
    console.error("POST annotation error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id: projectId, docId } = await params;
    const { searchParams } = new URL(req.url);
    const annotationId = searchParams.get("id");

    if (!annotationId) {
      return new NextResponse("Missing annotation ID", { status: 400 });
    }

    const doc = await prisma.document.findFirst({
      where: {
        id: docId,
        projectId,
      },
    });

    if (!doc || doc.firmId !== (session.user as any).firmId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    await prisma.annotation.delete({
      where: { id: annotationId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE annotation error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
