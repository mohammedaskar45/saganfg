import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const clients = await prisma.client.findMany({
      where: {
        firmId: (session.user as any).firmId as string,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(clients);
  } catch (err) {
    console.error("GET clients error:", err);
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
      type,
      firstName,
      lastName,
      entityName,
      email,
      phone,
      ssn,
      ein,
      address,
      notes,
    } = await req.json();

    if (!email || (type === "INDIVIDUAL" && (!firstName || !lastName)) || (type === "ENTITY" && !entityName)) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const newClient = await prisma.client.create({
      data: {
        firmId: (session.user as any).firmId as string,
        type,
        firstName,
        lastName,
        entityName,
        email,
        phone,
        ssn,
        ein,
        address,
        notes,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        firmId: (session.user as any).firmId as string,
        userId: (session.user as any).id as string,
        userEmail: session.user.email as string,
        action: "client.created",
        resource: "client",
        resourceId: newClient.id,
        metadata: JSON.stringify({ name: type === "INDIVIDUAL" ? `${firstName} ${lastName}` : entityName }),
      },
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (err) {
    console.error("POST client error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
