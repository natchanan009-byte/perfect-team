import type {
  CriteriaConfig,
  ScorePoint,
  StationCriteria,
  StationResult,
  TestResult,
  ResultStatus,
  StationId,
} from "./types";

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

// WeakMap cache: ไม่ต้อง sort ตาราง ซ้ำทุก call — invalidate อัตโนมัติเมื่อ criteria เปลี่ยน
const _sortedTableCache = new WeakMap<object, ScorePoint[]>();

function getSortedTable(station: StationCriteria): StationCriteria["table"] {
  if (_sortedTableCache.has(station)) {
    return _sortedTableCache.get(station)!;
  }
  const sorted = [...station.table].sort((a, b) => a.value - b.value);
  _sortedTableCache.set(station, sorted);
  return sorted;
}

/**
 * แปลงค่าดิบ (จำนวนครั้ง/ฟุต/วินาที) เป็นคะแนน 0-100
 * โดย interpolate เชิงเส้นจากตารางเกณฑ์ที่กำหนด
 * รองรับทั้ง direction "higher" และ "lower" (วิ่ง)
 */
export function scoreForStation(
  station: StationCriteria,
  rawValue: number | null | undefined
): number {
  if (rawValue === null || rawValue === undefined || Number.isNaN(rawValue)) {
    return 0;
  }

  // เรียงตาราง "ตามค่า value" จากน้อยไปมากเสมอ เพื่อ interpolate ได้ถูกต้อง
  const pts = [...station.table].sort((a, b) => a.value - b.value);
  if (pts.length === 0) return 0;

  const v = rawValue;

  // นอกช่วง: หนีบไว้ที่ขอบ (ค่าต่ำสุด/สูงสุดของตาราง)
  if (v <= pts[0].value) return clamp(pts[0].score, 0, 100);
  if (v >= pts[pts.length - 1].value)
    return clamp(pts[pts.length - 1].score, 0, 100);

  // หาช่วงที่ค่าตกอยู่ แล้ว interpolate เชิงเส้น
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (v >= a.value && v <= b.value) {
      const ratio = (v - a.value) / (b.value - a.value || 1);
      const score = a.score + ratio * (b.score - a.score);
      return clamp(Math.round(score), 0, 100);
    }
  }
  return 0;
}

/** แปลง "นาที.วินาที" (เช่น 6.30 = 6 นาที 30 วินาที) -> วินาที */
export function minSecToSeconds(minDotSec: number): number {
  const minutes = Math.floor(minDotSec);
  const seconds = Math.round((minDotSec - minutes) * 100);
  return minutes * 60 + seconds;
}

/** แปลงวินาที -> "M:SS" สำหรับแสดงผล */
export function secondsToDisplay(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * คำนวณผลรวมทั้งหมดจากค่าดิบของ 6 สถานี
 * คืนค่า: คะแนนแต่ละสถานี, คะแนนรวม (เต็ม 600), เฉลี่ย (%), สถานะผ่าน/ไม่ผ่าน
 */
export function computeResult(
  criteria: CriteriaConfig,
  rawValues: Partial<Record<StationId, number | null>>
): TestResult {
  const stationResults: StationResult[] = criteria.stations.map((st) => {
    const raw = rawValues[st.id] ?? null;
    const score = scoreForStation(st, raw);
    const passedStation =
      st.minPassScore === undefined ? true : score >= st.minPassScore;
    return {
      id: st.id,
      label: st.label,
      raw,
      score,
      minPassScore: st.minPassScore,
      passedStation,
    };
  });

  const stationCount = stationResults.length || 1;
  const totalScore = stationResults.reduce((sum, r) => sum + r.score, 0);
  const maxTotal = stationCount * 100;
  const averagePercent = Math.round((totalScore / maxTotal) * 100);

  // กรอกครบทั้ง 6 สถานีหรือยัง (raw ไม่เป็น null)
  const complete = stationResults.every((r) => r.raw !== null);

  const failedStations = stationResults.filter((r) => !r.passedStation);
  const hasStationFail =
    criteria.overall.enforceStationMinimum && failedStations.length > 0;

  let status: ResultStatus;
  if (averagePercent >= criteria.overall.excellentAveragePercent && !hasStationFail) {
    status = "excellent";
  } else if (averagePercent >= criteria.overall.passAveragePercent && !hasStationFail) {
    status = "pass";
  } else if (
    averagePercent >= criteria.overall.passAveragePercent &&
    hasStationFail
  ) {
    // คะแนนเฉลี่ยผ่าน แต่ติดเงื่อนไขสถานีขั้นต่ำ
    status = "conditional_fail";
  } else {
    status = "fail";
  }

  return {
    stations: stationResults,
    totalScore,
    maxTotal,
    averagePercent,
    status,
    complete,
    failedStationIds: failedStations.map((r) => r.id),
  };
}

/** ป้ายกำกับสถานะแบบไทย + สีสำหรับ UI */
export const STATUS_META: Record<
  ResultStatus,
  { label: string; tone: string; color: string }
> = {
  excellent: {
    label: "ผ่านเกณฑ์ดีเยี่ยม",
    tone: "excellent",
    color: "#06B6D4",
  },
  pass: {
    label: "ผ่านเกณฑ์มาตรฐาน",
    tone: "pass",
    color: "#2563EB",
  },
  conditional_fail: {
    label: "ไม่ผ่านตามเงื่อนไขเฉพาะ",
    tone: "conditional",
    color: "#F59E0B",
  },
  fail: {
    label: "ไม่ผ่านเกณฑ์ (ต้องปรับปรุง)",
    tone: "fail",
    color: "#EF4444",
  },
};
