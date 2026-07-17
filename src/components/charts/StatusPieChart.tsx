"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { ResultStatus } from "@/lib/types";
import { STATUS_META } from "@/lib/scoring";

interface Props {
  data: { status: ResultStatus; count: number }[];
}

/** กราฟวงกลมสรุปสัดส่วนผ่าน/ไม่ผ่าน (แยกตามสถานะ) */
export function StatusPieChart({ data }: Props) {
  const chartData = data.map((d) => ({
    name: STATUS_META[d.status].label,
    value: d.count,
    color: STATUS_META[d.status].color,
  }));

  const total = data.reduce((a, d) => a + d.count, 0);

  if (total === 0) {
    return (
      <div className="grid h-56 place-items-center text-sm text-slate-400">
        ยังไม่มีข้อมูลที่บันทึกครบ
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          stroke="none"
        >
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`${value} คน`, ""]}
          contentStyle={{
            borderRadius: 12,
            border: "none",
            boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
            fontSize: 13,
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
