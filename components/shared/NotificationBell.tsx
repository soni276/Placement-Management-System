"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Bell } from "lucide-react";

export default function NotificationBell({
  userType,
  userId,
}: {
  userType: "student" | "admin";
  userId: string;
}) {
  const [count, setCount] = useState(0);
  const basePath = userType === "student" ? "/student/notifications" : "/admin/notifications";
  const uid = userType === "admin" ? "0" : userId;

  useEffect(() => {
    fetch(`/api/notifications?userType=${userType}&userId=${uid}`)
      .then((r) => r.json())
      .then((data) => {
        const unread = Array.isArray(data)
          ? data.filter((n: { status: string }) => n.status === "unread").length
          : 0;
        setCount(unread);
      })
      .catch(() => setCount(0));
  }, [userType, uid]);

  return (
    <Link href={basePath} className="relative inline-flex">
      <motion.div
        animate={count > 0 ? { rotate: [0, -10, 10, -10, 0] } : {}}
        transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
      >
        <Bell className="h-6 w-6 text-[var(--text-muted)]" />
      </motion.div>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
          {Math.min(count, 99)}
        </span>
      )}
    </Link>
  );
}
