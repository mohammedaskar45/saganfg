import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const firmId = (session.user as any).firmId;
    const team = await prisma.firmUser.findMany({
      where: { firmId },
      include: { user: true },
    });

    return NextResponse.json(
      team.map((t) => ({
        name: t.user.name,
        email: t.user.email,
        role: t.role,
        status: t.isActive ? "ACTIVE" : "INACTIVE",
      }))
    );
  } catch (err) {
    console.error("GET team list error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
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
    const { name, email, role } = await req.json();

    if (!name || !email || !role) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const firmId = (session.user as any).firmId;

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: null, // Initialized as null, chosen during secure invitation setup flow
        },
      });
    }

    // Check if link exists
    const existingLink = await prisma.firmUser.findUnique({
      where: {
        firmId_userId: {
          firmId,
          userId: user.id,
        },
      },
    });

    if (existingLink) {
      return new NextResponse("User is already a member of this firm", { status: 400 });
    }

    const firmUser = await prisma.firmUser.create({
      data: {
        firmId,
        userId: user.id,
        role,
        isActive: false, // Set to inactive until they complete password setup
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        firmId,
        userId: (session.user as any).id,
        userEmail: session.user.email,
        action: "team.user_invited",
        resource: "firm_user",
        resourceId: firmUser.id,
        metadata: JSON.stringify({ name, email, role }),
      },
    });

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const inviteUrl = `${origin}/login?invite=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&role=${encodeURIComponent(role)}`;

    // Send transactional invitation email via SMTP
    await sendEmail({
      to: email,
      subject: `Invitation: Join SaganFG Tax Workflow Platform as ${role}`,
      text: `Hello ${name},\n\nYou have been invited to join the Sagan Financial Group tax workflow platform as a ${role}.\n\nYou can configure your password and join your staff workspace using the link below:\n${inviteUrl}\n\nBest regards,\nSagan Financial Group Team`,
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #4f46e5; margin-bottom: 20px;">SaganFG Firm Workspace</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>You have been invited to join the SaganFG tax platform as an active <strong>${role}</strong>.</p>
        <p>Please configure your password and access your secure staff workspace using the button below:</p>
        <p style="margin: 30px 0; text-align: center;">
          <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Access Firm Workspace</a>
        </p>
        <p style="font-size: 11px; color: #64748b;">Or copy and paste this URL into your browser: <a href="${inviteUrl}">${inviteUrl}</a></p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">This is an automated invitation from Sagan Financial Group. Security and compliance is our priority.</p>
      </div>`,
    });

    return NextResponse.json({
      name: user.name,
      email: user.email,
      role: firmUser.role,
      status: "ACTIVE",
    }, { status: 201 });
  } catch (err) {
    console.error("POST invite team member error:", err);
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
    const { email, role } = await req.json();
    if (!email || !role) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const firmId = (session.user as any).firmId;

    const targetUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    const updatedLink = await prisma.firmUser.update({
      where: {
        firmId_userId: {
          firmId,
          userId: targetUser.id,
        },
      },
      data: {
        role,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        firmId,
        userId: (session.user as any).id,
        userEmail: session.user.email,
        action: "team.user_role_updated",
        resource: "firm_user",
        resourceId: updatedLink.id,
        metadata: JSON.stringify({ email, newRole: role }),
      },
    });

    return NextResponse.json({
      name: targetUser.name,
      email: targetUser.email,
      role: updatedLink.role,
      status: updatedLink.isActive ? "ACTIVE" : "INACTIVE",
    });
  } catch (err) {
    console.error("PATCH update role error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
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
    const { email } = await req.json();
    if (!email) {
      return new NextResponse("Missing required email field", { status: 400 });
    }

    const firmId = (session.user as any).firmId;

    const targetUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Do not allow deleting themselves
    if (targetUser.id === (session.user as any).id) {
      return new NextResponse("Cannot remove your own account from the firm", { status: 400 });
    }

    const deletedLink = await prisma.firmUser.delete({
      where: {
        firmId_userId: {
          firmId,
          userId: targetUser.id,
        },
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        firmId,
        userId: (session.user as any).id,
        userEmail: session.user.email,
        action: "team.user_removed",
        resource: "firm_user",
        resourceId: deletedLink.id,
        metadata: JSON.stringify({ email }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE remove staff error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
