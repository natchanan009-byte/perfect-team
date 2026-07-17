"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";

interface Props {
  /** คะแนนเฉลี่ยรายสถานี */
  data: { short: string; avg: number }[];
}

/** ไล่สีตามคะแนน: ต่ำ=แดง, กลาง=น้ำเงิน, สูง=ฟ้า */
function colorFor(v: number) {
  if (v >= 80) return "#06B6D4";
  if (v >= 60) return "#2563EB";
  if (v >= 50) return "#F59E0B";
  return "#EF4444";
}

/** กราฟแท่งคะแนนเฉลี่ยแต่ละสถานี — ดูว่าสถานีไหนภาพรวมต่ำสุด */
export function StationBarChart({ data }: Props) {
  const hasData = data.some((d) => d.avg > 0);
  if (!hasData) {
    return (
      <div className="grid h-56 place-items-center text-sm text-slate-400">
        ยังไม่มีข้อมูลที่บันทึกครบ
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis
          dataKey="short"
          tick={{ fontSize: 11, fill: "#64748B" }}
          interval={0}
          angle={-15}
          textAnchor="end"
          height={50}
        />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748B" }} />
        <Tooltip
          cursor={{ fill: "rgba(37,99,235,0.06)" }}
          formatter={(value: number) => [`${value} คะแนน`, "เฉลี่ย"]}
          contentStyle={{
            borderRadius: 12,
            border: "none",
            boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
            fontSize: 13,
          }}
        />
        <Bar dataKey="avg" radius={[8, 8, 0, 0]} maxBarSize={48}>
          {data.map((d, i) => (
            <Cell key={i} fill={colorFor(d.avg)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
