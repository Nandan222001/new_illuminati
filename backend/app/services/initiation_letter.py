"""Dynamic initiation-document renderer.

Renders the parchment transmissions new members receive:

  * ``acceptance`` — the acceptance letter + key terms + member card,
    sent when an account is created;
  * ``clearance``  — the confidential final-clearance notice with the
    member's online ritual appointment, sent when the initiation is sealed.

Visual language follows the reference key-art: engraved emblem, blue ink
seal, Latin motto, Office of the Grand Master, cursive signature.

This module is deliberately stdlib-only so the demo script can exercise it
without installing the API's dependencies.

IMPORTANT — this experience is fiction. The documents:
  * never ask for money, bank details, IDs, photographs or real addresses;
  * never instruct members to meet anyone in the real world (the clearance
    notice states this explicitly);
  * never threaten real consequences; every "term" is playful flavor;
  * always carry the fiction disclaimer in the footer.
"""

from __future__ import annotations

import base64
import html
from pathlib import Path

EMAIL_ASSETS = Path(__file__).resolve().parents[3] / "public" / "assets" / "email"

PARCHMENT = "#f4ecdc"
INK = "#2b241a"
GOLD = "#8a6d3b"
NAVY = "#27356b"

_CSS = """
body{margin:0;padding:0;background:#d9cdb4;-webkit-text-size-adjust:__PCT__}
.shell{max-width:660px;margin:0 auto;padding:24px 12px}
.sheet{background:__PARCHMENT__;border:1px solid #b9a678;outline:1px solid #8a6d3b;outline-offset:5px;padding:38px 42px;color:__INK__;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.65}
.small{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:__GOLD__}
.rule{border:0;border-top:1px solid #b9a678;margin:14px 0}
.rule-double{border:0;border-top:3px double #8a6d3b;margin:14px 0}
h1.title{font-family:Georgia,'Times New Roman',serif;font-variant:small-caps;letter-spacing:.22em;font-size:25px;margin:10px 0 2px;color:__INK__;text-align:center}
.motto{text-align:center;font-size:11px;letter-spacing:.3em;color:__GOLD__;text-transform:uppercase;margin:0}
.office{text-align:center;font-variant:small-caps;letter-spacing:.18em;font-size:15px;margin:14px 0 2px}
.est{text-align:center;font-size:11px;letter-spacing:.3em;color:__GOLD__}
p{margin:10px 0}
.term{margin:6px 0;padding-left:4px}
.hand{font-family:'Brush Script MT','Segoe Script','Snell Roundhand',cursive;color:__NAVY__;font-size:19px}
.req{border:1px solid #b9a678;background:#efe5cf;padding:14px 18px;margin:18px 0}
.req .lbl{font-size:10px;letter-spacing:.18em;color:__GOLD__;text-transform:uppercase}
.card{border:1px solid #7d9a94;background:#eef4f2;border-radius:12px;padding:18px 20px;margin:22px 0;color:#17211f;font-family:'Trebuchet MS',Verdana,sans-serif}
.card .gothic{font-family:'Old English Text MT','UnifrakturMaguntia','Times New Roman',serif;font-size:34px;line-height:1;margin:0 0 10px}
.card td{padding:3px 10px 3px 0;vertical-align:top}
.card .lbl{font-size:9px;letter-spacing:.18em;color:#4c635e;text-transform:uppercase}
.card .val{font-size:14px;font-weight:bold;letter-spacing:.04em;color:#131a18}
.cta{display:block;width:260px;margin:26px auto 6px;background:__INK__;color:__PARCHMENT__;text-align:center;text-decoration:none;font-variant:small-caps;letter-spacing:.24em;font-size:14px;padding:12px 0;border:1px solid __GOLD__;outline:1px solid __GOLD__;outline-offset:3px}
.sig{font-family:'Brush Script MT','Segoe Script','Snell Roundhand',cursive;font-size:30px;color:__NAVY__;margin:0}
.footer{font-size:10.5px;line-height:1.6;color:#6b6152;margin-top:26px;border-top:1px solid #b9a678;padding-top:12px}
"""
for _token, _value in (("__PCT__", "100%"), ("__PARCHMENT__", PARCHMENT), ("__INK__", INK), ("__GOLD__", GOLD), ("__NAVY__", NAVY)):
    _CSS = _CSS.replace(_token, _value)


