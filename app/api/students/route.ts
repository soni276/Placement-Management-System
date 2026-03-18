import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        regNo: true,
        name: true,
        email: true,
        phone: true,
        branch: true,
        cgpa: true,
        passoutYear: true,
        resumePath: true,
      },
    });
    return NextResponse.json(students);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

function generateUniqueRegNo(): string {
  const year = String(new Date().getFullYear()).slice(-2);
  const random = Math.floor(100000000 + Math.random() * 900000000);
  return year + String(random);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      branch,
      cgpa,
      passoutYear,
      password,
    } = body;

    if (!name || !email || !branch || !password) {
      return NextResponse.json(
        { error: "name, email, branch, and password are required" },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.student.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "A student with this email already exists" },
        { status: 400 }
      );
    }

    let regNo: string;
    let attempts = 0;
    const maxAttempts = 10;
    do {
      regNo = generateUniqueRegNo();
      const exists = await prisma.student.findUnique({ where: { regNo } });
      if (!exists) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: "Could not generate unique registration number. Please try again." },
        { status: 500 }
      );
    }

    const cgpaVal = typeof cgpa === "number" ? cgpa : parseFloat(String(cgpa));
    const passoutVal = typeof passoutYear === "number" ? passoutYear : parseInt(String(passoutYear), 10);
    const safeCgpa = Number.isFinite(cgpaVal) ? Math.max(0, Math.min(10, cgpaVal)) : 0;
    const currentYear = new Date().getFullYear();
    const safePassoutYear = Number.isFinite(passoutVal) ? Math.max(2020, Math.min(2100, passoutVal)) : currentYear;

    const pwdHash = await hashPassword(String(password));
    const student = await prisma.student.create({
      data: {
        regNo,
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: phone ? String(phone).trim() : null,
        branch: String(branch).trim(),
        cgpa: safeCgpa,
        passoutYear: safePassoutYear,
        passwordHash: pwdHash,
      },
    });

    return NextResponse.json({
      id: student.id,
      regNo: student.regNo,
      name: student.name,
      email: student.email,
    });
  } catch (e) {
    console.error("Student registration error:", e);
    const msg = e instanceof Error ? e.message : "Registration failed";
    return NextResponse.json(
      { error: "Registration failed", details: msg },
      { status: 500 }
    );
  }
}
