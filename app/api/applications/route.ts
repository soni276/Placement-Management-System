import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const companyId = searchParams.get("companyId");

    const where: { studentId?: number; companyId?: number } = {};
    if (studentId) where.studentId = parseInt(studentId, 10);
    if (companyId) where.companyId = parseInt(companyId, 10);

    const applications = await prisma.application.findMany({
      where: Object.keys(where).length ? where : undefined,
      include: {
        student: { select: { id: true, name: true, regNo: true, branch: true, cgpa: true, resumePath: true } },
        company: { select: { id: true, name: true, roleTitle: true } },
      },
      orderBy: { appliedAt: "desc" },
    });
    return NextResponse.json(applications);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, companyId } = body;
    if (!studentId || !companyId) {
      return NextResponse.json({ error: "studentId and companyId required" }, { status: 400 });
    }
    const sid = parseInt(String(studentId), 10);
    const cid = parseInt(String(companyId), 10);
    if (isNaN(sid) || isNaN(cid)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    const existing = await prisma.application.findUnique({
      where: { studentId_companyId: { studentId: sid, companyId: cid } },
    });
    if (existing) {
      return NextResponse.json({ error: "Already applied" }, { status: 400 });
    }

    const app = await prisma.application.create({
      data: { studentId: sid, companyId: cid, status: "applied" },
    });

    const student = await prisma.student.findUnique({ where: { id: sid } });
    const company = await prisma.company.findUnique({ where: { id: cid } });
    await prisma.notification.create({
      data: {
        userType: "admin",
        userId: 0,
        message: `New application received from ${student?.name ?? "Student"} for ${company?.name ?? "Company"}.`,
      },
    });

    return NextResponse.json(app);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}
