"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

interface Student { id: number; name: string; regNo: string; branch: string; phone?: string | null; }
interface Company { id: number; name: string; roleTitle: string; }

export default function ScheduleInterviewPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [customMessage, setCustomMessage] = useState("");
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetch("/api/students").then((r) => r.json()).then(setStudents).catch(() => setStudents([]));
    fetch("/api/companies").then((r) => r.json()).then(setCompanies).catch(() => setCompanies([]));
  }, []);

  const onSendWhatsApp = async () => {
    const form = formRef.current;
    if (!form) return;
    const studentId = (form.querySelector('[name="studentId"]') as HTMLSelectElement)?.value;
    if (!studentId) {
      toast.error("Select a student");
      return;
    }
    if (!customMessage.trim()) {
      toast.error("Enter a message to send");
      return;
    }
    const student = students.find((s) => s.id === parseInt(studentId, 10));
    if (student && !student.phone) {
      toast.error(`Student ${student.name} has no phone number. Ask them to add it in Profile.`);
      return;
    }
    setSendingWhatsApp(true);
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: parseInt(studentId, 10), message: customMessage.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to send WhatsApp");
        return;
      }
      const statusMsg = json.status
        ? `Accepted by Twilio (${json.status}). Check Twilio Console if not delivered.`
        : "WhatsApp message sent!";
      toast.success(statusMsg);
      setCustomMessage("");
    } catch {
      toast.error("Failed to send WhatsApp");
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const studentId = fd.get("studentId");
    const companyId = fd.get("companyId");
    const date = fd.get("date");
    const time = fd.get("time");
    const mode = fd.get("mode");
    const link = fd.get("link");

    if (!studentId || !companyId || !date || !time || !mode) {
      toast.error("Fill required fields");
      return;
    }
    if (mode === "Online" && !link) {
      toast.error("Meeting link required for Online mode");
      return;
    }

    const res = await fetch("/api/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: parseInt(String(studentId), 10),
        companyId: parseInt(String(companyId), 10),
        date,
        time,
        mode,
        link: link || null,
      }),
    });
    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error || "Failed");
      return;
    }
    toast.success("Interview scheduled");
    form.reset();
  };

  return (
    <PageWrapper>
      <h1 className="mb-6 text-2xl font-bold">Schedule Interview</h1>
      <Card>
        <CardContent className="pt-6">
          <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Date</label>
                <Input name="date" type="date" required className="mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Time</label>
                <Input name="time" type="time" required className="mt-1" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Mode</label>
              <select name="mode" className="mt-1 w-full rounded border px-3 py-2">
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Meeting Link (for Online)</label>
              <Input name="link" type="url" placeholder="https://meet.google.com/..." className="mt-1" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit">Schedule</Button>
              <div className="border-l border-zinc-200 pl-3">
                <p className="mb-2 text-sm font-medium text-zinc-600">Send Custom WhatsApp</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Type your message here..."
                      rows={2}
                      className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onSendWhatsApp}
                    disabled={sendingWhatsApp}
                    className="shrink-0"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {sendingWhatsApp ? "Sending..." : "Send WhatsApp"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
