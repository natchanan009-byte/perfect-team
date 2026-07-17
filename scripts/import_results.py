"""
import_results.py — นำเข้าผลคะแนนทดสอบสมรรถภาพจาก Excel หรือ CSV เข้าระบบ

รูปแบบไฟล์ที่รองรับ:
  Excel (.xlsx) หรือ CSV (.csv)

คอลัมน์ที่ต้องมีในไฟล์:
  ลำดับ        — เลขลำดับ นรต. (ใช้จับคู่กับรายชื่อในระบบ)
  ดึงข้อ       — จำนวนครั้ง (pullup)
  พุ่งหลัง     — จำนวนครั้ง (backext)
  ดันพื้น      — จำนวนครั้ง (pushup)
  ลุกนั่ง      — จำนวนครั้ง (situp)
  ไต่เชือก     — ฟุต (ropeclimb)
  วิ่ง1600     — นาที.วินาที เช่น 7.30 หมายถึง 7 นาที 30 วินาที (run1600)

หมายเหตุ: คอลัมน์ไหนว่างหรือไม่มี ระบบจะข้ามสถานีนั้น (บันทึกได้แม้ไม่ครบทุกสถานี)

วิธีใช้:
  python import_results.py results.xlsx
  python import_results.py results.csv --url https://perfect-team-main.vercel.app
"""

import sys
import os
import math
import json
import argparse
import requests
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

DEFAULT_URL = os.getenv("API_BASE_URL", "http://localhost:3000")

# แมปชื่อคอลัมน์ → station id
STATION_COLS = {
    "pullup":    ["ดึงข้อ", "pullup", "pull-up", "pull up", "ดึงข้อ(ครั้ง)"],
    "backext":   ["พุ่งหลัง", "backext", "back ext", "พุ่งหลัง(ครั้ง)"],
    "pushup":    ["ดันพื้น", "pushup", "push-up", "push up", "ดันพื้น(ครั้ง)"],
    "situp":     ["ลุกนั่ง", "situp", "sit-up", "sit up", "ลุกนั่ง(ครั้ง)"],
    "ropeclimb": ["ไต่เชือก", "ropeclimb", "rope climb", "ไต่เชือก(ฟุต)"],
    "run1600":   ["วิ่ง1600", "วิ่ง 1600", "run1600", "run 1600", "วิ่ง(นาที.วินาที)", "วิ่ง"],
}
ORDER_COLS = ["ลำดับ", "order", "no", "ลำดับที่", "เลขที่"]


def find_col(df: pd.DataFrame, candidates: list[str]) -> str | None:
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
        raise ValueError(f"ไม่รองรับนามสกุลไฟล์ '{ext}'")


def build_cadet_id(order: int) -> str:
    return f"cadet-{str(order).zfill(3)}"


def safe_float(val) -> float | None:
    """แปลงค่าเป็น float ถ้าทำได้ ไม่งั้นคืน None"""
    try:
        if val is None or (isinstance(val, float) and math.isnan(val)):
            return None
        return float(val)
    except (ValueError, TypeError):
        return None


def parse_rows(df: pd.DataFrame) -> list[dict]:
    order_col = find_col(df, ORDER_COLS)
    if not order_col:
        print(f"❌ ไม่พบคอลัมน์ลำดับ: {ORDER_COLS}")
        print(f"   คอลัมน์ในไฟล์: {list(df.columns)}")
        sys.exit(1)

    station_cols = {sid: find_col(df, cands) for sid, cands in STATION_COLS.items()}
    found_stations = [sid for sid, col in station_cols.items() if col]
    print(f"   พบสถานี: {found_stations}")

    rows = []
    for _, row in df.iterrows():
        order_val = safe_float(row[order_col])
        if order_val is None:
            continue
        order = int(order_val)
        raw_scores = {}
        for sid in found_stations:
            col = station_cols[sid]
            raw_scores[sid] = safe_float(row[col])

        rows.append({
            "cadetId": build_cadet_id(order),
            "rawScores": raw_scores,
        })

    return rows


def import_to_api(rows: list[dict], base_url: str) -> None:
    """ส่งผลคะแนนทีละคนไปยัง PUT /api/results/[cadetId]"""
    base = base_url.rstrip("/")
    ok_count = 0
    fail_count = 0

    print(f"\n📤 กำลังส่งข้อมูล {len(rows)} คน → {base}/api/results/[cadetId]")

    for entry in rows:
        cadet_id = entry["cadetId"]
        # ส่ง rawScores ไปให้ API endpoint เฉพาะที่สร้างไว้สำหรับ raw import
        resp = requests.put(
            f"{base}/api/results/{cadet_id}/raw",
            json=entry["rawScores"],
            headers={"Content-Type": "application/json"},
            timeout=30,
        )
        if resp.status_code == 200:
            ok_count += 1
        else:
            fail_count += 1
            print(f"  ⚠️  {cadet_id}: HTTP {resp.status_code} — {resp.text[:80]}")

    print(f"\n✅ สำเร็จ: {ok_count} คน  |  ❌ ล้มเหลว: {fail_count} คน")


def main() -> None:
    parser = argparse.ArgumentParser(description="นำเข้าผลคะแนนจาก Excel/CSV")
    parser.add_argument("file", help="path ของไฟล์ Excel (.xlsx) หรือ CSV (.csv)")
    parser.add_argument("--url", default=DEFAULT_URL, help=f"API base URL (default: {DEFAULT_URL})")
    parser.add_argument("--dry-run", action="store_true", help="แสดงผลเท่านั้น ไม่ส่งข้อมูลจริง")
    args = parser.parse_args()

    print(f"📂 อ่านไฟล์: {args.file}")
    df = load_file(args.file)
    print(f"   พบ {len(df)} แถว")

    rows = parse_rows(df)
    print(f"   แปลงได้ {len(rows)} คน")

    if args.dry_run:
        print("\n🔍 Dry-run mode — ตัวอย่าง 3 รายการแรก:")
        print(json.dumps(rows[:3], ensure_ascii=False, indent=2))
        return

    import_to_api(rows, args.url)


if __name__ == "__main__":
    main()
