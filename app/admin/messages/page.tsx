"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion } from "motion/react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Student { id: number; name: string; regNo: string; }
interface Message {
  id: number;
  senderId: number;
  senderRole: string;
  messageText: string;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const { data: session } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const adminId = (session?.user as { id?: string })?.id;

  useEffect(() => {
    fetch("/api/students").then((r) => r.json()).then((data) => {
      setStudents(data);
      if (data.length && !selectedStudentId) setSelectedStudentId(data[0].id);
    }).catch(() => setStudents([]));
  }, []);

  useEffect(() => {
    if (!selectedStudentId) return;
    fetch(`/api/messages?studentId=${selectedStudentId}`)
      .then((r) => r.json())
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [selectedStudentId]);

  useEffect(() => { bottomRef.current?.scrollIntoView(); }, [messages]);

  const send = async () => {
    if (!input.trim() || !selectedStudentId || !adminId) return;
    setSending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: parseInt(adminId, 10),
          senderRole: "admin",
          receiverId: selectedStudentId,
          messageText: input.trim(),
        }),
      });
      setInput("");
      fetch(`/api/messages?studentId=${selectedStudentId}`)
        .then((r) => r.json())
        .then(setMessages);
    } finally {
      setSending(false);
    }
  };

  return (
    <PageWrapper>
      <h1 className="mb-6 text-2xl font-bold">Student Messages</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium">Select student</label>
        <select
          value={selectedStudentId ?? ""}
          onChange={(e) => setSelectedStudentId(Number(e.target.value))}
          className="mt-1 w-full max-w-md rounded border px-3 py-2"
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.name} ({s.regNo})</option>
          ))}
        </select>
      </div>
      <div className="flex max-h-[500px] flex-col rounded-lg border">
        <div className="flex-1 overflow-y-auto space-y-3 p-4">
          {messages.map((m) => {
            const isAdmin = m.senderRole === "admin";
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isAdmin ? "bg-blue-600 text-white" : "bg-zinc-200"}`}>
                  <p>{m.messageText}</p>
                  <p className={`mt-1 text-xs ${isAdmin ? "text-blue-100" : "text-zinc-500"}`}>
                    {isAdmin ? "You" : "Student"} • {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t p-4">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Reply..." className="flex-1" />
          <Button type="submit" disabled={sending}>Send</Button>
        </form>
      </div>
    </PageWrapper>
  );
}
