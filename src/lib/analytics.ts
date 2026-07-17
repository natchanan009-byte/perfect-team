import type {
  Cadet,
  CriteriaConfig,
  ResultStatus,
  StationId,
  TestResult,
} from "./types";

/** ผลรวมของ นรต. หนึ่งคน (ผูกกับข้อมูลตัว นรต. เพื่อแสดงในตาราง) */
export interface CadetResult {
  cadet: Cadet;
  result: TestResult;
}

/** กลุ่มผลการทดสอบ 3 กลุ่มหลัก */
export interface GroupBucket {
  key: "excellent" | "standard" | "improve";
  label: string;
  color: string;
  members: CadetResult[];
}

/**
 * แบ่งกลุ่มผู้ทดสอบเป็น 3 กลุ่ม จากสถานะที่ engine คำนวณ:
 *  - excellent  = ผ่านเกณฑ์ดีเยี่ยม
 *  - standard   = ผ่านเกณฑ์มาตรฐาน
 *  - improve    = ไม่ผ่าน (รวม fail + conditional_fail = ต้องปรับปรุง)
 * รับเฉพาะรายการที่กรอกครบแล้ว (complete)
 */
export function groupResults(
  cadets: Cadet[],
  results: Record<string, TestResult>
): GroupBucket[] {
  const buckets: GroupBucket[] = [
    { key: "excellent", label: "ผ่านเกณฑ์ดีเยี่ยม", color: "#06B6D4", members: [] },
    { key: "standard", label: "ผ่านเกณฑ์มาตรฐาน", color: "#2563EB", members: [] },
    { key: "improve", label: "ไม่ผ่านเกณฑ์ (ต้องปรับปรุง)", color: "#EF4444", members: [] },
  ];

  for (const cadet of cadets) {
    const result = results[cadet.id];
    if (!result || !result.complete) continue;

    const entry: CadetResult = { cadet, result };
    if (result.status === "excellent") buckets[0].members.push(entry);
    else if (result.status === "pass") buckets[1].members.push(entry);
    else buckets[2].members.push(entry); // fail + conditional_fail
  }

  // เรียงสมาชิกในกลุ่มตามคะแนนรวมมาก -> น้อย
  for (const b of buckets) {
    b.members.sort((a, z) => z.result.totalScore - a.result.totalScore);
  }

  return buckets;
}

/** นับจำนวนตามสถานะ (สำหรับ Pie Chart ผ่าน/ไม่ผ่าน แบบละเอียด) */
export function statusBreakdown(
  results: Record<string, TestResult>
): { status: ResultStatus; count: number }[] {
  const counts: Record<ResultStatus, number> = {
    excellent: 0,
    pass: 0,
    conditional_fail: 0,
    fail: 0,
  };
  for (const r of Object.values(results)) {
    if (r.complete) counts[r.status] += 1;
  }
  return (Object.keys(counts) as ResultStatus[])
    .map((status) => ({ status, count: counts[status] }))
    .filter((x) => x.count > 0);
}

/** คะแนนเฉลี่ยรายสถานี — เพื่อหาว่าสถานีไหนภาพรวมอ่อนสุด (Bar Chart) */
export function stationAverages(
  criteria: CriteriaConfig,
  results: Record<string, TestResult>
): { id: StationId; label: string; short: string; avg: number }[] {
  const completed = Object.values(results).filter((r) => r.complete);

  return criteria.stations.map((st) => {
    if (completed.length === 0) {
      return { id: st.id, label: st.label, short: st.short, avg: 0 };
    }
    const sum = completed.reduce((acc, r) => {
      const sr = r.stations.find((s) => s.id === st.id);
      return acc + (sr?.score ?? 0);
    }, 0);
    return {
      id: st.id,
      label: st.label,
      short: st.short,
      avg: Math.round(sum / completed.length),
    };
  });
}

/** สรุปภาพรวม (การ์ดสถิติด้านบน Dashboard) */
export function overallSummary(
  cadets: Cadet[],
  results: Record<string, TestResult>
) {
  const completed = Object.values(results).filter((r) => r.complete);
  const total = cadets.length;
  const tested = completed.length;
  const passed = completed.filter(
    (r) => r.status === "excellent" || r.status === "pass"
  ).length;
  const avgScore =
    tested > 0
      ? Math.round(completed.reduce((a, r) => a + r.totalScore, 0) / tested)
      : 0;
  const passRate = tested > 0 ? Math.round((passed / tested) * 100) : 0;

  return { total, tested, passed, avgScore, passRate };
}
