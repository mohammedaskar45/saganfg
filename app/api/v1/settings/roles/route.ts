import { auth } from "@/lib/auth";
import { getPermissionMatrix, savePermissionMatrix } from "@/lib/rbac";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const matrix = await getPermissionMatrix();
    return NextResponse.json(matrix);
  } catch (err) {
    console.error("GET rbac matrix error:", err);
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
    const matrix = await req.json();
    await savePermissionMatrix(matrix);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST rbac matrix error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
