import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    if (!studentId)
      return NextResponse.json({ error: "studentId required" }, { status: 400 });
    const sid = parseInt(studentId, 10);
    if (isNaN(sid)) return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: sid }, { receiverId: sid }],
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(messages);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { senderId, senderRole, receiverId, messageText } = body;
    if (!senderId || !senderRole || receiverId == null || !messageText) {
      return NextResponse.json(
        { error: "senderId, senderRole, receiverId, messageText required" },
        { status: 400 }
      );
    }

    const msg = await prisma.message.create({
      data: {
        senderId: parseInt(String(senderId), 10),
        senderRole: String(senderRole),
        receiverId: parseInt(String(receiverId), 10),
        messageText: String(messageText).trim(),
      },
    });
    return NextResponse.json(msg);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
