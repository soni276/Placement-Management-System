"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface InterviewCardProps {
  title: string;
  subtitle: string;
  date: string;
  time: string;
  mode: string;
  link: string | null;
}

export default function InterviewCard({ title, subtitle, date, time, mode, link }: InterviewCardProps) {
  const dateStr = new Date(date).toLocaleDateString();
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold break-words">{title}</h3>
          <p className="text-sm text-zinc-500">{subtitle}</p>
          <p className="mt-1 text-sm">
            {dateStr} | {time} | {mode}
          </p>
        </div>
        {link && (
          <Button variant="outline" size="sm" asChild>
            <a href={link} target="_blank" rel="noopener noreferrer">
              Join Meeting <ExternalLink className="ml-1 h-4 w-4" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