def _img(name: str, site_url: str, image_mode: str, width: int, alt: str) -> str:
    if image_mode == "data":
        src = "data:image/jpeg;base64," + base64.b64encode((EMAIL_ASSETS / name).read_bytes()).decode("ascii")
    else:
        src = f"{site_url.rstrip('/')}/assets/email/{name}"
    return f'<img src="{src}" width="{width}" alt="{alt}" style="display:block;border:0" />'


def subject_for(kind: str, fields: dict) -> str:
    n = f"{fields['initiate_number']:04d}"
    if kind == "clearance":
        return f"CONFIDENTIAL — Final Clearance Notice, Initiate №{n}"
    return f"Hail the Light — your initiation is recorded, Initiate №{n}"


def _header(site_url: str, image_mode: str) -> str:
    emblem = _img("emblem.jpg", site_url, image_mode, 150, "Eye of Providence emblem")
    seal = _img("seal.jpg", site_url, image_mode, 100, "Seal of the Order")
    return f"""
  <table role="presentation" width="100%"><tr>
    <td width="30%" style="vertical-align:top">
      <div class="small" style="color:{INK};letter-spacing:.08em">Garrett S. Chan</div>
      <div class="small">Illuminati Headquarters</div>
      <div class="small">The Archive House, Suite 1776</div>
    </td>
    <td width="40%" align="center">{emblem}</td>
    <td width="30%" align="right" style="vertical-align:top">{seal}</td>
  </tr></table>

  <h1 class="title">Supreme Order of Illuminati</h1>
  <p class="motto">Lux in Tenebris &nbsp;&bull;&nbsp; Veritas Liberat &nbsp;&bull;&nbsp; Ad Lucem</p>
  <hr class="rule-double">
  <p class="office">Office of the Grand Master</p>
  <p class="est">Est. 1776</p>
  <hr class="rule">"""


def _signature(site_url: str, image_mode: str, date_str: str) -> str:
    seal = _img("seal.jpg", site_url, image_mode, 110, "Seal of the Order")
    return f"""
  <table role="presentation" width="100%" style="margin-top:26px"><tr>
    <td>
      <p class="sig">Garrett S. Chan</p>
      <hr class="rule" style="width:220px;margin:4px 0">
      <div class="small" style="color:{INK}">Garrett S. Chan</div>
      <div class="small">Grand Master</div>
      <div class="small">Date: <span class="hand">{date_str}</span></div>
    </td>
    <td align="right" style="vertical-align:bottom">{seal}</td>
  </tr></table>"""


def _footer(email: str, site: str) -> str:
    return f"""
  <div class="footer">
    This transmission is part of <strong>Illuminati Brotherhood</strong>, a fictional
    entertainment experience. No real society, contract, debt or obligation is created by
    it, and nothing herein is a claim about the real world. The Order never asks for money,
    bank details, identification documents or photographs, and no representative will ever
    ask to meet you outside the experience. Sent to {email} because an account was created
    at {site}. If you no longer wish to receive transmissions, delete your account from
    your profile page.
  </div>"""


