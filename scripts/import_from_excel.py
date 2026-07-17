# -*- coding: utf-8 -*-
"""
import_from_excel.py
Import cadet data and/or test results from the fitness test Excel file.

Usage:
  pip install -r requirements.txt

  # Test parse only (no API calls)
  python import_from_excel.py --file "<path to xlsx>" --dry-run

  # Import results to production
  python import_from_excel.py --file "<path>" --url https://perfect-team-main.vercel.app

  # Import cadet list only
  python import_from_excel.py --file "<path>" --mode cadets --url https://...
"""

import os
import sys
import math
import json
import argparse
import requests
import pandas as pd

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

DEFAULT_URL = os.environ.get("API_BASE_URL", "http://localhost:3000")

# Column positions (0-indexed) after reading with header=3 and skipping sub-header row
COL_ORDER   = 0
COL_RANK    = 1
COL_FIRST   = 2
COL_LAST    = 3
COL_PULLUP  = 4   # station 1: pull-up (reps)
COL_BACKEXT = 6   # station 2: back extension 1min (reps)
COL_PUSHUP  = 8   # station 3: push-up (reps)
COL_SITUP   = 10  # station 4: sit-up 2min (reps)
COL_RUN1600 = 12  # station 5: 1600m run (min.sec)


def safe_float(val):
    try:
        if val is None:
            return None
        if isinstance(val, float) and math.isnan(val):
            return None
        return float(val)
    except (ValueError, TypeError):
        return None


def build_cadet_id(order):
    return "cadet-" + str(order).zfill(3)


def load_excel(path):
    df = pd.read_excel(path, header=3)
    # Row index 0 is a sub-header row (column labels) -- skip it
    df = df.iloc[1:].reset_index(drop=True)
    # Keep only rows that have a numeric order value
    df = df[df.iloc[:, COL_ORDER].apply(lambda v: safe_float(v) is not None)]
    return df.reset_index(drop=True)


def build_results(df):
    rows = []
    for _, row in df.iterrows():
        order = int(safe_float(row.iloc[COL_ORDER]))
        raw_scores = {
            "pullup":    safe_float(row.iloc[COL_PULLUP]),
            "backext":   safe_float(row.iloc[COL_BACKEXT]),
            "pushup":    safe_float(row.iloc[COL_PUSHUP]),
            "situp":     safe_float(row.iloc[COL_SITUP]),
            "run1600":   safe_float(row.iloc[COL_RUN1600]),
            "ropeclimb": None,  # Not in this 5-station file
        }
        rows.append({"cadetId": build_cadet_id(order), "rawScores": raw_scores})
    return rows


def import_results(rows, base_url):
    base = base_url.rstrip("/")
    ok, fail = 0, 0
    print("[SEND] Uploading results for", len(rows), "cadets ->", base + "/api/results/[cadetId]/raw")
    for entry in rows:
        try:
            resp = requests.put(
                base + "/api/results/" + entry["cadetId"] + "/raw",
                json=entry["rawScores"],
                headers={"Content-Type": "application/json"},
                timeout=30,
            )
            if resp.status_code == 200:
                ok += 1
            else:
                fail += 1
                print("[WARN]", entry["cadetId"], "HTTP", resp.status_code, "-", resp.text[:80])
        except Exception as e:
            fail += 1
            print("[ERR]", entry["cadetId"], str(e))
    print("[OK] Imported:", ok, "  [ERR] Failed:", fail)


def build_cadets(df):
    cadets = []
    for _, row in df.iterrows():
        order = int(safe_float(row.iloc[COL_ORDER]))
        rank  = str(row.iloc[COL_RANK]).strip()
        first = str(row.iloc[COL_FIRST]).strip()
        last  = str(row.iloc[COL_LAST]).strip()
        if first in ("nan", "") or last in ("nan", ""):
            continue
        cadets.append({
            "id":        build_cadet_id(order),
            "order":     order,
            "rank":      rank if rank not in ("nan", "") else "nrt.",
            "firstName": first,
            "lastName":  last,
            "company":   "N/A",  # Not available in this file
        })
    return cadets


def import_cadets(cadets, base_url):
    url = base_url.rstrip("/") + "/api/cadets"
    print("[SEND] Uploading", len(cadets), "cadets ->", url)
    resp = requests.post(url, json=cadets,
                         headers={"Content-Type": "application/json"}, timeout=60)
    if resp.status_code == 200:
        print("[OK] Imported:", resp.json().get("imported", "?"))
    else:
        print("[ERR] HTTP", resp.status_code, "-", resp.text)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Import data from fitness test Excel file")
    parser.add_argument("--file", required=True, help="Path to .xlsx file")
    parser.add_argument("--url",  default=DEFAULT_URL, help="API base URL")
    parser.add_argument("--mode", choices=["results", "cadets"], default="results")
    parser.add_argument("--dry-run", action="store_true", help="Parse only, no API calls")
    args = parser.parse_args()

    print("[FILE] Reading:", args.file)
    df = load_excel(args.file)
    print("       Found", len(df), "rows")

    if args.mode == "results":
        rows = build_results(df)
        if args.dry_run:
            print("[TEST] First 3 results:")
            print(json.dumps(rows[:3], ensure_ascii=False, indent=2))
        else:
            import_results(rows, args.url)

    elif args.mode == "cadets":
        cadets = build_cadets(df)
        if args.dry_run:
            print("[TEST] First 3 cadets:")
            print(json.dumps(cadets[:3], ensure_ascii=False, indent=2))
        else:
            import_cadets(cadets, args.url)


if __name__ == "__main__":
    main()
