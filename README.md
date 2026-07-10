# ระบบบันทึกและประมวลผลสถิติทดสอบสมรรถภาพร่างกายดิจิทล (นรต.)

Responsive Web App (Mobile-First) สำหรับบันทึกผลทดสอบสมรรถภาพ 6 สถานี พร้อมคำนวณคะแนนแบบเรียลไทม์และแบ่งกลุ่มอัตโนมัติ

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (theme สีฟ้า-ขาว + glassmorphism)
- Framer Motion (page transitions, count-up, micro-interactions)
- Zustand (state กลาง + real-time scoring)
- Recharts (Pie / Bar chart) — ใช้ในหน้า Analytics
- Lucide React (icons)

## เริ่มใช้งาน
```bash
npm install
npm run dev
```
เปิด http://localhost:3000 — เข้าสู่ระบบด้วย `admin` / `1234` (mock)

## โครงสร้างโปรเจกต์
```
src/
├─ app/
│  ├─ layout.tsx          # root + font Prompt + AuthProvider
│  ├─ page.tsx            # redirect ตามสถานะ login
│  ├─ login/page.tsx      # หน้าเข้าสู่ระบบ
│  ├─ dashboard/page.tsx  # เมนูหลัก
│  ├─ entry/              # (ส่วนถัดไป) หน้ากรอกคะแนน
│  └─ analytics/          # (ส่วนถัดไป) หน้าสรุป & แบ่งกลุ่ม
├─ components/
│  ├─ AuthProvider.tsx    # session + remember me + route guard
│  ├─ Logo.tsx
│  └─ ui/ (Button, GlassCard, AnimatedInput)
├─ lib/
│  ├─ types.ts            # โครงสร้างข้อมูลทั้งหมด
│  ├─ default-criteria.ts # เกณฑ์เริ่มต้น 6 สถานี (ปรับได้)
│  ├─ scoring.ts          # ⭐ Scoring Engine (pure functions)
│  ├─ mock-data.ts
│  └─ utils.ts
└─ store/
   └─ useAppStore.ts      # Zustand: criteria, cadets, draft
```

## หัวใจของระบบ: Scoring Engine
- แต่ละสถานีมี "ตารางแปลงค่า → คะแนน" (interpolation table) ที่ปรับได้ในหน้า Settings
- รองรับทั้งค่ายิ่งมากยิ่งดี (ดึงข้อ) และยิ่งน้อยยิ่งดี (วิ่ง 1,600 ม.)
- คำนวณ: คะแนนรายสถานี → รวม (เต็ม 600) → เฉลี่ย % → สรุปผล (ผ่าน/ไม่ผ่าน/ไม่ผ่านเงื่อนไขเฉพาะ)
