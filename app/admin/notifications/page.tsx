"use client";

import { useEffect, useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Notification {
  id: number;
  message: string;
  status: string;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetch("/api/notifications?userType=admin&userId=0")
      .then((r) => r.json())
      .then(setNotifications)
      .catch(() => setNotifications([]));
  }, []);

  const markRead = async (id: number) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: "read" } : n)));
  };

  const markAllRead = async () => {
    await fetch("/api/notifications/mark-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userType: "admin", userId: 0 }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
  };

  const unreadCount = notifications.filter((n) => n.status === "unread").length;
  return (
    <PageWrapper>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>Mark all as read</Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-zinc-500">No notifications.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={n.status === "unread" ? "border-l-4 border-l-blue-500" : ""}>
              <CardContent className="flex items-center justify-between py-4">
                <p className={n.status === "unread" ? "font-medium" : ""}>{n.message}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">{new Date(n.createdAt).toLocaleString()}</span>
                  {n.status === "unread" && (
                    <Button size="sm" variant="outline" onClick={() => markRead(n.id)}>Mark as read</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
