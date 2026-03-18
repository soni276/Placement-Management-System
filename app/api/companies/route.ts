import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(companies);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      roleTitle,
      description,
      ctc,
      location,
      cgpaCutoff,
      eligibleBranches,
      applicationDeadline,
    } = body;

    if (!name || !roleTitle) {
      return NextResponse.json(
        { error: "name and roleTitle are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.company.findFirst({
      where: {
        name: String(name).trim(),
        roleTitle: String(roleTitle).trim(),
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A company with this name and role already exists" },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name: String(name).trim(),
        roleTitle: String(roleTitle).trim(),
        description: description ? String(description).trim() : null,
        ctc: Number(ctc) ?? 0,
        location: location ? String(location).trim() : null,
        cgpaCutoff: Number(cgpaCutoff) ?? 0,
        eligibleBranches: Array.isArray(eligibleBranches)
          ? eligibleBranches.join(",")
          : String(eligibleBranches || ""),
        applicationDeadline: applicationDeadline
          ? new Date(applicationDeadline)
          : null,
      },
    });
    return NextResponse.json(company);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to add company" }, { status: 500 });
  }
}
