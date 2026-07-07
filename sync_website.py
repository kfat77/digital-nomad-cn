#!/usr/bin/env python3
"""Sync docs/ changes to website/"""
import shutil
from pathlib import Path

DOCS = Path("C:/Users/22617/Documents/kimi/workspace/digital-nomad-cn/docs")
WEBSITE = Path("C:/Users/22617/Documents/kimi/workspace/digital-nomad-cn/website")

files_to_sync = [
    "articles/cost-of-living-analysis/index.html",
    "articles/seasonal-guide/index.html",
    "articles/visa-free-destinations/index.html",
    "articles/giffgaff-lumoza-guide/index.html",
    "404.html",
    "api/index.html",
    "dashboard/perf/index.html",
    "search/index.html",
    "compare/index.html",
    "visa/index.html",
    "routes/index.html",
    "articles/index.html",
]

for rel_path in files_to_sync:
    src = DOCS / rel_path
    dst = WEBSITE / rel_path
    if src.exists():
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        print(f"  Synced: {rel_path}")

print("Done!")
