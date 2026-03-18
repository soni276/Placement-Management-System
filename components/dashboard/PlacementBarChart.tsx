"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface DataItem {
  company: string;
  selected_students: number;
}

export default function PlacementBarChart({ data }: { data: DataItem[] }) {
  if (!data?.length) return null;
  return (
    <div className="h-52 w-full min-h-[200px] sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-violet-200" />
          <XAxis
            dataKey="company"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e4e4e7",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="selected_students" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Selected" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
