"""
Seeds the videos/rituals/images tables with the site's built-in content
(ported from the frontend's src/data/content.js) plus the default set of
sealed (paid) items from ContentContext.jsx. Idempotent: runs once, does
nothing on later startups since the videos table is no longer empty.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.content import Image, Ritual, Video

DEFAULT_LOCKED_SLUGS = {"the-black-sun-vigil", "council-of-thirteen", "the-last-screening"}

RITUALS = [
    {"slug": "the-first-candle", "step": "I", "title": "THE FIRST CANDLE", "img": "/assets/archive-altar.jpg", "duration": "Station 1 · Threshold", "desc": "A single flame lit in silence marks the seeker's intent. Nothing is spoken. The candle burns for exactly one hour while the initiate reflects on the question that brought them here.", "tags": ["Silence", "Intent", "Flame"]},
    {"slug": "the-circle-of-thirteen", "step": "II", "title": "THE CIRCLE OF THIRTEEN", "img": "/assets/archive-ritual.jpg", "duration": "Station 2 · Gathering", "desc": "Twelve keepers and one empty place. The initiate is invited to stand in the gap and complete the circle — the visual heart of the Brotherhood mythology.", "tags": ["Circle", "Council", "Belonging"]},
    {"slug": "the-reading-of-sigils", "step": "III", "title": "THE READING OF SIGILS", "img": "/assets/archive-parchment.jpg", "duration": "Station 3 · Study", "desc": "The grimoire is opened at a random page and the initiate is asked to interpret the sigil. There is no right answer; the reading reveals the reader.", "tags": ["Sigils", "Interpretation", "Study"]},
    {"slug": "the-black-sun-vigil", "step": "IV", "title": "THE BLACK SUN VIGIL", "img": "/assets/rituals-hero.jpg", "duration": "Station 4 · Night Watch", "desc": "From midnight until the first light, the initiate keeps watch alone beneath the black sun emblem. The vigil is the longest station and the one most seekers speak of afterwards.", "tags": ["Vigil", "Endurance", "Dawn"]},
    {"slug": "the-mirror-of-the-horned", "step": "V", "title": "THE MIRROR OF THE HORNED", "img": "/assets/archive-baphomet.jpg", "duration": "Station 5 · Confrontation", "desc": "The seeker faces the horned allegory — the fear that guards knowledge — and names it aloud. In the fiction, naming the fear is what unlocks the fifth door.", "tags": ["Allegory", "Fear", "Naming"]},
    {"slug": "the-crossing", "step": "VI", "title": "THE CROSSING", "img": "/assets/archive-silhouette.jpg", "duration": "Station 6 · Passage", "desc": "The initiate walks the candle-lit aisle toward the triangle of light. The doors remain open behind them the entire way; leaving is always allowed.", "tags": ["Passage", "Choice", "Light"]},
    {"slug": "the-sealed-oath", "step": "VII", "title": "THE SEALED OATH", "img": "/assets/community-hero.jpg", "duration": "Station 7 · Oath", "desc": "At the round table the initiate signs the parchment and receives the emblem. The oath is simple: seek, question, and never claim the story is anything but a story.", "tags": ["Oath", "Emblem", "Brotherhood"]},
]

VIDEOS = [
    {"slug": "satanic-mythology", "title": "Satanic Mythology", "tag": "fiction", "dur": "12:46", "img": "/assets/archive-baphomet.jpg", "desc": "How the horned figure travelled from medieval allegory to modern pop culture — and how the Brotherhood fiction reinterprets it.", "views": "1.2M", "date": "Episode 01"},
    {"slug": "hidden-societies", "title": "Hidden Societies", "tag": "theory", "dur": "08:20", "img": "/assets/archive-ritual.jpg", "desc": "A survey of the real historical societies that inspired the mythology, and the theories that grew around them.", "views": "864K", "date": "Episode 02"},
    {"slug": "ancient-mysteries", "title": "Ancient Mysteries", "tag": "fact", "dur": "15:02", "img": "/assets/forbidden-pyramid.jpg", "desc": "Pyramids, alignments and lost libraries. The documented history behind the symbols used throughout the experience.", "views": "2.1M", "date": "Episode 03"},
    {"slug": "new-world-order", "title": "New World Order", "tag": "theory", "dur": "10:44", "img": "/assets/forbidden-city.jpg", "desc": "Where the phrase came from, why it stuck, and how the Brotherhood story uses it as a fictional countdown.", "views": "990K", "date": "Episode 04"},
    {"slug": "the-forbidden-library", "title": "The Forbidden Library", "tag": "fiction", "dur": "09:31", "img": "/assets/archives-hero.jpg", "desc": "A dramatised walk through the six chambers of the Ritual Archive, narrated by the Grand Keeper.", "views": "412K", "date": "Episode 05"},
    {"slug": "the-last-screening", "title": "The Last Screening", "tag": "fiction", "dur": "18:12", "img": "/assets/videos-hero.jpg", "desc": "The feature-length chapter that closes season one. Sealed for initiates until the New Order date.", "views": "—", "date": "Episode 06"},
    {"slug": "council-of-thirteen", "title": "Council of Thirteen", "tag": "fiction", "dur": "11:05", "img": "/assets/community-hero.jpg", "desc": "Inside the round table: how the fictional council makes its decisions and what the empty thirteenth seat means.", "views": "—", "date": "Episode 07"},
    {"slug": "the-eye-over-the-city", "title": "The Eye Over The City", "tag": "theory", "dur": "07:48", "img": "/assets/neworder-hero.jpg", "desc": "Skylines, pyramids and the all-seeing eye — an image breakdown of the New Order key visual.", "views": "533K", "date": "Episode 08"},
]

GALLERY = [
    {"id": "the-throne", "img": "/assets/hero-baphomet.jpg", "title": "The Throne", "cap": "Key visual · Chapter I"},
    {"id": "the-eye-over-the-city", "img": "/assets/neworder-hero.jpg", "title": "The Eye Over The City", "cap": "Key visual · New Order"},
    {"id": "the-circle", "img": "/assets/rituals-hero.jpg", "title": "The Circle", "cap": "Rituals · Station II"},
    {"id": "the-library", "img": "/assets/archives-hero.jpg", "title": "The Library", "cap": "Archives · Entrance"},
    {"id": "the-screening-room", "img": "/assets/videos-hero.jpg", "title": "The Screening Room", "cap": "Videos · Hall"},
    {"id": "the-round-table", "img": "/assets/community-hero.jpg", "title": "The Round Table", "cap": "Community · Council"},
    {"id": "the-gate", "img": "/assets/about-hero.jpg", "title": "The Gate", "cap": "About · Threshold"},
    {"id": "the-wall-of-sigils", "img": "/assets/visuals-hero.jpg", "title": "The Wall of Sigils", "cap": "Visuals · Temple"},
    {"id": "the-forbidden-city", "img": "/assets/forbidden-city.jpg", "title": "The Forbidden City", "cap": "Videos · Theory"},
    {"id": "the-throne-portrait", "img": "/assets/hero-baphomet-mobile.jpg", "title": "The Throne · Portrait", "cap": "Key visual · Mobile", "portrait": True},
    {"id": "the-sealed-door", "img": "/assets/auth-login.jpg", "title": "The Sealed Door", "cap": "Login · Key visual", "portrait": True},
    {"id": "the-oath", "img": "/assets/auth-register.jpg", "title": "The Oath", "cap": "Register · Key visual", "portrait": True},
]


def _seed_kind(db: Session, model, rows: list[dict], *, slug_key: str, title_key: str, desc_key: str | None, img_key: str, extra_keys: list[str]) -> None:
    for row in rows:
        slug = row[slug_key]
        item = model(
            slug=slug,
            title=row[title_key],
            description=row.get(desc_key) if desc_key else None,
            image_url=row.get(img_key),
            locked=slug in DEFAULT_LOCKED_SLUGS,
            hidden=False,
            is_custom=False,
            extra={k: row[k] for k in extra_keys if k in row},
        )
        db.add(item)


def run(db: Session) -> None:
    already_seeded = db.scalar(select(Video.id).limit(1))
    if already_seeded:
        return

    _seed_kind(db, Ritual, RITUALS, slug_key="slug", title_key="title", desc_key="desc", img_key="img", extra_keys=["step", "duration", "tags"])
    _seed_kind(db, Video, VIDEOS, slug_key="slug", title_key="title", desc_key="desc", img_key="img", extra_keys=["tag", "dur", "views", "date"])
    _seed_kind(db, Image, GALLERY, slug_key="id", title_key="title", desc_key=None, img_key="img", extra_keys=["cap", "portrait"])

    db.commit()
