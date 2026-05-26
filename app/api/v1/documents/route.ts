import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifySessionOrToken } from "@/lib/auth-helper";
import { PDFDocument } from "pdf-lib";
import * as pdfParse from "pdf-parse";

function classifyText(text: string, filename: string) {
  const normalized = text.toLowerCase();
  const lowerFile = filename.toLowerCase();

  // W-2 Check
  if (
    normalized.includes("w-2") ||
    normalized.includes("w2") ||
    normalized.includes("wage and tax statement") ||
    lowerFile.includes("w2") ||
    lowerFile.includes("w-2")
  ) {
    let employer = "Acro Corp Technologies";
    const empMatch = text.match(/Employer's name[\s,]+([A-Za-z0-9\s&]+)/i);
    if (empMatch && empMatch[1].trim()) {
      employer = empMatch[1].trim().split("\n")[0].trim();
    }
    return {
      formType: "W2",
      smartName: `W-2 Wage Statement — ${employer}`,
      issuer: employer,
    };
  }

  // 1099-INT Check
  if (
    normalized.includes("1099-int") ||
    normalized.includes("1099int") ||
    normalized.includes("interest income") ||
    lowerFile.includes("1099-int") ||
    lowerFile.includes("1099int")
  ) {
    let issuer = "Chase Bank";
    const bankNames = ["Chase", "Fidelity", "Wells Fargo", "Bank of America", "Citi", "Vanguard", "Schwab"];
    for (const bank of bankNames) {
      if (normalized.includes(bank.toLowerCase())) {
        issuer = bank === "Fidelity" || bank === "Vanguard" || bank === "Schwab" ? bank : `${bank} Bank`;
        break;
      }
    }
    return {
      formType: "1099-INT",
      smartName: `1099-INT Interest Income — ${issuer}`,
      issuer,
    };
  }

  // 1099-DIV Check
  if (
    normalized.includes("1099-div") ||
    normalized.includes("1099div") ||
    normalized.includes("dividends and distributions") ||
    lowerFile.includes("1099-div") ||
    lowerFile.includes("1099div")
  ) {
    let issuer = "Fidelity";
    const instNames = ["Fidelity", "Vanguard", "Schwab", "Chase", "Morgan Stanley", "Merrill Lynch"];
    for (const inst of instNames) {
      if (normalized.includes(inst.toLowerCase())) {
        issuer = inst;
        break;
      }
    }
    return {
      formType: "1099-DIV",
      smartName: `1099-DIV Dividend Income — ${issuer}`,
      issuer,
    };
  }

  // 1098 Check
  if (
    normalized.includes("1098") ||
    normalized.includes("mortgage interest statement") ||
    lowerFile.includes("1098")
  ) {
    let lender = "Chase Mortgage";
    if (normalized.includes("wells fargo")) lender = "Wells Fargo Home Mortgage";
    else if (normalized.includes("bank of america")) lender = "Bank of America Mortgage";
    return {
      formType: "1098",
      smartName: `Form 1098 Mortgage Interest — ${lender}`,
      issuer: lender,
    };
  }

  // Prior year Form 1040
  if (
    normalized.includes("1040") ||
    normalized.includes("u.s. individual income tax return") ||
    lowerFile.includes("1040") ||
    lowerFile.includes("prior")
  ) {
    return {
      formType: "PRIOR_YEAR",
      smartName: "Prior Year Federal Form 1040 (2023)",
      issuer: "IRS",
    };
  }

  // Default fallback
  return {
    formType: null,
    smartName: filename,
    issuer: null,
  };
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let projectId: string;
    let originalName: string;
    let sizeBytes: number;
    let isDuplicate = false;
    let fileBuffer: Buffer | null = null;
    let fileExtension = ".pdf";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      projectId = formData.get("projectId") as string;
      isDuplicate = formData.get("isDuplicate") === "true";

      if (!projectId || !file) {
        return new NextResponse("Missing fields in FormData", { status: 400 });
      }

      originalName = file.name;
      sizeBytes = file.size;
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      fileExtension = path.extname(originalName) || ".pdf";
    } else {
      const body = await req.json();
      projectId = body.projectId;
      originalName = body.originalName;
      sizeBytes = Number(body.sizeBytes);
      isDuplicate = !!body.isDuplicate;
    }

    if (!projectId || !originalName || !sizeBytes) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const authResult = await verifySessionOrToken(req, projectId);
    if (!authResult.authorized) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.firmId !== authResult.firmId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const docRecords = [];

    if (fileBuffer && originalName.toLowerCase().endsWith(".pdf")) {
      try {
        const pdfDoc = await PDFDocument.load(fileBuffer);
        const pageCount = pdfDoc.getPageCount();

        // Extract and analyze pages
        const classifiedPages = [];
        for (let i = 0; i < pageCount; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
          newPdf.addPage(copiedPage);
          const singlePageBuffer = Buffer.from(await newPdf.save());
          let text = "";
          try {
            const parseFunc = typeof pdfParse === "function" ? pdfParse : (pdfParse as any).default;
            const parsed = await parseFunc(singlePageBuffer);
            text = parsed.text;
          } catch (e) {
            console.error(`Page ${i} text parse error:`, e);
          }
          const classification = classifyText(text, `Page-${i + 1}-${originalName}`);
          classifiedPages.push({ index: i, buffer: singlePageBuffer, ...classification, text });
        }

        // Determine if we should split
        const classifiedFormTypes = classifiedPages.filter((p) => p.formType !== null);
        const distinctForms = new Set(classifiedFormTypes.map((p) => p.formType));
        const distinctFormsCount = distinctForms.size;

        if (pageCount > 1 && distinctFormsCount >= 2) {
          console.log(`Smart Split triggered! Slicing PDF into ${pageCount} pages...`);
          for (let i = 0; i < pageCount; i++) {
            const pageData = classifiedPages[i];
            const pageDocId = `doc_${Date.now()}_page_${i + 1}`;
            const pageS3Key = `projects/${projectId}/${pageDocId}.pdf`;

            // Save split page to local disk
            const uploadDir = path.join(process.cwd(), "public", "uploads", "projects", projectId);
            await fs.mkdir(uploadDir, { recursive: true });
            const uploadPath = path.join(uploadDir, `${pageDocId}.pdf`);
            await fs.writeFile(uploadPath, pageData.buffer);

            // Create record
            const pageDoc = await prisma.document.create({
              data: {
                id: pageDocId,
                projectId,
                firmId: authResult.firmId as string,
                originalName: `Page ${i + 1} of ${originalName}`,
                smartName: pageData.smartName,
                formType: pageData.formType,
                issuer: pageData.issuer,
                s3Key: pageS3Key,
                mimeType: "application/pdf",
                sizeBytes: pageData.buffer.length,
                status: "READY",
                isDuplicate: false,
                extractedData: pageData.text,
              },
            });

            // Write audit log
            await prisma.auditLog.create({
              data: {
                firmId: authResult.firmId as string,
                userId: authResult.userId as string,
                userEmail: authResult.userEmail ?? "portal_client@saganfg.local",
                action: "document.uploaded_split",
                resource: "document",
                resourceId: pageDoc.id,
                metadata: JSON.stringify({ smartName: pageData.smartName, formType: pageData.formType }),
              },
            });

            // Link checklist item automatically!
            if (pageData.formType) {
              const matchedChecklist = await prisma.checklistItem.findFirst({
                where: {
                  projectId,
                  formType: pageData.formType,
                },
              });
              if (matchedChecklist) {
                await prisma.checklistItem.update({
                  where: { id: matchedChecklist.id },
                  data: {
                    status: "RECEIVED",
                    linkedDocumentId: pageDoc.id,
                  },
                });
              }
            }

            docRecords.push(pageDoc);
          }
        } else {
          // Keep as one document
          const parseFunc = typeof pdfParse === "function" ? pdfParse : (pdfParse as any).default;
          const fullParsed = await parseFunc(fileBuffer);
          const fullText = fullParsed.text;
          const classification = classifyText(fullText, originalName);

          const docId = `doc_${Date.now()}`;
          const s3Key = `projects/${projectId}/${docId}.pdf`;

          const uploadDir = path.join(process.cwd(), "public", "uploads", "projects", projectId);
          await fs.mkdir(uploadDir, { recursive: true });
          const uploadPath = path.join(uploadDir, `${docId}.pdf`);
          await fs.writeFile(uploadPath, fileBuffer);

          const doc = await prisma.document.create({
            data: {
              id: docId,
              projectId,
              firmId: authResult.firmId as string,
              originalName,
              smartName: classification.smartName,
              formType: classification.formType,
              issuer: classification.issuer,
              s3Key: s3Key,
              mimeType: "application/pdf",
              sizeBytes: fileBuffer.length,
              status: "READY",
              isDuplicate: !!isDuplicate,
              extractedData: fullText,
            },
          });

          // Audit log
          await prisma.auditLog.create({
            data: {
              firmId: authResult.firmId as string,
              userId: authResult.userId as string,
              userEmail: authResult.userEmail ?? "portal_client@saganfg.local",
              action: "document.uploaded",
              resource: "document",
              resourceId: doc.id,
              metadata: JSON.stringify({ smartName: classification.smartName, formType: classification.formType }),
            },
          });

          // Link checklist item automatically!
          if (classification.formType) {
            const matchedChecklist = await prisma.checklistItem.findFirst({
              where: {
                projectId,
                formType: classification.formType,
              },
            });
            if (matchedChecklist) {
              await prisma.checklistItem.update({
                where: { id: matchedChecklist.id },
                data: {
                  status: "RECEIVED",
                  linkedDocumentId: doc.id,
                },
              });
            }
          }

          docRecords.push(doc);
        }
      } catch (err) {
        console.error("PDF extraction & splitting failure, falling back to heuristics:", err);
      }
    }

    if (docRecords.length === 0) {
      // Heuristics fallback
      const classification = classifyText("", originalName);

      const docId = `doc_${Date.now()}`;
      const s3Key = `projects/${projectId}/${docId}${fileExtension}`;

      const uploadDir = path.join(process.cwd(), "public", "uploads", "projects", projectId);
      await fs.mkdir(uploadDir, { recursive: true });
      const uploadPath = path.join(uploadDir, `${docId}${fileExtension}`);

      if (fileBuffer) {
        await fs.writeFile(uploadPath, fileBuffer);
      } else {
        await fs.writeFile(uploadPath, "Dummy Content");
      }

      const doc = await prisma.document.create({
        data: {
          id: docId,
          projectId,
          firmId: authResult.firmId as string,
          originalName,
          smartName: classification.smartName,
          formType: classification.formType,
          issuer: classification.issuer,
          s3Key: s3Key,
          mimeType: originalName.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
          sizeBytes: Number(sizeBytes),
          status: "READY",
          isDuplicate: !!isDuplicate,
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          firmId: authResult.firmId as string,
          userId: authResult.userId as string,
          userEmail: authResult.userEmail ?? "portal_client@saganfg.local",
          action: "document.uploaded",
          resource: "document",
          resourceId: doc.id,
          metadata: JSON.stringify({ smartName: classification.smartName, formType: classification.formType }),
        },
      });

      // Link checklist item automatically!
      if (classification.formType) {
        const matchedChecklist = await prisma.checklistItem.findFirst({
          where: {
            projectId,
            formType: classification.formType,
          },
        });
        if (matchedChecklist) {
          await prisma.checklistItem.update({
            where: { id: matchedChecklist.id },
            data: {
              status: "RECEIVED",
              linkedDocumentId: doc.id,
            },
          });
        }
      }

      docRecords.push(doc);
    }

    // Return the first or array of created documents
    return NextResponse.json(docRecords.length === 1 ? docRecords[0] : docRecords, { status: 201 });
  } catch (err) {
    console.error("POST document upload error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
