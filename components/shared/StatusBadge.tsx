"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const colors: Record<string, string> = {
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  shortlisted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  selected: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export default function StatusBadge({ status }: { status: string }) {
  const s = (status || "applied").toLowerCase();
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        colors[s] ?? "bg-zinc-100 text-zinc-800"
      )}
    >
      {(status || "applied").charAt(0).toUpperCase() + (status || "applied").slice(1)}
    </motion.span>
  );
}
