import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userType, userId } = body;
    const uid = userType === "admin" ? 0 : parseInt(String(userId || 0), 10);

    await prisma.notification.updateMany({
      where: { userType, userId: uid, status: "unread" },
      data: { status: "read" },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
