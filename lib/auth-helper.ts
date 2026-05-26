import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export interface AuthResult {
  authorized: boolean;
  firmId?: string;
  userId?: string;
  userEmail?: string;
}

export async function verifySessionOrToken(req: Request, projectId?: string): Promise<AuthResult> {
  // 1. Try checking the Next-Auth session
  const session = await auth();
  if (session?.user) {
    return {
      authorized: true,
      firmId: (session.user as any).firmId,
      userId: (session.user as any).id,
      userEmail: session.user.email ?? undefined,
    };
  }

  // 2. Try checking the portal token (magic link token)
  const token = req.headers.get("x-portal-token") || new URL(req.url).searchParams.get("token");
  if (token) {
    const magicLink = await prisma.magicLink.findUnique({
      where: { token },
      include: {
        project: true,
      },
    });

    if (magicLink && !magicLink.revoked && new Date() <= magicLink.expiresAt) {
      // If a specific projectId is requested, verify it matches the magic link project
      if (projectId && magicLink.projectId !== projectId) {
        return { authorized: false };
      }
      return {
        authorized: true,
        firmId: magicLink.firmId,
        userId: "portal_client",
        userEmail: magicLink.clientEmail,
      };
    }
  }

  return { authorized: false };
}
