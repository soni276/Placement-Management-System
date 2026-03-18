import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildInterviewEmailBody } from "@/lib/email";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    const interviews = await prisma.interview.findMany({
      where: studentId ? { studentId: parseInt(studentId, 10) } : undefined,
      include: {
        student: { select: { name: true, regNo: true } },
        company: { select: { name: true, roleTitle: true } },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });
    return NextResponse.json(interviews);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch interviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, companyId, date, time, mode, link } = body;
    if (!studentId || !companyId || !date || !time || !mode) {
      return NextResponse.json(
        { error: "studentId, companyId, date, time, mode required" },
        { status: 400 }
      );
    }

    const interview = await prisma.interview.create({
      data: {
        studentId: parseInt(String(studentId), 10),
        companyId: parseInt(String(companyId), 10),
        date: new Date(date),
        time: String(time),
        mode: String(mode),
        link: link ? String(link).trim() : null,
        status: "Scheduled",
      },
    });

    const student = await prisma.student.findUnique({ where: { id: interview.studentId } });
    const company = await prisma.company.findUnique({ where: { id: interview.companyId } });
    await prisma.notification.create({
      data: {
        userType: "student",
        userId: interview.studentId,
        message: `Interview scheduled for ${company?.name ?? "Company"} on ${date} at ${time}.`,
      },
    });

    const dateStr = new Date(date).toISOString().slice(0, 10);
    const timeStr = String(time);
    const companyName = company?.name ?? "Company";

    if (student?.email) {
      const emailBody = buildInterviewEmailBody(
        student.name,
        companyName,
        dateStr,
        timeStr,
        String(mode),
        link
      );
      await sendEmail({
        to: student.email,
        subject: "Interview Scheduled",
        body: emailBody,
      });
    }
    if (student?.phone) {
      await sendWhatsApp(student.phone, student.name, companyName, dateStr, timeStr);
    }

    return NextResponse.json(interview);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create interview" }, { status: 500 });
  }
}
