import { NextRequest, NextResponse } from "next/server";
import {
  detectSkills,
  calculateResumeScore,
  recommendRoles,
  getSuggestions,
} from "@/lib/resume-analyzer";

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return (data.text as string) || "";
  } catch (e) {
    console.error("pdf-parse error:", e);
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }
    if (!file.type.includes("pdf")) {
      return NextResponse.json({ error: "Only PDF files allowed" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const text = await extractTextFromPdf(buffer);
    const skills = detectSkills(text);
    const score = calculateResumeScore(skills);
    const matchedRoles = recommendRoles(skills.map((s) => s.toLowerCase()));
    const suggestions = getSuggestions(skills.map((s) => s.toLowerCase()));

    return NextResponse.json({
      extracted_skills: skills,
      score,
      matched_roles: matchedRoles,
      suggestions,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