def _member_card(fields: dict, site_url: str, image_mode: str) -> str:
    name = html.escape(fields["name"]).upper()
    number = f"{fields['initiate_number']:04d}"
    seal = html.escape(fields["seal_id"])
    joined = html.escape(fields["joined"])
    emblem_sm = _img("emblem.jpg", site_url, image_mode, 64, "")
    return f"""
  <div class="card">
    <table role="presentation" width="100%"><tr>
      <td style="vertical-align:top"><p class="gothic">Illuminati</p></td>
      <td align="right" style="vertical-align:top">{emblem_sm}</td>
    </tr></table>
    <table role="presentation">
      <tr><td class="lbl">Member name</td><td class="val">{name}</td></tr>
      <tr><td class="lbl">Initiate &#8470;</td><td class="val">{number}</td></tr>
      <tr><td class="lbl">Seal</td><td class="val">{seal}</td></tr>
      <tr><td class="lbl">Initiated</td><td class="val">{joined}</td></tr>
    </table>
    <p style="font-size:9px;letter-spacing:.16em;color:#4c635e;margin:10px 0 0;text-transform:uppercase">
      Fictional member card &mdash; valid only within the experience</p>
  </div>"""


def render_acceptance(fields: dict, *, site_url: str, image_mode: str = "url") -> str:
    """Acceptance letter + key terms + member card (first transmission)."""
    name = html.escape(fields["name"])
    email = html.escape(fields["email"])
    number = f"{fields['initiate_number']:04d}"
    seal = html.escape(fields["seal_id"])
    joined = html.escape(fields["joined"])
    site = site_url.rstrip("/")

    body = f"""
  <p style="letter-spacing:.06em"><strong>Hail the Light &#128065;</strong><br>
  Dear {name},</p>

  <p>The ledger of the Order has reviewed your request, and only after that
  review have you been accepted to walk the hidden halls. Welcome to the
  mysterious world you have been searching for.</p>

  <p>From this hour your initiate number is <strong>&#8470;&nbsp;{number}</strong>
  and your secret code &mdash; <strong>{seal}</strong> &mdash; is bound to you and
  to no other soul. It was inscribed on {joined}.</p>

  <p>Within these pages every wish for mystery is fulfilled: the six chambers of
  the Ritual Archive, the seven stations of the rites, the sigil vault and the
  counting of the New Order. Power over your own curiosity &mdash; that is the
  only power granted here, and it is absolute.</p>

  <div class="req">
    <p class="lbl" style="margin:0 0 8px">Required information &mdash; to be completed in your profile</p>
    <p class="term">&#9679;&nbsp; Your Order name (the name the Archive shall call you by)</p>
    <p class="term">&#9679;&nbsp; The chamber you wish to enter first</p>
    <p class="term">&#9679;&nbsp; The sigil you choose to bear</p>
    <p style="margin:8px 0 0">The Order asks nothing else of you &mdash; no purse, no papers,
    no photographs. Complete it at <a href="{site}/profile" style="color:{NAVY}">your profile</a>.</p>
  </div>

  <p class="office" style="font-size:13px;margin-top:22px">Key Terms &amp; Conditions</p>
  <hr class="rule">
  <p class="term">&#9650;&nbsp; Anyone who joins must keep the Archive's mysteries within the
  Archive; speak of them only to those who already walk its halls.</p>
  <p class="term">&#9650;&nbsp; This path is for those driven by an intense desire for ultimate
  mysteries. Everything you desire to know is within reach here.</p>
  <p class="term">&#9650;&nbsp; The sole condition: your seal is yours alone &mdash; lend it to no one.</p>
  <p class="term">&#9650;&nbsp; A word of caution: rule-breakers find the chambers sealed.
  Think carefully before taking this step.</p>
  <p class="term">&#9650;&nbsp; Proceed only if you are genuinely curious &mdash; everything
  beyond this line is story.</p>

  {_member_card(fields, site_url, image_mode)}

  <a class="cta" href="{site}/rituals">Enter the Archive</a>

  {_signature(site_url, image_mode, joined)}
  {_footer(email, site)}
"""
    return _doc(_header(site_url, image_mode) + body)


