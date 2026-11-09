"""Razorpay plumbing shared by the membership fee and the one-book sale page.

Credentials live in the database (Admin → Settings → Razorpay) with environment
variables as a fallback; only the public key ever leaves the server.
"""

import base64
import json
import logging
import urllib.error
import urllib.request

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.crud import admin as admin_crud

log = logging.getLogger(__name__)

RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders"


def _pick(cfg: dict, *names: str) -> str:
    for name in names:
        value = cfg.get(name)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return ""


def razorpay_config(db: Session) -> dict:
    """Razorpay credentials: the database row first, env vars as a fallback."""
    cfg = admin_crud.get_settings(db).razorpay or {}
    if not isinstance(cfg, dict):
        cfg = {}
    return {
        "keyId": _pick(cfg, "keyId", "key_id", "razorpay_key_id", "RAZORPAY_KEY_ID") or settings.RAZORPAY_KEY_ID,
        "keySecret": _pick(cfg, "keySecret", "key_secret", "razorpay_key_secret", "RAZORPAY_KEY_SECRET") or settings.RAZORPAY_KEY_SECRET,
        "webhookSecret": _pick(cfg, "webhookSecret", "webhook_secret", "razorpay_webhook_secret") or settings.RAZORPAY_WEBHOOK_SECRET,
    }


def require_keys(db: Session) -> dict:
    """The configured credentials, or a 503 explaining that payments are off."""
    cfg = razorpay_config(db)
    if not cfg.get("keyId") or not cfg.get("keySecret"):
        log.error("Razorpay keyId/keySecret missing in admin_settings.razorpay (id=1) and env; cannot create order")
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Payments are not configured yet.")
    return cfg


def create_order(key_id: str, key_secret: str, payload: dict) -> dict:
    token = base64.b64encode(f"{key_id}:{key_secret}".encode()).decode()
    req = urllib.request.Request(
        RAZORPAY_ORDERS_URL,
        data=json.dumps(payload).encode(),
        headers={"Authorization": f"Basic {token}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as res:  # noqa: S310 (fixed https URL)
            return json.loads(res.read())
    except urllib.error.HTTPError as exc:
        log.error("Razorpay order creation failed: %s %s", exc.code, exc.read()[:300])
    except Exception:  # noqa: BLE001
        log.exception("Razorpay order creation failed")
    raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Could not start the payment. Please try again.")
