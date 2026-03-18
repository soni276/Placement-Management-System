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

    const feedbacks = await prisma.interviewFeedback.findMany({
      where: { studentId: sid },
      include: { company: { select: { name: true, roleTitle: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(feedbacks);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentId,
      companyId,
      technicalScore,
      communicationScore,
      problemSolvingScore,
      interviewScore,
      improvementAreas,
      comments,
      decision,
    } = body;

    if (!studentId || !companyId || !decision) {
      return NextResponse.json(
        { error: "studentId, companyId, decision required" },
        { status: 400 }
      );
    }
    const sid = parseInt(String(studentId), 10);
    const cid = parseInt(String(companyId), 10);
    if (isNaN(sid) || isNaN(cid)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    const fb = await prisma.interviewFeedback.create({
      data: {
        studentId: sid,
        companyId: cid,
        technicalScore: technicalScore != null ? parseInt(String(technicalScore), 10) : null,
        communicationScore:
          communicationScore != null ? parseInt(String(communicationScore), 10) : null,
        problemSolvingScore:
          problemSolvingScore != null ? parseInt(String(problemSolvingScore), 10) : null,
        interviewScore: interviewScore != null ? parseInt(String(interviewScore), 10) : null,
        improvementAreas: improvementAreas ? String(improvementAreas).trim() : null,
        comments: comments ? String(comments).trim() : null,
        decision: String(decision),
      },
    });

    await prisma.application.updateMany({
      where: { studentId: sid, companyId: cid },
      data: {
        status: decision.toLowerCase(),
        interviewScore: interviewScore != null ? parseFloat(String(interviewScore)) : null,
      },
    });

    const company = await prisma.company.findUnique({ where: { id: cid } });
    const companyName = company?.name ?? "Company";
    const msg =
      decision === "Selected"
        ? `Congratulations! You are selected for ${companyName}.`
        : `Your interview result for ${companyName}: ${decision}. Check feedback for improvement suggestions.`;
    await prisma.notification.create({
      data: { userType: "student", userId: sid, message: msg },
    });

    return NextResponse.json(fb);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
