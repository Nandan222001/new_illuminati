"""Render sample initiation documents to backend/outbox/ without a database.

Usage:  cd backend && python scripts/demo_initiation_mail.py [name] [number]

Generates the exact transmissions a member receives when the mailer runs in
outbox mode (images embedded):
  * outbox/demo-letter.html     — acceptance letter + terms + member card
  * outbox/demo-clearance.html  — confidential final clearance notice
"""

import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

from app.services.initiation_letter import render_acceptance, render_clearance  # noqa: E402

name = sys.argv[1] if len(sys.argv) > 1 else "Sample Initiate"
number = int(sys.argv[2]) if len(sys.argv) > 2 else 1776

now = datetime.now(timezone.utc)
appt = now + timedelta(days=3)
fields = {
    "name": name,
    "email": "initiate@example.com",
    "initiate_number": number,
    "seal_id": f"IB-{number:04d}-OCULUS",
    "joined": now.strftime("%d %b %Y"),
    "appointed_date": appt.strftime("%d %B %Y"),
    "appointed_time": "8:00 PM",
}

SITE = "https://illuminati.example.com"
out = BACKEND / "outbox"
out.mkdir(exist_ok=True)

letter = out / "demo-letter.html"
letter.write_text(render_acceptance(fields, site_url=SITE, image_mode="data"), encoding="utf-8")
clearance = out / "demo-clearance.html"
clearance.write_text(render_clearance(fields, site_url=SITE, image_mode="data"), encoding="utf-8")

print(f"wrote: {letter}")
print(f"wrote: {clearance}")
