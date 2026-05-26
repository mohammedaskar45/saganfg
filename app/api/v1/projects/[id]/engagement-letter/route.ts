import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

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
    const project = await prisma.project.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!project || project.firmId !== (session.user as any).firmId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const clientName =
      project.client.type === "INDIVIDUAL"
        ? `${project.client.firstName} ${project.client.lastName}`
        : project.client.entityName;

    // Create an engagement letter record inside SQLite
    const letter = await prisma.engagementLetter.create({
      data: {
        projectId: id,
        firmId: (session.user as any).firmId as string,
        name: `Engagement Letter - ${clientName} - TY ${project.year}`,
        status: "SENT",
        sentAt: new Date(),
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        firmId: (session.user as any).firmId as string,
        userId: (session.user as any).id as string,
        userEmail: session.user.email as string,
        action: "engagement_letter.sent",
        resource: "engagement_letter",
        resourceId: letter.id,
        metadata: JSON.stringify({ name: letter.name }),
      },
    });

    // Generate or fetch magic link for client portal
    let magicLink = await prisma.magicLink.findFirst({
      where: { projectId: id, revoked: false },
    });

    if (!magicLink) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
      magicLink = await prisma.magicLink.create({
        data: {
          projectId: id,
          firmId: project.firmId,
          clientEmail: project.client.email,
          expiresAt,
        },
      });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const portalUrl = `${origin}/portal/${magicLink.token}`;

    // Send transactional SMTP Email
    await sendEmail({
      to: project.client.email,
      subject: `Action Required: Review & Sign Engagement Letter - TY ${project.year}`,
      text: `Hello ${clientName},\n\nSaganFG has compiled your Engagement Letter for Tax Year ${project.year}.\n\nPlease review and e-sign the document securely at:\n${portalUrl}\n\nBest regards,\nSagan Financial Group`,
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #4f46e5; margin-bottom: 20px;">SaganFG Tax Portal</h2>
        <p>Hello <strong>${clientName}</strong>,</p>
        <p>Your preparer at SaganFG has compiled your <strong>Engagement Letter for Tax Year ${project.year}</strong> and is ready for your signature.</p>
        <p>Please review and e-sign the document securely via our zero-login portal by clicking the link below:</p>
        <p style="margin: 30px 0; text-align: center;">
          <a href="${portalUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Review & E-Sign Letter</a>
        </p>
        <p style="font-size: 11px; color: #64748b;">Or copy and paste this URL into your browser: <a href="${portalUrl}">${portalUrl}</a></p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">This is an automated request from Sagan Financial Group. Security and compliance is our priority.</p>
      </div>`,
    });

    return NextResponse.json(letter);
  } catch (err) {
    console.error("POST engagement letter error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
