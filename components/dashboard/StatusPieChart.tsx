"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface DataItem {
  status: string;
  count: number;
}

const COLORS = ["#7c3aed", "#a78bfa", "#c4b5fd", "#ddd6fe"];

export default function StatusPieChart({ data }: { data: DataItem[] }) {
  if (!data?.length) return null;
  return (
    <div className="h-56 min-h-[200px] w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
