import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCustomWhatsApp } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, message } = body;

    if (!studentId) {
      return NextResponse.json({ error: "studentId required" }, { status: 400 });
    }
    if (!message || !String(message).trim()) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id: parseInt(String(studentId), 10) },
      select: { id: true, name: true, phone: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    if (!student.phone || !student.phone.trim()) {
      return NextResponse.json(
        { error: "Student has no phone number. Ask them to add it in Profile." },
        { status: 400 }
      );
    }

    const result = await sendCustomWhatsApp(student.phone, String(message).trim());

    if (!result.ok) {
      const errorMsg = result.error || "Failed to send WhatsApp";
      console.error("WhatsApp send failed:", errorMsg);
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message accepted by Twilio",
      sid: result.sid,
      status: result.status,
      to: result.to,
    });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error("WhatsApp send error:", e);
    return NextResponse.json(
      { success: false, error: err || "Failed to send WhatsApp" },
      { status: 500 }
    );
  }
}
