"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PageWrapper from "@/components/layout/PageWrapper";
import FeedbackCard from "@/components/student/FeedbackCard";
import { Card, CardContent } from "@/components/ui/card";

interface Feedback {
  id: number;
  technicalScore: number | null;
  communicationScore: number | null;
  problemSolvingScore: number | null;
  improvementAreas: string | null;
  decision: string;
  company: { name: string; roleTitle: string };
  createdAt: string;
}

export default function StudentFeedbackPage() {
  const { data: session } = useSession();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const userId = (session?.user as { id?: string })?.id;

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/interview-feedback?studentId=${userId}`)
      .then((r) => r.json())
      .then(setFeedbacks)
      .catch(() => setFeedbacks([]));
  }, [userId]);

  if (!userId) return <div className="p-8">Loading...</div>;

  return (
    <PageWrapper>
      <h1 className="mb-6 text-2xl font-bold">Interview Feedback</h1>
      {feedbacks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-zinc-500">No feedback yet.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <FeedbackCard key={fb.id} feedback={fb} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
