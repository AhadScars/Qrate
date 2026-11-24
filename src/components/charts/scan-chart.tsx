"use client";

import { useSyncExternalStore } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ScanChart({ data, color = "#4338ca" }: { data: { label: string; scans: number }[]; color?: string }) {
  const ready = useIsClient();
  if (!ready) return <div className="h-64 w-full" />;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#e7e5e4" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#57534e" }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#57534e" }} axisLine={false} tickLine={false} width={32} />
          <Tooltip cursor={{ fill: "#eef2ff" }} />
          <Bar dataKey="scans" fill={color} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
