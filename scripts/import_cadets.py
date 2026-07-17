"""
import_cadets.py — นำเข้ารายชื่อ นรต. จากไฟล์ Excel หรือ CSV เข้าระบบ

รูปแบบไฟล์ที่รองรับ:
  Excel (.xlsx) หรือ CSV (.csv)

คอลัมน์ที่ต้องมีในไฟล์ (ชื่อคอลัมน์ภาษาไทยหรืออังกฤษก็ได้):
  ลำดับ     (หรือ order)     — เลขลำดับ 1, 2, 3, ...
  ยศ        (หรือ rank)      — เช่น "นรต." (ถ้าไม่มีจะใส่ "นรต." ให้อัตโนมัติ)
  ชื่อ      (หรือ firstName) — ชื่อจริง
  นามสกุล  (หรือ lastName)  — นามสกุล
  หมวด      (หรือ company)  — เช่น "หมวด 1", "หมวด 2"

วิธีใช้:
  1. ติดตั้ง dependencies:
       pip install -r requirements.txt

  2. ตั้งค่า URL ของเว็บใน .env (หรือส่งเป็น argument):
       API_BASE_URL=https://perfect-team-main.vercel.app

  3. รันสคริปต์:
       python import_cadets.py cadets.xlsx
       python import_cadets.py cadets.csv --url https://perfect-team-main.vercel.app
"""

import sys
import os
import json
import argparse
import requests
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

# ── ค่าเริ่มต้น ──────────────────────────────────────────────────
DEFAULT_URL = os.getenv("API_BASE_URL", "http://localhost:3000")

# แมปชื่อคอลัมน์ที่รองรับ (รองรับทั้งภาษาไทยและอังกฤษ)
COL_MAP = {
    "order":     ["ลำดับ", "order", "no", "ลำดับที่", "เลขที่"],
    "rank":      ["ยศ", "rank"],
    "firstName": ["ชื่อ", "firstname", "ชื่อจริง", "name"],
    "lastName":  ["นามสกุล", "lastname", "surname"],
    "company":   ["หมวด", "company", "กองร้อย", "ตอน"],
}


def find_col(df: pd.DataFrame, candidates: list[str]) -> str | None:
    """หาชื่อคอลัมน์จริงใน DataFrame จาก candidates (case-insensitive)"""
    normalized = {c.strip().lower(): c for c in df.columns}
    for cand in candidates:
        if cand.strip().lower() in normalized:
            return normalized[cand.strip().lower()]
    return None


def load_file(path: str) -> pd.DataFrame:
    ext = os.path.splitext(path)[1].lower()
    if ext == ".csv":
        return pd.read_csv(path, encoding="utf-8-sig")
    elif ext in (".xlsx", ".xls"):
        return pd.read_excel(path)
    else:
        raise ValueError(f"ไม่รองรับนามสกุลไฟล์ '{ext}' — ใช้ .xlsx หรือ .csv เท่านั้น")


def build_cadet_id(order: int) -> str:
    return f"cadet-{str(order).zfill(3)}"


def parse_cadets(df: pd.DataFrame) -> list[dict]:
    # หาคอลัมน์
    cols = {key: find_col(df, candidates) for key, candidates in COL_MAP.items()}

    missing = [key for key, col in cols.items() if col is None and key not in ("rank",)]
    if missing:
        print(f"❌ ไม่พบคอลัมน์: {missing}")
        print(f"   คอลัมน์ในไฟล์: {list(df.columns)}")
        sys.exit(1)

    cadets = []
    for _, row in df.iterrows():
        order = int(row[cols["order"]])
        rank = str(row[cols["rank"]]).strip() if cols["rank"] else "นรต."
        first = str(row[cols["firstName"]]).strip()
        last = str(row[cols["lastName"]]).strip()
        company = str(row[cols["company"]]).strip()

        # ข้ามแถวที่ข้อมูลไม่ครบ
        if not first or not last or first == "nan" or last == "nan":
            continue

        cadets.append({
            "id": build_cadet_id(order),
            "order": order,
            "rank": rank,
            "firstName": first,
            "lastName": last,
            "company": company,
        })

    return cadets


def import_to_api(cadets: list[dict], base_url: str) -> None:
    url = f"{base_url.rstrip('/')}/api/cadets"
    print(f"\n📤 กำลังส่งข้อมูล {len(cadets)} คน → {url}")

    resp = requests.post(
        url,
        json=cadets,
        headers={"Content-Type": "application/json"},
        timeout=60,
    )

    if resp.status_code == 200:
        result = resp.json()
        print(f"✅ นำเข้าสำเร็จ: {result.get('imported', '?')} คน")
    else:
        print(f"❌ เกิดข้อผิดพลาด HTTP {resp.status_code}: {resp.text}")
        sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(description="นำเข้ารายชื่อ นรต. จาก Excel/CSV")
    parser.add_argument("file", help="path ของไฟล์ Excel (.xlsx) หรือ CSV (.csv)")
    parser.add_argument("--url", default=DEFAULT_URL, help=f"API base URL (default: {DEFAULT_URL})")
    parser.add_argument("--dry-run", action="store_true", help="แสดงผลเท่านั้น ไม่ส่งข้อมูลจริง")
    args = parser.parse_args()

    print(f"📂 อ่านไฟล์: {args.file}")
    df = load_file(args.file)
    print(f"   พบ {len(df)} แถว")

    cadets = parse_cadets(df)
    print(f"   แปลงได้ {len(cadets)} คน")

    if args.dry_run:
        print("\n🔍 Dry-run mode — ตัวอย่างข้อมูล 3 รายการแรก:")
        print(json.dumps(cadets[:3], ensure_ascii=False, indent=2))
        return

    import_to_api(cadets, args.url)


if __name__ == "__main__":
    main()
