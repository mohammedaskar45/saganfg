import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        firmId: (session.user as any).firmId as string,
      },
      include: {
        client: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(projects);
  } catch (err) {
    console.error("GET projects error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const {
      clientId,
      returnType,
      year,
      assigneeId,
      reviewerId,
      dueDate,
      notes,
    } = await req.json();

    if (!clientId || !returnType || !year || !assigneeId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        firmId: (session.user as any).firmId as string,
        clientId,
        returnType,
        year,
        stage: "INTAKE",
        status: "ACTIVE",
        assigneeId,
        reviewerId,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
      },
    });

    // Populate default checklist items based on return type
    let defaultChecklists: { description: string; formType: string }[] = [];
    if (returnType === "F1040") {
      defaultChecklists = [
        { description: "W-2 wage statements from employers", formType: "W2" },
        { description: "1099-INT bank interest statements", formType: "1099-INT" },
        { description: "1099-DIV brokerage dividend statements", formType: "1099-DIV" },
        { description: "1099-B brokerage stock transaction logs", formType: "1099-B" },
        { description: "Form 1098 Mortgage Interest statement", formType: "1098" },
      ];
    } else if (returnType === "F1065" || returnType === "F1120S") {
      defaultChecklists = [
        { description: "Year-end Balance Sheet", formType: "BALANCE_SHEET" },
        { description: "Year-end Profit & Loss statement", formType: "PROFIT_LOSS" },
        { description: "December Bank Statements for all business accounts", formType: "BANK_STATEMENT" },
        { description: "Form 1099-K merchant receipts logs", formType: "1099-K" },
      ];
    } else {
      defaultChecklists = [
        { description: "Prior year tax returns", formType: "PRIOR_YEAR" },
        { description: "Financial statement summaries", formType: "FINANCIALS" },
      ];
    }

    for (let i = 0; i < defaultChecklists.length; i++) {
      await prisma.checklistItem.create({
        data: {
          projectId: project.id,
          firmId: (session.user as any).firmId as string,
          description: defaultChecklists[i].description,
          formType: defaultChecklists[i].formType,
          status: "MISSING",
          sortOrder: i,
        },
      });
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        firmId: (session.user as any).firmId as string,
        userId: (session.user as any).id as string,
        userEmail: session.user.email as string,
        action: "project.created",
        resource: "project",
        resourceId: project.id,
        metadata: JSON.stringify({ returnType, year }),
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    console.error("POST project error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
