"use client";

import { useState } from "react";
import { motion } from "motion/react";
import PageWrapper from "@/components/layout/PageWrapper";
import FileUploader from "@/components/shared/FileUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnalyzeResult {
  extracted_skills: string[];
  score: number;
  matched_roles: Array<{ role: string; matchCount: number }>;
  suggestions: string[];
}

export default function ResumeAnalyzerPage() {
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  const onAnalyze = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/resume/analyze", { method: "POST", body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Analysis failed");
    setResult(json);
  };

  return (
    <PageWrapper>
      <h1 className="mb-6 text-2xl font-bold">Resume Analyzer</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upload Resume</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploader accept=".pdf" onUpload={onAnalyze} label="Upload PDF to analyze" />
        </CardContent>
      </Card>
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Detected Skills</CardTitle>
            </CardHeader>
            <CardContent>
              {result.extracted_skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.extracted_skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500">
                  No skills detected. Try adding keywords like Python, SQL, Machine Learning.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Resume Score</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={result.score} className="h-3" />
              <p className="mt-2 font-semibold">{result.score}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recommended Roles</CardTitle>
            </CardHeader>
            <CardContent>
              {result.matched_roles.length > 0 ? (
                <ul className="list-inside list-disc space-y-1">
                  {result.matched_roles.map((r) => (
                    <li key={r.role}>
                      {r.role} (match: {r.matchCount})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-zinc-500">Upload a resume with relevant skills.</p>
              )}
            </CardContent>
          </Card>
          {result.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600">
                  {result.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </PageWrapper>
  );
}
