"use client";

import { motion } from "motion/react";

interface StatsCardProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
}

export default function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glow-card rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all duration-300 hover:shadow-[var(--glow-strong)]"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text-muted)]">{label}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-[var(--text-primary)]" data-stat-value={value}>
            {value}
          </p>
        </div>
        {icon && <div className="text-3xl text-[var(--accent)]">{icon}</div>}
      </div>
    </motion.div>
  );
}