def render_clearance(fields: dict, *, site_url: str, image_mode: str = "url") -> str:
    """Confidential final-clearance notice (sent when the initiation is sealed)."""
    name = html.escape(fields["name"])
    email = html.escape(fields["email"])
    seal = html.escape(fields["seal_id"])
    issued = html.escape(fields["joined"])
    appt_date = html.escape(fields["appointed_date"])
    appt_time = html.escape(fields["appointed_time"])
    site = site_url.rstrip("/")

    body = f"""
  <p style="text-align:right">Date: <span class="hand">{issued}</span></p>
  <p class="office" style="text-align:left;font-size:14px">Subject: Confidential Final Clearance Notice</p>
  <hr class="rule">

  <p>To the Authorized Recipient, {name},</p>

  <p>This letter serves as your final confidential notification, issued under the
  seal of the Grand Master.</p>

  <p>The secret code previously assigned to you &mdash; <strong>{seal}</strong> &mdash;
  has now been activated for final verification.</p>

  <p>You are hereby instructed to present on <strong>{appt_date}</strong> at exactly
  <strong>{appt_time}</strong> at the <strong>Sealed Chamber</strong> of the Archive:
  <a href="{site}/rituals" style="color:{NAVY}">{site}/rituals</a>.</p>

  <p>Please observe the following instructions carefully:</p>
  <p class="term">&#9679;&nbsp; Arrive at the appointed hour and remain calm.</p>
  <p class="term">&#9679;&nbsp; The rite is performed entirely within the experience;
  no representative of the Order will ever ask to meet you outside it, and none
  may ask you for money, papers or photographs in its name.</p>
  <p class="term">&#9679;&nbsp; Do not leave the chamber until the rite concludes and
  your code is verified.</p>
  <p class="term">&#9679;&nbsp; Upon successful verification the next stage will be
  unsealed for you, and all further instructions will be revealed within.</p>
  <p class="term">&#9679;&nbsp; This is your final stage. Once completed you will be
  formally welcomed into the Order's inner gallery.</p>

  <p>Your authorized representative for this meeting is:
  <strong>The Keeper of the Gate</strong> &mdash; a presence of the experience only.</p>

  <p>This document is <strong>strictly confidential</strong> within the story. Do not
  disclose its contents, the meeting time or the scheduled chamber under any
  circumstances &mdash; and remember that no real-world action is required of you.</p>

  <p>Discipline, loyalty and absolute confidentiality are the foundation of our Order.<br>
  By order of the Grand Master,</p>

  <p style="letter-spacing:.06em"><strong>Hail the Light &#128065;</strong></p>

  {_signature(site_url, image_mode, issued)}
  {_footer(email, site)}
"""
    return _doc(_header(site_url, image_mode) + body)


def plain_for(kind: str, fields: dict, *, site_url: str) -> str:
    site = site_url.rstrip("/")
    n = f"{fields['initiate_number']:04d}"
    if kind == "clearance":
        return (
            f"CONFIDENTIAL — Final Clearance Notice\n\n"
            f"{fields['name']}, your secret code {fields['seal_id']} is activated.\n"
            f"Present on {fields['appointed_date']} at exactly {fields['appointed_time']} "
            f"at the Sealed Chamber: {site}/rituals\n"
            f"The rite is performed entirely within the experience; no representative will "
            f"ever ask to meet you outside it.\n\n"
            f"This message is part of Illuminati Brotherhood, a fictional entertainment "
            f"experience. No real society, contract, debt or obligation is created by it.\n"
        )
    return (
        f"Hail the Light,\n\nDear {fields['name']},\n\n"
        f"Your initiation is recorded. Initiate №{n}, seal {fields['seal_id']}, "
        f"inscribed {fields['joined']}.\n"
        f"The six chambers, the seven stations and the sigil vault await you: {site}/rituals\n\n"
        f"This message is part of Illuminati Brotherhood, a fictional entertainment "
        f"experience. No real society, contract, debt or obligation is created by it.\n"
    )


def _doc(content: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<style>{_CSS}</style></head>
<body>
<div class="shell"><div class="sheet">
{content}
</div></div>
</body>
</html>"""
