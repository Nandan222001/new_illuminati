from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.core.config import settings
from app.models.user import Role

# Known throwaway inbox providers rejected during registration and sign-in.
# This mirrors src/utils/validation.js so the client shows the same message.
DISPOSABLE_DOMAINS = {
    "mailinator.com", "tempmail.com", "temp-mail.org", "10minutemail.com", "10minutemail.net",
    "guerrillamail.com", "guerrillamail.net", "sharklasers.com", "yopmail.com", "yopmail.fr",
    "trashmail.com", "trashmail.de", "dispostable.com", "throwawaymail.com", "getnada.com",
    "maildrop.cc", "tempr.email", "fakeinbox.com", "mintemail.com", "mailnesia.com",
    "spamgourmet.com", "mailcatch.com", "mytrashmail.com", "discard.email", "tempmailo.com",
    "burnermail.io", "mohmal.com", "emailondeck.com", "moakt.com", "linshiyouxiang.net",
}

# Established consumer providers accepted for member registration. Keep this in
# sync with SUPPORTED_EMAIL_DOMAINS in src/utils/validation.js.
SUPPORTED_EMAIL_DOMAINS = {
    "gmail.com", "googlemail.com",
    "hotmail.com", "hotmail.co.uk", "hotmail.de", "hotmail.fr", "hotmail.es", "hotmail.it", "hotmail.ca", "hotmail.co.in", "hotmail.in", "hotmail.com.au",
    "outlook.com", "outlook.co.uk", "outlook.de", "outlook.fr", "outlook.es", "outlook.it", "outlook.ca", "outlook.co.in", "outlook.in", "outlook.com.au", "outlook.com.br", "outlook.jp",
    "live.com", "live.co.uk", "live.de", "live.fr", "live.it", "live.in", "msn.com",
    "yahoo.com", "yahoo.co.in", "yahoo.in", "yahoo.co.uk", "yahoo.ca", "yahoo.com.au", "yahoo.fr", "yahoo.de", "yahoo.es", "yahoo.it", "yahoo.co.jp", "yahoo.com.br", "yahoo.com.sg", "yahoo.co.nz", "yahoo.co.za", "ymail.com",
    "icloud.com", "me.com", "mac.com",
    "proton.me", "protonmail.com", "protonmail.ch", "pm.me",
    "aol.com", "gmx.com", "gmx.net", "gmx.de", "mail.com", "fastmail.com", "fastmail.fm",
    "zoho.com", "zohomail.com", "rediffmail.com", "yandex.com", "yandex.ru",
    "tuta.com", "tutanota.com", "tutanota.de", "hey.com",
    "qq.com", "163.com", "126.com", "yeah.net", "foxmail.com", "naver.com", "daum.net", "hanmail.net", "mail.ru",
}


def _clean_email(value: str, *, allow_configured_admin: bool = False) -> str:
    email = str(value).strip().lower()
    domain = email.rsplit("@", 1)[-1]
    if domain in DISPOSABLE_DOMAINS:
        raise ValueError("Disposable or temporary inboxes are not accepted. Use a permanent address.")
    if domain not in SUPPORTED_EMAIL_DOMAINS:
        configured_admin = settings.ADMIN_EMAIL.strip().lower()
        if not allow_configured_admin or email != configured_admin:
            raise ValueError("Use Gmail, Outlook/Hotmail, Yahoo, or another supported email provider.")
    return email


def _strong_password(value: str) -> str:
    """
    Every password must carry a special character (plus upper, lower and digit).
    Enforced server-side because client-side checks can be bypassed.
    """
    problems = []
    if len(value) < 8:
        problems.append("at least 8 characters")
    if not any(c.isupper() for c in value):
        problems.append("an uppercase letter")
    if not any(c.islower() for c in value):
        problems.append("a lowercase letter")
    if not any(c.isdigit() for c in value):
        problems.append("a number")
    if not any(not c.isalnum() for c in value):
        problems.append("a special character")
    if problems:
        raise ValueError(f"Passphrase must contain {', '.join(problems)}.")
    return value


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    role: Role
    initiate_number: int
    paid: bool
    paid_at: datetime | None
    seal_id: str | None
    created_at: datetime


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def email_must_use_supported_provider(cls, value: str) -> str:
        return _clean_email(value)

    @field_validator("password")
    @classmethod
    def password_must_be_strong(cls, value: str) -> str:
        return _strong_password(value)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        # The configured seed Keeper may use a domain outside the member allowlist.
        return _clean_email(value, allow_configured_admin=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class ChangeRoleRequest(BaseModel):
    role: Role


class UpdateProfileRequest(BaseModel):
    name: str = Field(min_length=2, max_length=255)
