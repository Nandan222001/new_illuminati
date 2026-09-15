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


class AdminSettingsPayload(BaseModel):
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
