import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userType = searchParams.get("userType") || "student";
    const userId = searchParams.get("userId") ?? "0";
    const uid = userType === "admin" ? 0 : parseInt(userId, 10);
    if (isNaN(uid) && userType !== "admin")
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });

    const notifications = await prisma.notification.findMany({
      where: { userType, userId: uid },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(notifications);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
