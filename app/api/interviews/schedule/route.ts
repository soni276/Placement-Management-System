import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePanelSlots, formatTimeFromMinutes } from "@/lib/auto-scheduler";
import { sendEmail } from "@/lib/email";
import { buildInterviewEmailBody } from "@/lib/email";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, date, meetingLink } = body;
    if (!companyId || !date) {
      return NextResponse.json({ error: "companyId and date required" }, { status: 400 });
    }
    const cid = parseInt(String(companyId), 10);
    if (isNaN(cid)) return NextResponse.json({ error: "Invalid companyId" }, { status: 400 });

    const shortlisted = await prisma.application.findMany({
      where: { companyId: cid, status: "shortlisted" },
      orderBy: [{ appliedAt: "asc" }, { studentId: "asc" }],
      select: { studentId: true },
    });
    const candidateIds = shortlisted.map((a) => a.studentId);
    if (candidateIds.length === 0) {
      return NextResponse.json(
        { error: "No shortlisted candidates for this company" },
        { status: 400 }
      );
    }

    const { numPanels, assignments } = generatePanelSlots(candidateIds);
    const dateObj = new Date(date);
    const dateStr = dateObj.toISOString().slice(0, 10);

    const panelIds: number[] = [];
    for (let i = 0; i < numPanels; i++) {
      const panel = await prisma.interviewPanel.create({
        data: {
          companyId: cid,
          panelName: `Panel ${String.fromCharCode(65 + i)}`,
          interviewerName: `Interviewer ${String.fromCharCode(65 + i)}`,
        },
      });
      panelIds.push(panel.id);
    }

    for (const a of assignments) {
      const timeStr = formatTimeFromMinutes(a.timeMinutes);
      await prisma.interviewSchedule.create({
        data: {
          candidateId: a.candidateId,
          companyId: cid,
          panelId: panelIds[a.panelIndex],
          date: dateObj,
          timeSlot: timeStr,
          meetingLink: meetingLink ? String(meetingLink).trim() : null,
        },
      });
    }

    const company = await prisma.company.findUnique({ where: { id: cid } });
    const companyName = company?.name ?? "Company";
    const students = await prisma.student.findMany({
      where: { id: { in: candidateIds } },
      select: { id: true, name: true, email: true, phone: true },
    });
    const studentMap = Object.fromEntries(students.map((s) => [s.id, s]));

    for (let i = 0; i < candidateIds.length; i++) {
      const cid_st = candidateIds[i];
      const slotIdx = Math.floor(i / numPanels);
      const timeMin = 9 * 60 + slotIdx * 15;
      const tStr = formatTimeFromMinutes(timeMin);
      await prisma.notification.create({
        data: {
          userType: "student",
          userId: cid_st,
          message: `Panel interview scheduled for ${companyName} on ${dateStr}. Check Upcoming Interviews for panel and time slot.`,
        },
      });
      const s = studentMap[cid_st];
      if (s?.email) {
        const body = buildInterviewEmailBody(
          s.name,
          companyName,
          dateStr,
          tStr,
          "Online",
          meetingLink
        );
        await sendEmail({
          to: s.email,
          subject: "Interview Scheduled",
          body,
        });
      }
      if (s?.phone) {
        await sendWhatsApp(s.phone, s.name, companyName, dateStr, tStr);
      }
    }

    return NextResponse.json({
      created: candidateIds.length,
      panels: numPanels,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Auto-schedule failed" }, { status: 500 });
  }
}
