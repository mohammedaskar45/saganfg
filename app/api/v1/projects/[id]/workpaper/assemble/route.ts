import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id: projectId } = await params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        documents: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!project || project.firmId !== (session.user as any).firmId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (project.documents.length === 0) {
      return new NextResponse("No documents to assemble", { status: 400 });
    }

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();
    let mergedPagesCount = 0;

    for (const doc of project.documents) {
      const fileExtension = path.extname(doc.originalName) || ".pdf";
      const filePath = path.join(
        process.cwd(),
        "public",
        "uploads",
        "projects",
        projectId,
        `${doc.id}${fileExtension}`
      );

      try {
        const fileExists = await fs.stat(filePath).then(() => true).catch(() => false);
        if (!fileExists) {
          continue;
        }

        const pdfBytes = await fs.readFile(filePath);

        // Check if PDF by header bytes
        if (pdfBytes.length > 4 && pdfBytes.toString("utf8", 0, 4) === "%PDF") {
          const srcPdf = await PDFDocument.load(pdfBytes);
          const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
          mergedPagesCount += copiedPages.length;
        } else {
          // Fallback placeholder page for non-PDFs or mock text files
          const page = mergedPdf.addPage([612, 792]);
          mergedPagesCount += 1;
        }
      } catch (err) {
        console.error(`Failed to merge document ${doc.id}:`, err);
      }
    }

    if (mergedPagesCount === 0) {
      mergedPdf.addPage([612, 792]);
    }

    const mergedPdfBytes = await mergedPdf.save();
    
    // Save to public uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads", "projects", projectId);
    await fs.mkdir(uploadDir, { recursive: true });
    const assembledFileName = `assembled_workpapers.pdf`;
    const assembledPath = path.join(uploadDir, assembledFileName);
    await fs.writeFile(assembledPath, mergedPdfBytes);

    // Upsert WorkpaperPack record
    const workpaperPack = await prisma.workpaperPack.upsert({
      where: { projectId },
      update: {
        status: "READY",
        s3Key: `projects/${projectId}/${assembledFileName}`,
        updatedAt: new Date(),
      },
      create: {
        projectId,
        firmId: (session.user as any).firmId as string,
        status: "READY",
        s3Key: `projects/${projectId}/${assembledFileName}`,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        firmId: (session.user as any).firmId as string,
        userId: (session.user as any).id as string,
        userEmail: session.user.email as string,
        action: "workpaper.assembled",
        resource: "workpaper_pack",
        resourceId: workpaperPack.id,
        metadata: JSON.stringify({ pageCount: mergedPagesCount }),
      },
    });

    return NextResponse.json({
      success: true,
      workpaperPack,
      url: `/uploads/projects/${projectId}/${assembledFileName}`,
    });
  } catch (err) {
    console.error("POST assemble error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
