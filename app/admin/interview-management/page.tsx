"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Card, CardContent } from "@/components/ui/card";

interface Interview {
  id: number;
  student: { name: string; regNo: string };
  company: { name: string; roleTitle: string };
  date: string;
  time: string;
  mode: string;
  status: string;
}

export default function InterviewManagementPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    fetch("/api/interviews").then((r) => r.json()).then(setInterviews).catch(() => setInterviews([]));
  }, []);

  const onStatusChange = async (id: number, status: string) => {
    const res = await fetch(`/api/interviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) { toast.error("Failed"); return; }
    toast.success("Updated");
    setInterviews((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  return (
    <PageWrapper>
      <h1 className="mb-6 text-2xl font-bold">Interview Management</h1>
      {interviews.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-zinc-500">No interviews.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {interviews.map((i) => (
            <Card key={i.id}>
              <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{i.student.name} - {i.company.name}</p>
                  <p className="text-sm text-zinc-500">
                    {new Date(i.date).toLocaleDateString()} | {i.time} | {i.mode}
                  </p>
                </div>
                <select
                  value={i.status}
                  onChange={(e) => onStatusChange(i.id, e.target.value)}
                  className="w-full rounded border px-2 py-1 sm:w-auto"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
