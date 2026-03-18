"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PageWrapper from "@/components/layout/PageWrapper";
import InterviewCard from "@/components/student/InterviewCard";
import { Card, CardContent } from "@/components/ui/card";

interface Interview {
  id: number;
  date: string;
  time: string;
  mode: string;
  link: string | null;
  company: { name: string; roleTitle: string };
}

interface Schedule {
  id: number;
  date: string;
  timeSlot: string;
  meetingLink: string | null;
  company: { name: string };
  panel: { panelName: string; interviewerName: string };
}

export default function StudentInterviewsPage() {
  const { data: session } = useSession();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const userId = (session?.user as { id?: string })?.id;

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/interviews?studentId=${userId}`).then((r) => r.json()).then(setInterviews).catch(() => setInterviews([]));
    fetch(`/api/interview-schedule?candidateId=${userId}`).then((r) => r.json()).then(setSchedules).catch(() => setSchedules([]));
  }, [userId]);

  if (!userId) return <div className="p-8">Loading...</div>;

  const hasAny = interviews.length > 0 || schedules.length > 0;
  return (
    <PageWrapper>
      <h1 className="mb-6 text-2xl font-bold">Upcoming Interviews</h1>
      {!hasAny ? (
        <Card>
          <CardContent className="py-8 text-center text-zinc-500">No upcoming interviews.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {interviews.map((inv) => (
            <InterviewCard
              key={`i-${inv.id}`}
              title={inv.company.name}
              subtitle={inv.company.roleTitle}
              date={inv.date}
              time={inv.time}
              mode={inv.mode}
              link={inv.link}
            />
          ))}
          {schedules.map((s) => (
            <InterviewCard
              key={`s-${s.id}`}
              title={s.company.name}
              subtitle={`${s.panel.panelName} - ${s.panel.interviewerName}`}
              date={s.date}
              time={s.timeSlot}
              mode="Online"
              link={s.meetingLink}
            />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
