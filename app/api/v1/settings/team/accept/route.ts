import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new NextResponse("Email and password are required", { status: 400 });
    }

    if (password.length < 6) {
      return new NextResponse("Password must be at least 6 characters long", { status: 400 });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Set the new password hash
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
      },
    });

    // Also ensure the FirmUser membership is active
    await prisma.firmUser.updateMany({
      where: { userId: user.id },
      data: {
        isActive: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Accept invitation error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
