import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "branch";

    if (type === "branch") {
      const students = await prisma.student.findMany({
        select: { id: true, branch: true },
      });
      const apps = await prisma.application.findMany({
        select: { studentId: true, status: true },
      });
      const byBranch: Record<string, { total_students: number; selected_students: number }> = {};
      for (const s of students) {
        if (!byBranch[s.branch]) byBranch[s.branch] = { total_students: 0, selected_students: 0 };
        byBranch[s.branch].total_students++;
      }
      for (const a of apps) {
        const s = students.find((x) => x.id === a.studentId);
        if (s && a.status === "selected") byBranch[s.branch].selected_students++;
      }
      const rows = Object.entries(byBranch).map(([branch, d]) => ({
        branch,
        ...d,
      }));
      return csvResponse(rows, "branch_wise_summary.csv");
    }

    if (type === "company") {
      const companies = await prisma.company.findMany();
      const apps = await prisma.application.groupBy({
        by: ["companyId", "status"],
        _count: { id: true },
      });
      const byCompany: Record<
        number,
        { id: number; name: string; role_title: string; total_applications: number; shortlisted: number; selected: number; rejected: number }
      > = {};
      for (const c of companies) {
        byCompany[c.id] = {
          id: c.id,
          name: c.name,
          role_title: c.roleTitle,
          total_applications: 0,
          shortlisted: 0,
          selected: 0,
          rejected: 0,
        };
      }
      for (const a of apps) {
        if (!byCompany[a.companyId]) continue;
        byCompany[a.companyId].total_applications += a._count.id;
        if (a.status === "shortlisted") byCompany[a.companyId].shortlisted = a._count.id;
        if (a.status === "selected") byCompany[a.companyId].selected = a._count.id;
        if (a.status === "rejected") byCompany[a.companyId].rejected = a._count.id;
      }
      const rows = Object.values(byCompany);
      return csvResponse(rows, "company_wise_summary.csv");
    }

    if (type === "full") {
      const apps = await prisma.application.findMany({
        include: {
          student: { select: { name: true, branch: true } },
          company: { select: { name: true, roleTitle: true } },
        },
        orderBy: [{ student: { branch: "asc" } }, { student: { name: "asc" } }],
      });
      const rows = apps.map((a) => ({
        student_name: a.student.name,
        branch: a.student.branch,
        company_name: a.company.name,
        role_title: a.company.roleTitle,
        status: a.status,
      }));
      return csvResponse(rows, "placement_report.csv");
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}

function csvResponse(rows: Record<string, unknown>[], filename: string) {
  const header = rows[0] ? Object.keys(rows[0]).join(",") : "";
  const lines = rows.map((r) =>
    Object.values(r)
      .map((v) => (typeof v === "string" && v.includes(",") ? `"${v}"` : v))
      .join(",")
  );
  const csv = [header, ...lines].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
