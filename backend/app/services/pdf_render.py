"""Server-side PDF page rendering (poppler's pdftoppm/pdfinfo).

Rendering pages on the server fixes PDFs the browser's pdf.js draws wrongly
(e.g. Chrome-exported gradients over images) and keeps the volume file itself
off the reader's device — the reader only ever receives page images. If poppler
is not installed the API reports ``available() == False`` and the front end falls
back to the in-browser renderer.
"""

from __future__ import annotations

import hashlib
import re
import shutil
import subprocess
from pathlib import Path

from fastapi import HTTPException, status

from app.core.config import settings

ALLOWED_WIDTHS = (640, 900, 1200)
DEFAULT_WIDTH = 900
TIMEOUT_S = 40
_PAGES_RE = re.compile(r"^Pages:\s+(\d+)", re.M)


def available() -> bool:
    return bool(shutil.which("pdftoppm") and shutil.which("pdfinfo"))


def _cache_dir(path: Path) -> Path:
    stamp = f"{path.name}:{path.stat().st_size}:{int(path.stat().st_mtime)}"
    folder = settings.uploads_root / "render-cache" / hashlib.sha256(stamp.encode()).hexdigest()[:24]
    folder.mkdir(parents=True, exist_ok=True)
    return folder


def page_count(path: Path) -> int:
    try:
        out = subprocess.run(
            ["pdfinfo", str(path)], capture_output=True, text=True, timeout=TIMEOUT_S, check=True
        ).stdout
    except (subprocess.SubprocessError, OSError) as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "The volume could not be opened.") from exc
    match = _PAGES_RE.search(out)
    if not match:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "The volume could not be opened.")
    return int(match.group(1))


def render_page(path: Path, page: int, width: int) -> Path:
    """PNG for one page (1-based), cached on disk."""
    if width not in ALLOWED_WIDTHS:
        width = DEFAULT_WIDTH
    total = page_count(path)
    if page < 1 or page > total:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No such page.")
    target = _cache_dir(path) / f"{page}-{width}.png"
    if target.is_file():
        return target
    prefix = target.with_suffix("")
    try:
        subprocess.run(
            [
                "pdftoppm", "-f", str(page), "-l", str(page), "-png", "-singlefile",
                "-scale-to-x", str(width), "-scale-to-y", "-1", str(path), str(prefix),
            ],
            capture_output=True, timeout=TIMEOUT_S, check=True,
        )
    except (subprocess.SubprocessError, OSError) as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "This page could not be rendered.") from exc
    if not target.is_file():
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "This page could not be rendered.")
    return target
