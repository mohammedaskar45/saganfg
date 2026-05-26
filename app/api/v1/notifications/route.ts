import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: (session.user as any).id as string,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(notifications);
  } catch (err) {
    console.error("GET notifications error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT() {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await prisma.notification.updateMany({
      where: {
        userId: (session.user as any).id as string,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return new NextResponse("Success", { status: 200 });
  } catch (err) {
    console.error("PUT notifications error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
