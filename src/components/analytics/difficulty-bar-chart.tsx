"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DifficultyDatum = {
  label: string;
  acceptedSubmissions: number;
  pendingSubmissions: number;
  needsImprovementSubmissions: number;
};

export function DifficultyBarChart({
  data,
}: {
  data: DifficultyDatum[];
}) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={24}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              border: "1px solid rgba(148, 163, 184, 0.2)",
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              color: "#e2e8f0",
            }}
          />
          <Legend />
          <Bar
            dataKey="acceptedSubmissions"
            fill="#34d399"
            radius={[12, 12, 0, 0]}
            name="Accepted"
          />
          <Bar
            dataKey="pendingSubmissions"
            fill="#94a3b8"
            radius={[12, 12, 0, 0]}
            name="Pending"
          />
          <Bar
            dataKey="needsImprovementSubmissions"
            fill="#f59e0b"
            radius={[12, 12, 0, 0]}
            name="Needs Improvement"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
