import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rows = Array.isArray(body) ? body : body.rows || body.data || [];
    const requiredCols = ["company_name", "role"];
    let added = 0;
    let skipped = 0;

    for (const row of rows) {
      const nameVal = String(row.company_name || row.name || "").trim();
      const roleVal = String(row.role || row.role_title || "").trim();
      if (!nameVal || !roleVal) {
        skipped++;
        continue;
      }
      const existing = await prisma.company.findFirst({
        where: { name: nameVal, roleTitle: roleVal },
      });
      if (existing) {
        skipped++;
        continue;
      }
      try {
        await prisma.company.create({
          data: {
            name: nameVal,
            roleTitle: roleVal,
            description: "",
            ctc: Number(row.package ?? row.ctc ?? 0) || 0,
            location: String(row.location || "").trim() || null,
            cgpaCutoff: Number(row.min_cgpa ?? row.cgpaCutoff ?? 0) || 0,
            eligibleBranches: "CSE,IT,ECE,EEE,ME,CE",
            applicationDeadline: null,
          },
        });
        added++;
      } catch {
        skipped++;
      }
    }

    return NextResponse.json({ added, skipped });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Bulk upload failed" }, { status: 500 });
  }
}
