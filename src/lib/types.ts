// ─────────────────────────────────────────────────────────────
// Domain types — ระบบทดสอบสมรรถภาพร่างกาย นรต.
// ─────────────────────────────────────────────────────────────

/** รหัสสถานีทั้ง 6 */
export type StationId =
  | "pullup" // 1. ดึงข้อ (ครั้ง)
  | "backext" // 2. พุ่งหลัง 1 นาที (ครั้ง)
  | "pushup" // 3. ดันพื้น (ครั้ง)
  | "situp" // 4. ลุกนั่ง 2 นาที (ครั้ง)
  | "ropeclimb" // 5. ไต่เชือก (ฟุต)
  | "run1600"; // 6. วิ่ง 1,600 เมตร (นาที.วินาที)

export type Unit = "reps" | "feet" | "seconds";

/** ทิศทางการให้คะแนน: higher = มาก/ไกลยิ่งดี, lower = เวลาน้อยยิ่งดี */
export type ScoreDirection = "higher" | "lower";

/** จุดในตารางแปลงค่า -> คะแนน (ใช้ interpolate ระหว่างจุด) */
export interface ScorePoint {
  /** ค่าดิบ: จำนวนครั้ง / ฟุต / วินาที(สำหรับวิ่ง) */
  value: number;
  /** คะแนนที่ได้ ณ ค่านั้น (0-100) */
  score: number;
}

/** เกณฑ์ของแต่ละสถานี — ปรับได้ทั้งหมดจากหน้า Settings */
export interface StationCriteria {
  id: StationId;
  label: string;
  short: string;
  unit: Unit;
  direction: ScoreDirection;
  /** คะแนนขั้นต่ำที่ถือว่า "ผ่าน" สถานีนี้ (เงื่อนไขเฉพาะ) */
  minPassScore: number;
  /** ตารางแปลงค่า เรียงตาม value จากน้อยไปมาก */
  table: ScorePoint[];
  /** ก้าวการกด +/- (reps=1) */
  step: number;
}

/** เกณฑ์การตัดสินภาพรวม — ปรับได้จาก Settings */
export interface OverallCriteria {
  /** คะแนนเฉลี่ย (%) ขั้นต่ำเพื่อ "ผ่านเกณฑ์มาตรฐาน" */
  passAveragePercent: number;
  /** คะแนนเฉลี่ย (%) เพื่อจัดเป็น "ดีเยี่ยม" */
  excellentAveragePercent: number;
  /**
   * ถ้า true: แม้คะแนนเฉลี่ยผ่าน แต่ถ้ามีสถานีใดต่ำกว่า minPassScore
   * จะถือว่า "ไม่ผ่านตามเงื่อนไขเฉพาะ"
   */
  enforceStationMinimum: boolean;
}

export interface CriteriaConfig {
  stations: StationCriteria[];
  overall: OverallCriteria;
  version: number;
}

// ── ข้อมูลผู้เข้าทดสอบ ────────────────────────────────────────
export interface Cadet {
  id: string;
  order: number; // เลขลำดับ
  rank: string; // ยศ เช่น "นรต."
  firstName: string;
  lastName: string;
  company: string; // กองร้อย/ตอน
  studentCode?: string; // เลขประจำตัว นรต. (ถ้ามี)
}

/** ค่าดิบที่กรอกในแต่ละสถานี (null = ยังไม่กรอก) */
export type RawScores = Record<StationId, number | null>;

export type ResultStatus = "excellent" | "pass" | "conditional_fail" | "fail";

/** ผลการคำนวณของแต่ละสถานี */
export interface StationResult {
  id: StationId;
  label: string;
  raw: number | null;
  score: number; // 0-100
  minPassScore: number;
  passedStation: boolean; // ผ่าน minPassScore ไหม
}

/** ผลรวมทั้งชุด — คำนวณจาก computeResult() */
export interface TestResult {
  cadetId?: string; // ใส่ตอนบันทึกลง store
  stations: StationResult[];
  totalScore: number; // เต็ม 600
  maxTotal: number; // 600
  averagePercent: number; // 0-100
  status: ResultStatus;
  complete: boolean; // กรอกครบ 6 สถานีหรือยัง
  failedStationIds: StationId[];
  evaluatedAt?: string; // ISO — ใส่ตอนบันทึก
  criteriaVersion?: number;
}
