"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion } from "motion/react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: number;
  senderId: number;
  senderRole: string;
  messageText: string;
  createdAt: string;
}

export default function StudentMessagesPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const userId = (session?.user as { id?: string })?.id;

  const load = () => {
    if (!userId) return;
    fetch(`/api/messages?studentId=${userId}`)
      .then((r) => r.json())
      .then(setMessages)
      .catch(() => setMessages([]));
  };

  useEffect(() => { load(); }, [userId]);
  useEffect(() => { bottomRef.current?.scrollIntoView(); }, [messages]);

  const send = async () => {
    if (!input.trim() || !userId) return;
    setSending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: parseInt(userId, 10),
          senderRole: "student",
          receiverId: 0,
          messageText: input.trim(),
        }),
      });
      setInput("");
      load();
    } finally {
      setSending(false);
    }
  };

  if (!userId) return <div className="p-8">Loading...</div>;

  return (
    <PageWrapper>
      <h1 className="mb-6 text-2xl font-bold">Messages</h1>
      <div className="flex max-h-[600px] flex-col rounded-lg border">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => {
            const isSent = m.senderRole === "student";
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isSent ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isSent ? "bg-blue-600 text-white" : "bg-zinc-200 text-zinc-900"
                  }`}
                >
                  <p>{m.messageText}</p>
                  <p className={`mt-1 text-xs ${isSent ? "text-blue-100" : "text-zinc-500"}`}>
                    {isSent ? "You" : "Admin"} • {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <form
          className="flex gap-2 border-t p-4"
          onSubmit={(e) => { e.preventDefault(); send(); }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" disabled={sending}>Send</Button>
        </form>
      </div>
    </PageWrapper>
  );
}
