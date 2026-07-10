import type { CriteriaConfig } from "./types";

/**
 * เกณฑ์เริ่มต้น (แก้ไขได้จากหน้า Settings)
 * - แต่ละสถานีใช้ "ตารางแปลงค่า" (table) ที่ระบบจะ interpolate เชิงเส้น
 *   ระหว่างจุด เพื่อให้ได้คะแนนต่อเนื่อง 0-100
 * - direction "higher": ค่ามากยิ่งได้คะแนนมาก
 * - direction "lower": ใช้กับวิ่ง (เวลาน้อย = คะแนนมาก) เก็บเป็น "วินาที"
 *
 * หมายเหตุ: ตัวเลขคะแนนด้านล่างเป็นค่าตั้งต้นตัวอย่างที่สมเหตุสมผล
 * ผู้ดูแลระบบสามารถปรับให้ตรงกับระเบียบจริงได้ทันทีในหน้า Settings
 */
export const DEFAULT_CRITERIA: CriteriaConfig = {
  version: 1,
  overall: {
    passAveragePercent: 60,
    excellentAveragePercent: 80,
    enforceStationMinimum: true,
  },
  stations: [
    {
      id: "pullup",
      label: "ดึงข้อ",
      short: "ดึงข้อ",
      unit: "reps",
      direction: "higher",
      minPassScore: 50,
      step: 1,
      table: [
        { value: 0, score: 0 },
        { value: 4, score: 40 },
        { value: 8, score: 60 },
        { value: 14, score: 80 },
        { value: 20, score: 100 },
      ],
    },
    {
      id: "backext",
      label: "พุ่งหลัง 1 นาที",
      short: "พุ่งหลัง",
      unit: "reps",
      direction: "higher",
      minPassScore: 50,
      step: 1,
      table: [
        { value: 0, score: 0 },
        { value: 20, score: 40 },
        { value: 35, score: 60 },
        { value: 50, score: 80 },
        { value: 65, score: 100 },
      ],
    },
    {
      id: "pushup",
      label: "ดันพื้น",
      short: "ดันพื้น",
      unit: "reps",
      direction: "higher",
      minPassScore: 50,
      step: 1,
      table: [
        { value: 0, score: 0 },
        { value: 20, score: 40 },
        { value: 35, score: 60 },
        { value: 50, score: 80 },
        { value: 70, score: 100 },
      ],
    },
    {
      id: "situp",
      label: "ลุกนั่ง 2 นาที",
      short: "ลุกนั่ง",
      unit: "reps",
      direction: "higher",
      minPassScore: 50,
      step: 1,
      table: [
        { value: 0, score: 0 },
        { value: 30, score: 40 },
        { value: 50, score: 60 },
        { value: 70, score: 80 },
        { value: 90, score: 100 },
      ],
    },
    {
      id: "ropeclimb",
      label: "ไต่เชือก",
      short: "ไต่เชือก",
      unit: "feet",
      direction: "higher",
      minPassScore: 50,
      step: 1,
      table: [
        { value: 0, score: 0 },
        { value: 10, score: 40 },
        { value: 18, score: 60 },
        { value: 25, score: 80 },
        { value: 30, score: 100 },
      ],
    },
    {
      id: "run1600",
      label: "วิ่ง 1,600 เมตร",
      short: "วิ่ง 1,600 ม.",
      unit: "seconds",
      direction: "lower",
      minPassScore: 50,
      step: 1,
      // เก็บเป็นวินาที: 5:30=330s ได้ 100, 8:30=510s ได้ 0
      table: [
        { value: 330, score: 100 }, // 5:30
        { value: 390, score: 80 }, // 6:30
        { value: 420, score: 60 }, // 7:00
        { value: 450, score: 40 }, // 7:30
        { value: 510, score: 0 }, // 8:30
      ],
    },
  ],
};
