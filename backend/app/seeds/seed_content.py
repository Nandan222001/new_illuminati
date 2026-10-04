"""
Seeds the videos/rituals/images tables with the site's built-in content
(ported from the frontend's src/data/content.js) plus the default set of
sealed (paid) items from ContentContext.jsx. Idempotent: runs once, does
nothing on later startups since the videos table is no longer empty.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.content import Archive, Book, Image, Ritual, Video

DEFAULT_LOCKED_SLUGS = {
    "the-black-sun-vigil",
    "council-of-thirteen",
    "the-last-screening",
    "a-field-guide-to-hidden-symbols",
    "the-new-world-order-dossier",
    "rituals-a-stage-manual",
}

RITUALS = [
    {"slug": "the-first-candle", "step": "I", "title": "THE FIRST CANDLE", "img": "/assets/archive-altar.jpg", "duration": "Station 1 · Threshold", "desc": "A single flame lit in silence marks the seeker's intent. Nothing is spoken. The candle burns for exactly one hour while the initiate reflects on the question that brought them here.", "tags": ["Silence", "Intent", "Flame"], "video_url": ""},
    {"slug": "the-circle-of-thirteen", "step": "II", "title": "THE CIRCLE OF THIRTEEN", "img": "/assets/archive-ritual.jpg", "duration": "Station 2 · Gathering", "desc": "Twelve keepers and one empty place. The initiate is invited to stand in the gap and complete the circle — the visual heart of the Brotherhood mythology.", "tags": ["Circle", "Council", "Belonging"], "video_url": ""},
    {"slug": "the-reading-of-sigils", "step": "III", "title": "THE READING OF SIGILS", "img": "/assets/archive-parchment.jpg", "duration": "Station 3 · Study", "desc": "The grimoire is opened at a random page and the initiate is asked to interpret the sigil. There is no right answer; the reading reveals the reader.", "tags": ["Sigils", "Interpretation", "Study"], "video_url": ""},
    {"slug": "the-black-sun-vigil", "step": "IV", "title": "THE BLACK SUN VIGIL", "img": "/assets/rituals-hero.jpg", "duration": "Station 4 · Night Watch", "desc": "From midnight until the first light, the initiate keeps watch alone beneath the black sun emblem. The vigil is the longest station and the one most seekers speak of afterwards.", "tags": ["Vigil", "Endurance", "Dawn"], "video_url": ""},
    {"slug": "the-mirror-of-the-horned", "step": "V", "title": "THE MIRROR OF THE HORNED", "img": "/assets/archive-baphomet.jpg", "duration": "Station 5 · Confrontation", "desc": "The seeker faces the horned allegory — the fear that guards knowledge — and names it aloud. In the story, naming the fear is what unlocks the fifth door.", "tags": ["Allegory", "Fear", "Naming"], "video_url": ""},
    {"slug": "the-crossing", "step": "VI", "title": "THE CROSSING", "img": "/assets/archive-silhouette.jpg", "duration": "Station 6 · Passage", "desc": "The initiate walks the candle-lit aisle toward the triangle of light. The doors remain open behind them the entire way; leaving is always allowed.", "tags": ["Passage", "Choice", "Light"], "video_url": ""},
    {"slug": "the-sealed-oath", "step": "VII", "title": "THE SEALED OATH", "img": "/assets/community-hero.jpg", "duration": "Station 7 · Oath", "desc": "At the round table the initiate signs the parchment and receives the emblem. The oath is simple: seek, question, and never claim the story is anything but a story.", "tags": ["Oath", "Emblem", "Brotherhood"], "video_url": ""},
]

VIDEOS = [
    {"slug": "satanic-mythology", "title": "Satanic Mythology", "tag": "fiction", "dur": "12:46", "img": "/assets/archive-baphomet.jpg", "desc": "How the horned figure travelled from medieval allegory to modern pop culture — and how the Brotherhood story reinterprets it.", "date": "Episode 01"},
    {"slug": "hidden-societies", "title": "Hidden Societies", "tag": "theory", "dur": "08:20", "img": "/assets/archive-ritual.jpg", "desc": "A survey of the real historical societies that inspired the mythology, and the theories that grew around them.", "date": "Episode 02"},
    {"slug": "ancient-mysteries", "title": "Ancient Mysteries", "tag": "fact", "dur": "15:02", "img": "/assets/forbidden-pyramid.jpg", "desc": "Pyramids, alignments and lost libraries. The documented history behind the symbols used throughout the experience.", "date": "Episode 03"},
    {"slug": "new-world-order", "title": "New World Order", "tag": "theory", "dur": "10:44", "img": "/assets/forbidden-city.jpg", "desc": "Where the phrase came from, why it stuck, and how the Brotherhood story uses it as a countdown.", "date": "Episode 04", "video_url": ""},
    {"slug": "the-forbidden-library", "title": "The Forbidden Library", "tag": "fiction", "dur": "09:31", "img": "/assets/archives-hero.jpg", "desc": "A dramatised walk through the six chambers of the Ritual Archive, narrated by the Grand Keeper.", "date": "Episode 05"},
    {"slug": "the-last-screening", "title": "The Last Screening", "tag": "fiction", "dur": "18:12", "img": "/assets/videos-hero.jpg", "desc": "The feature-length chapter that closes season one. Sealed for initiates until the New Order date.", "date": "Episode 06"},
    {"slug": "council-of-thirteen", "title": "Council of Thirteen", "tag": "fiction", "dur": "11:05", "img": "/assets/community-hero.jpg", "desc": "Inside the round table: how the council makes its decisions and what the empty thirteenth seat means.", "date": "Episode 07"},
    {"slug": "the-eye-over-the-city", "title": "The Eye Over The City", "tag": "theory", "dur": "07:48", "img": "/assets/neworder-hero.jpg", "desc": "Skylines, pyramids and the all-seeing eye — an image breakdown of the New Order key visual.", "date": "Episode 08"},
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


EBOOKS = [
    {"slug": "the-book-of-the-thirteenth-seat", "title": "The Book of the Thirteenth Seat", "desc": "The council's own record of the empty chair: why twelve keepers leave one place open.", "img": "/assets/archive-parchment.jpg", "pages": 148, "format": "pdf", "file": ""},
    {"slug": "sigils-of-the-ritual-archive", "title": "Sigils of the Ritual Archive", "desc": "Every mark used across the chambers, drawn and glossed by the Grand Keeper.", "img": "/assets/archive-eye.jpg", "pages": 96, "format": "pdf", "file": ""},
    {"slug": "a-field-guide-to-hidden-symbols", "title": "A Field Guide to Hidden Symbols", "desc": "Where each symbol actually comes from, and what the myths get wrong about it.", "img": "/assets/visuals-hero.jpg", "pages": 212, "format": "pdf", "file": ""},
    {"slug": "the-new-world-order-dossier", "title": "The New World Order Dossier", "desc": "The phrase, its origins and the countdown — a sealed volume for initiates only.", "img": "/assets/forbidden-city.jpg", "pages": 74, "format": "pdf", "file": ""},
    {"slug": "rituals-a-stage-manual", "title": "Rituals: A Stage Manual", "desc": "The seven stations as they are staged: light, silence, timing and exits.", "img": "/assets/rituals-hero.jpg", "pages": 130, "format": "pdf", "file": ""},
]

ARCHIVE_RECORDS = [
    {"slug": "the-third-eye", "title": "The Third Eye", "desc": "A symbol representing knowledge, perception and hidden truth.", "cap": "Knowledge · Perception · Truth", "era": "Chamber I", "body": "Older than any order that claimed it, the open eye appears wherever humans wanted to say \"we see more than we are told\". The chamber now also holds OSIRIS, the live observation interface.", "img": "/assets/archive-eye.jpg"},
    {"slug": "the-gathering", "title": "The Gathering", "desc": "Hooded keepers circle the eternal flame of counsel.", "cap": "Ceremony · Brotherhood · Oath", "era": "Chamber II", "body": "Thirteen robes, one circle, no faces. It is staged and symbolic.", "img": "/assets/archive-ritual.jpg"},
    {"slug": "the-golden-altar", "title": "The Golden Altar", "desc": "Where candlelight meets the triangular gate of awakening.", "cap": "Light · Passage · Awakening", "era": "Chamber III", "body": "A triangle of light set into the stone; what you see on the other side is what you brought with you.", "img": "/assets/archive-altar.jpg"},
    {"slug": "the-horned-figure", "title": "The Horned Figure", "desc": "Myth and allegory guarding the gate of forbidden wisdom.", "cap": "Myth · Allegory · Power", "era": "Chamber IV", "body": "The story's antagonist and mirror at once — the fear of knowledge standing between the seeker and the fourth chamber.", "img": "/assets/archive-baphomet.jpg"},
    {"slug": "the-threshold", "title": "The Threshold", "desc": "One silhouette. One triangle. One choice to step through.", "cap": "Choice · Passage · Destiny", "era": "Chamber V", "body": "Every initiate reaches a door they can still walk away from.", "img": "/assets/archive-silhouette.jpg"},
    {"slug": "the-grimoire", "title": "The Grimoire", "desc": "Parchments of sigils, circles and centuries-old questions.", "cap": "Sigils · History · Mystery", "era": "Chamber VI", "body": "The final chamber holds a book that is never finished.", "img": "/assets/archive-parchment.jpg"},
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

    _seed_kind(db, Ritual, RITUALS, slug_key="slug", title_key="title", desc_key="desc", img_key="img", extra_keys=["step", "duration", "tags", "video_url"])
    _seed_kind(db, Video, VIDEOS, slug_key="slug", title_key="title", desc_key="desc", img_key="img", extra_keys=["tag", "dur", "date", "video_url"])
    _seed_kind(db, Image, GALLERY, slug_key="id", title_key="title", desc_key=None, img_key="img", extra_keys=["cap", "portrait"])
    _seed_kind(db, Book, EBOOKS, slug_key="slug", title_key="title", desc_key="desc", img_key="img", extra_keys=["pages", "format", "file"])
    _seed_kind(db, Archive, ARCHIVE_RECORDS, slug_key="slug", title_key="title", desc_key="desc", img_key="img", extra_keys=["cap", "era", "body"])

    db.commit()
