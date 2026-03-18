import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const candidateId = searchParams.get("candidateId");

    const schedules = await prisma.interviewSchedule.findMany({
      where: candidateId ? { candidateId: parseInt(candidateId, 10) } : undefined,
      include: {
        company: { select: { name: true } },
        panel: { select: { panelName: true, interviewerName: true } },
      },
      orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
    });
    return NextResponse.json(schedules);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}
