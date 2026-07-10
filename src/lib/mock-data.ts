import type { Cadet } from "./types";

/** ข้อมูลตัวอย่าง นรต. สำหรับเดโม (แทนที่ด้วย API/DB จริงภายหลัง) */
export const MOCK_CADETS: Cadet[] = [
  { id: "1", order: 1, rank: "นรต.", firstName: "ธนกฤต", lastName: "ศรีสุข", company: "ร้อย 1" },
  { id: "2", order: 2, rank: "นรต.", firstName: "ปวริศ", lastName: "วงศ์ไทย", company: "ร้อย 1" },
  { id: "3", order: 3, rank: "นรต.", firstName: "กิตติพงศ์", lastName: "แก้วมณี", company: "ร้อย 1" },
  { id: "4", order: 4, rank: "นรต.", firstName: "อนุชา", lastName: "ทองดี", company: "ร้อย 2" },
  { id: "5", order: 5, rank: "นรต.", firstName: "ภาณุพงศ์", lastName: "จันทร์เพ็ญ", company: "ร้อย 2" },
  { id: "6", order: 6, rank: "นรต.", firstName: "ชยพล", lastName: "รัตนโชติ", company: "ร้อย 2" },
  { id: "7", order: 7, rank: "นรต.", firstName: "ณัฐวุฒิ", lastName: "พรหมมา", company: "ร้อย 3" },
  { id: "8", order: 8, rank: "นรต.", firstName: "สุทธิพงษ์", lastName: "บุญมี", company: "ร้อย 3" },
];
