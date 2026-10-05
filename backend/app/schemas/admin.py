from datetime import datetime

from pydantic import BaseModel

from app.models.transaction import TransactionStatus


class RazorpaySettings(BaseModel):
    enabled: bool = False
    mode: str = "test"
    keyId: str = ""
    keySecret: str = ""


class SmtpSettings(BaseModel):
    enabled: bool = False
    host: str = ""
    port: str = "587"
    secure: bool = True
    username: str = ""
    password: str = ""
    fromName: str = "Illuminati Brotherhood"
    fromEmail: str = ""


class TwilioSettings(BaseModel):
    enabled: bool = False
    accountSid: str = ""
    authToken: str = ""
    fromNumber: str = ""


class SocialSettings(BaseModel):
    """Public profile links — surface in the footer, home and community pages."""
    instagram: str = ""
    discord: str = ""
    telegram: str = ""
    youtube: str = ""
    x: str = ""
    facebook: str = ""
    whatsapp: str = ""


class PublicSettingsPayload(BaseModel):
    """Anonymous-safe subset of the settings that public pages may read."""
    social: SocialSettings = SocialSettings()


class AdminSettingsPayload(BaseModel):
    social: SocialSettings = SocialSettings()
    razorpay: RazorpaySettings = RazorpaySettings()
    smtp: SmtpSettings = SmtpSettings()
    twilio: TwilioSettings = TwilioSettings()


class RevenuePoint(BaseModel):
    label: str
    subscriptions: int
    revenue: int


class TransactionPublic(BaseModel):
    id: int
    user_id: int | None
    name: str
    amount: int
    note: str
    status: TransactionStatus
    date: datetime
