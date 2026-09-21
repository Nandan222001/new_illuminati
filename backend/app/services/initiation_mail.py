"""Send initiation documents to members.

Series:
  * acceptance letter (+ terms + member card) on registration;
  * confidential clearance notice when the initiation is sealed
    (``POST /auth/initiate``), carrying the member's online appointment.

Transport selection:
  * SMTP_HOST configured  -> real delivery over SMTP (STARTTLS, or TLS on 465).
  * otherwise             -> the rendered document is written to
    MAIL_OUTBOX_DIR as a standalone .html file (images embedded as data
    URIs) so the exact transmission can be inspected locally / in CI.

Failures never block auth flows — every public function logs and swallows
transport errors, and callers additionally wrap us in try/except.
"""

from __future__ import annotations

import logging
import re
import smtplib
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from app.core.config import settings
from app.services.initiation_letter import (
    plain_for,
    render_acceptance,
    render_clearance,
    subject_for,
)

log = logging.getLogger("ib.mail")


def _fields_for(user) -> dict:
    """Dynamic per-member values stamped into the documents."""
    return {
        "name": user.name,
        "email": user.email,
        "initiate_number": user.initiate_number,
        "seal_id": user.seal_id or f"IB-{user.initiate_number:04d}-OCULUS",
        "joined": user.created_at.strftime("%d %b %Y"),
    }


def _with_appointment(fields: dict, user) -> dict:
    base = user.paid_at or datetime.now(timezone.utc)
    appt = base + timedelta(days=3)
    return {**fields, "appointed_date": appt.strftime("%d %B %Y"), "appointed_time": "8:00 PM"}


def send_initiation_letter(user) -> None:
    """First transmission: acceptance letter + terms + member card."""
    _send(user, kind="acceptance")


def send_clearance_letter(user) -> None:
    """Second transmission: confidential final clearance notice."""
    _send(user, kind="clearance")


def _send(user, *, kind: str) -> None:
    fields = _fields_for(user)
    if kind == "clearance":
        fields = _with_appointment(fields, user)
    subject = subject_for(kind, fields)

    if settings.SMTP_HOST:
        render = render_acceptance if kind == "acceptance" else render_clearance
        html = render(fields, site_url=settings.SITE_URL, image_mode="url")
        plain = plain_for(kind, fields, site_url=settings.SITE_URL)
        _send_smtp(to=user.email, subject=subject, html=html, plain=plain)
    else:
        # Dev / CI fallback: full-fidelity standalone copy with embedded art.
        render = render_acceptance if kind == "acceptance" else render_clearance
        html = render(fields, site_url=settings.SITE_URL, image_mode="data")
        _write_outbox(email=user.email, subject=subject, html=html, kind=kind)


def _send_smtp(*, to: str, subject: str, html: str, plain: str) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to
    msg.attach(MIMEText(plain, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    try:
        if settings.SMTP_PORT == 465:
            server: smtplib.SMTP = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20)
            server.ehlo()
            server.starttls()
            server.ehlo()
        with server:
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM, [to], msg.as_string())
        log.info("initiation mail sent to %s", to)
    except (smtplib.SMTPException, OSError):
        log.exception("initiation mail FAILED for %s", to)


def _write_outbox(*, email: str, subject: str, html: str, kind: str) -> None:
    outdir = Path(settings.MAIL_OUTBOX_DIR)
    outdir.mkdir(parents=True, exist_ok=True)
    safe = re.sub(r"[^a-zA-Z0-9@.-]", "_", email)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    path = outdir / f"{stamp}-{kind}-{safe}.html"
    path.write_text(html, encoding="utf-8")
    log.info("initiation mail written to outbox: %s (subject: %s)", path, subject)
