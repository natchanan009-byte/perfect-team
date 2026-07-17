# Scripts — นำเข้าข้อมูลจาก Excel/CSV ด้วย Python

## ติดตั้ง

```bash
cd scripts
pip install -r requirements.txt
```

---

## 1. นำเข้ารายชื่อ นรต. (`import_cadets.py`)

### รูปแบบไฟล์ (Excel หรือ CSV)

| ลำดับ | ยศ | ชื่อ | นามสกุล | หมวด |
|---|---|---|---|---|
| 1 | นรต. | สมชาย | ใจดี | หมวด 1 |
| 2 | นรต. | วิชัย | มานะ | หมวด 2 |

ดูตัวอย่างได้ที่ `template_cadets.csv`

### วิธีใช้

```bash
# ทดสอบดูก่อน (ไม่ส่งข้อมูลจริง)
python import_cadets.py template_cadets.csv --dry-run

# นำเข้าไปยัง production (Vercel)
python import_cadets.py cadets.xlsx --url https://perfect-team-main.vercel.app

# นำเข้าไปยัง local dev server
python import_cadets.py cadets.xlsx
```

---

## 2. นำเข้าผลคะแนน (`import_results.py`)

### รูปแบบไฟล์ (Excel หรือ CSV)

| ลำดับ | ดึงข้อ | พุ่งหลัง | ดันพื้น | ลุกนั่ง | ไต่เชือก | วิ่ง1600 |
|---|---|---|---|---|---|---|
| 1 | 15 | 52 | 35 | 65 | 22 | 6.45 |
| 2 | 12 | 48 | 30 | 60 | 20 | 7.10 |

> **หมายเหตุ วิ่ง1600:** ใส่เป็น นาที.วินาที เช่น `6.45` = 6 นาที 45 วินาที, `7.00` = 7 นาที 0 วินาที

> คอลัมน์ไหนว่างหรือไม่มี ระบบบันทึกเฉพาะสถานีที่มีข้อมูล

ดูตัวอย่างได้ที่ `template_results.csv`

### วิธีใช้

```bash
# ทดสอบดูก่อน
python import_results.py template_results.csv --dry-run

# นำเข้าไปยัง production
python import_results.py results.xlsx --url https://perfect-team-main.vercel.app

# นำเข้าไปยัง local dev server
python import_results.py results.xlsx
```

---

## ตั้งค่า URL ผ่าน .env (ไม่ต้องพิมพ์ --url ทุกครั้ง)

สร้างไฟล์ `scripts/.env`:

```env
API_BASE_URL=https://perfect-team-main.vercel.app
```

---

## ลำดับขั้นตอนที่แนะนำ

1. นำเข้ารายชื่อ นรต. ก่อน (`import_cadets.py`)
2. จากนั้นนำเข้าผลคะแนน (`import_results.py`)
3. ระบบจับคู่ข้อมูลด้วย **เลขลำดับ** (ลำดับ 1 = cadet-001)
