from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.user import Role

# Throwaway inbox providers the site refuses to register (mirrors
# src/utils/validation.js — the client shows the same message).
DISPOSABLE_DOMAINS = {
    "mailinator.com", "tempmail.com", "temp-mail.org", "10minutemail.com", "10minutemail.net",
    "guerrillamail.com", "guerrillamail.net", "sharklasers.com", "yopmail.com", "yopmail.fr",
    "trashmail.com", "trashmail.de", "dispostable.com", "throwawaymail.com", "getnada.com",
    "maildrop.cc", "tempr.email", "fakeinbox.com", "mintemail.com", "mailnesia.com",
    "spamgourmet.com", "mailcatch.com", "mytrashmail.com", "discard.email", "tempmailo.com",
    "burnermail.io", "mohmal.com", "emailondeck.com", "moakt.com", "linshiyouxiang.net",
}


def _clean_email(value: str) -> str:
    email = str(value).strip().lower()
    domain = email.rsplit("@", 1)[-1]
    if domain in DISPOSABLE_DOMAINS:
        raise ValueError("Disposable or temporary inboxes are not accepted. Use a permanent address.")
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
    def email_must_be_deliverable(cls, value: str) -> str:
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
        return _clean_email(value)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class ChangeRoleRequest(BaseModel):
    role: Role


class UpdateProfileRequest(BaseModel):
    name: str = Field(min_length=2, max_length=255)
