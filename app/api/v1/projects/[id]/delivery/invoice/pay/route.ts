import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifySessionOrToken } from "@/lib/auth-helper";
import Stripe from "stripe";

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

    const { invId } = await req.json();

    if (!invId) {
      return new NextResponse("Missing invId", { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.firmId !== authResult.firmId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Stripe checkout integration
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const isStripeConfigured = stripeKey && stripeKey !== "your-stripe-key";

    if (isStripeConfigured) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invId },
      });

      if (!invoice) {
        return new NextResponse("Invoice Not Found", { status: 404 });
      }

      const token = req.headers.get("x-portal-token");
      const origin = req.headers.get("origin") || "http://localhost:3000";
      const redirectPath = token ? `portal/${token}` : `projects/${id}`;

      const stripe = new Stripe(stripeKey!);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Tax Preparation Services — TY ${project.year}`,
                description: `Invoice ${invoice.invoiceNumber}`,
              },
              unit_amount: invoice.amount, // stored in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/${redirectPath}?payment=success&invId=${invId}`,
        cancel_url: `${origin}/${redirectPath}?payment=cancel`,
        metadata: {
          projectId: id,
          invoiceId: invId,
        },
      });

      return NextResponse.json({ url: session.url });
    }

    // Graceful fallback: simulated instant pay
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invId },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        firmId: authResult.firmId as string,
        userId: authResult.userId as string,
        userEmail: authResult.userEmail ?? "portal_client@saganfg.local",
        action: "invoice.paid",
        resource: "invoice",
        resourceId: invId,
        metadata: JSON.stringify({ status: "PAID", simulated: true }),
      },
    });

    return NextResponse.json(updatedInvoice);
  } catch (err) {
    console.error("POST pay invoice error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
