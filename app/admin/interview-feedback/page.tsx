"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Student { id: number; name: string; regNo: string; branch: string; }
interface Company { id: number; name: string; roleTitle: string; }

export default function InterviewFeedbackPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    fetch("/api/students").then((r) => r.json()).then(setStudents).catch(() => setStudents([]));
    fetch("/api/companies").then((r) => r.json()).then(setCompanies).catch(() => setCompanies([]));
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const studentId = (form.querySelector('[name="studentId"]') as HTMLSelectElement)?.value;
    const companyId = (form.querySelector('[name="companyId"]') as HTMLSelectElement)?.value;
    const technicalScore = parseInt((form.querySelector('[name="technicalScore"]') as HTMLInputElement)?.value || "5", 10);
    const communicationScore = parseInt((form.querySelector('[name="communicationScore"]') as HTMLInputElement)?.value || "5", 10);
    const problemSolvingScore = parseInt((form.querySelector('[name="problemSolvingScore"]') as HTMLInputElement)?.value || "5", 10);
    const comments = (form.querySelector('[name="comments"]') as HTMLTextAreaElement)?.value;
    const improvementAreas = (form.querySelector('[name="improvementAreas"]') as HTMLTextAreaElement)?.value;

    const avg = (technicalScore + communicationScore + problemSolvingScore) / 3;
    const decision = avg >= 7 ? "Selected" : "Rejected";
    const interviewScore = Math.round(avg);

    const res = await fetch("/api/interview-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: parseInt(studentId!, 10),
        companyId: parseInt(companyId!, 10),
        technicalScore,
        communicationScore,
        problemSolvingScore,
        interviewScore,
        improvementAreas: improvementAreas || null,
        comments: comments || null,
        decision,
      }),
    });
    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error || "Failed");
      return;
    }
    toast.success("Feedback submitted");
    form.reset();
  };

  return (
    <PageWrapper>
      <h1 className="mb-6 text-2xl font-bold">Interview Feedback</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Student</label>
                <select name="studentId" required className="mt-1 w-full rounded border px-3 py-2">
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.regNo})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Company</label>
                <select name="companyId" required className="mt-1 w-full rounded border px-3 py-2">
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.roleTitle}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium">Technical (1-10)</label>
                <Input name="technicalScore" type="number" min={1} max={10} defaultValue={5} className="mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Communication (1-10)</label>
                <Input name="communicationScore" type="number" min={1} max={10} defaultValue={5} className="mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Problem Solving (1-10)</label>
                <Input name="problemSolvingScore" type="number" min={1} max={10} defaultValue={5} className="mt-1" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Improvement Areas</label>
              <textarea
                name="improvementAreas"
                rows={3}
                className="mt-1 w-full rounded border px-3 py-2 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Comments</label>
              <textarea
                name="comments"
                rows={2}
                className="mt-1 w-full rounded border px-3 py-2 dark:bg-zinc-900"
              />
            </div>
            <Button type="submit">Submit Feedback</Button>
          </form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
