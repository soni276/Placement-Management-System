import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const studentId = formData.get("studentId");
    if (!file || !studentId) {
      return NextResponse.json(
        { error: "file and studentId required" },
        { status: 400 }
      );
    }
    if (!file.type.includes("pdf")) {
      return NextResponse.json({ error: "Only PDF files allowed" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const dir = path.join(process.cwd(), "public", "resumes");
    await mkdir(dir, { recursive: true });
    const filename = `student_${studentId}_${Date.now()}.pdf`;
    const filepath = path.join(dir, filename);
    await writeFile(filepath, buffer);
    const resumePath = `/resumes/${filename}`;

    return NextResponse.json({ resumePath });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
