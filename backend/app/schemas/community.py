from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ThreadMessagePublic(BaseModel):
    id: int
    author: str
    role: Literal["admin", "member"]
    body: str
    at: datetime


class ThreadPublic(BaseModel):
    id: int
    subject: str | None
    userId: int
    userEmail: str | None
    userName: str
    status: Literal["open", "answered"]
    createdAt: datetime
    updatedAt: datetime
    messages: list[ThreadMessagePublic]


class ThreadCreate(BaseModel):
    subject: str | None = Field(default=None, max_length=160)
    body: str = Field(min_length=1, max_length=4000)


class MessageCreate(BaseModel):
    body: str = Field(min_length=1, max_length=4000)


class ThreadStatusUpdate(BaseModel):
    status: Literal["open", "answered"]
