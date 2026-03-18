"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Company { id: number; name: string; roleTitle: string; }

export default function PanelSlotsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    fetch("/api/companies").then((r) => r.json()).then(setCompanies).catch(() => setCompanies([]));
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const companyId = (form.querySelector('[name="companyId"]') as HTMLSelectElement)?.value;
    const date = (form.querySelector('[name="date"]') as HTMLInputElement)?.value;
    const meetingLink = (form.querySelector('[name="meetingLink"]') as HTMLInputElement)?.value;

    if (!companyId || !date) {
      toast.error("Select company and date");
      return;
    }

    const res = await fetch("/api/interviews/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: parseInt(companyId, 10),
        date,
        meetingLink: meetingLink || null,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed");
      return;
    }
    toast.success(`Created: ${json.created} candidates, ${json.panels} panel(s)`);
  };

  return (
    <PageWrapper>
      <h1 className="mb-6 text-2xl font-bold">Panel & Slots (Auto Schedule)</h1>
      <Card>
        <CardContent className="pt-6">
          <p className="mb-4 text-sm text-zinc-500">
            Select company and date. Shortlisted candidates will be assigned to panels with 15-min slots from 9 AM.
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Company</label>
              <select name="companyId" required className="mt-1 w-full rounded border px-3 py-2">
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} - {c.roleTitle}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Interview Date</label>
              <Input name="date" type="date" required className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Meeting Link (optional)</label>
              <Input name="meetingLink" type="url" placeholder="https://meet.google.com/..." className="mt-1" />
            </div>
            <Button type="submit">Auto Generate Schedule</Button>
          </form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
