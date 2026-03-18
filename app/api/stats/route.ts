import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalStudents, totalCompanies, totalApplications, selectedStudents] = await Promise.all([
      prisma.student.count(),
      prisma.company.count(),
      prisma.application.count(),
      prisma.application.count({ where: { status: "selected" } }),
    ]);

    const companyPlacements = await prisma.application.groupBy({
      by: ["companyId"],
      where: { status: "selected" },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    const companies = await prisma.company.findMany({
      where: { id: { in: companyPlacements.map((c) => c.companyId) } },
      select: { id: true, name: true },
    });
    const companyMap = Object.fromEntries(companies.map((c) => [c.id, c.name]));

    const companyWise = companyPlacements.map((c) => ({
      company: companyMap[c.companyId] ?? "Unknown",
      selected_students: c._count.id,
    }));

    const statusRows = await prisma.application.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const statusDistribution = statusRows.map((s) => ({
      status: s.status,
      count: s._count.id,
    }));

    return NextResponse.json({
      totalStudents,
      totalCompanies,
      totalApplications,
      selectedStudents,
      companyWise,
      statusDistribution,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
