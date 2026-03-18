import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json();
    const { status } = body;
    const valid = ["applied", "shortlisted", "selected", "rejected"];
    if (!status || !valid.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const app = await prisma.application.update({
      where: { id },
      data: { status },
      include: { student: true, company: true },
    });

    const companyName = app.company.name;
    const msgMap: Record<string, string> = {
      shortlisted: `Your application for ${companyName} has been shortlisted.`,
      selected: `Congratulations! You are selected for ${companyName}.`,
      rejected: `Your application for ${companyName} has been rejected.`,
    };
    if (msgMap[status]) {
      await prisma.notification.create({
        data: {
          userType: "student",
          userId: app.studentId,
          message: msgMap[status],
        },
      });
    }

    return NextResponse.json(app);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
