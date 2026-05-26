import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (
    !stripeKey ||
    !webhookSecret ||
    stripeKey === "your-stripe-key" ||
    webhookSecret === "your-stripe-webhook-secret"
  ) {
    console.warn("Stripe webhook credentials missing or dummy. Skipping verification.");
    return new NextResponse("Webhook Secret Missing", { status: 400 });
  }

  const stripe = new Stripe(stripeKey);
  const sig = req.headers.get("stripe-signature") || "";

  try {
    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const invoiceId = session.metadata?.invoiceId;
      const projectId = session.metadata?.projectId;

      if (invoiceId) {
        const invoice = await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            status: "PAID",
            paidAt: new Date(),
          },
        });

        await prisma.auditLog.create({
          data: {
            firmId: invoice.firmId,
            userId: "stripe_webhook",
            userEmail: "stripe_webhook@saganfg.local",
            projectId: projectId || null,
            action: "invoice.paid_via_stripe",
            resource: "invoice",
            resourceId: invoiceId,
            metadata: JSON.stringify({
              stripeSessionId: session.id,
              status: "PAID",
            }),
          },
        });

        console.log(`Stripe Webhook processed successfully for Invoice: ${invoiceId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Stripe Webhook error:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }
}
