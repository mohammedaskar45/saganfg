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
    const { amount } = await req.json();

    if (!amount) {
      return new NextResponse("Missing amount", { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.firmId !== (session.user as any).firmId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const lastInvoice = await prisma.invoice.findFirst({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    });

    const invoiceNumber = lastInvoice
      ? `INV-${Number(lastInvoice.invoiceNumber.split("-")[1]) + 1}`
      : `INV-1001`;

    const invoice = await prisma.invoice.create({
      data: {
        projectId: id,
        firmId: (session.user as any).firmId as string,
        clientId: project.clientId,
        invoiceNumber,
        amount: Number(amount) * 100, // store in cents
        currency: "USD",
        status: "DRAFT",
        lineItems: JSON.stringify([{ description: `Tax Return preparation - TY ${project.year}`, quantity: 1, rate: Number(amount) * 100 }]),
        dueDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days net
        sentAt: new Date(),
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        firmId: (session.user as any).firmId as string,
        userId: (session.user as any).id as string,
        userEmail: session.user.email as string,
        action: "invoice.created",
        resource: "invoice",
        resourceId: invoice.id,
        metadata: JSON.stringify({ amount: Number(amount) * 100, number: invoiceNumber }),
      },
    });

    return NextResponse.json({
      id: invoice.id,
      amount: invoice.amount,
      status: invoice.status,
      invoiceNumber: invoice.invoiceNumber,
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
    }, { status: 201 });
  } catch (err) {
    console.error("POST create invoice error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
