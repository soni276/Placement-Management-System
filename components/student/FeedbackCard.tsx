"use client";

import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "@/components/shared/StatusBadge";

interface Feedback {
  technicalScore: number | null;
  communicationScore: number | null;
  problemSolvingScore: number | null;
  improvementAreas: string | null;
  decision: string;
  company: { name: string; roleTitle: string };
  createdAt: string;
}

export default function FeedbackCard({ feedback }: { feedback: Feedback }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{feedback.company.name} - {feedback.company.roleTitle}</h3>
          <StatusBadge status={feedback.decision} />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-zinc-500">Technical</p>
            <p className="font-medium">{feedback.technicalScore ?? "—"}</p>
          </div>
          <div>
            <p className="text-zinc-500">Communication</p>
            <p className="font-medium">{feedback.communicationScore ?? "—"}</p>
          </div>
          <div>
            <p className="text-zinc-500">Problem Solving</p>
            <p className="font-medium">{feedback.problemSolvingScore ?? "—"}</p>
          </div>
        </div>
        {feedback.improvementAreas && (
          <p className="mt-3 text-sm text-zinc-600">{feedback.improvementAreas}</p>
        )}
        <p className="mt-2 text-xs text-zinc-400">
          {new Date(feedback.createdAt).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
