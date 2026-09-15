from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import Role


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


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class ChangeRoleRequest(BaseModel):
    role: Role


class UpdateProfileRequest(BaseModel):
    name: str = Field(min_length=2, max_length=255)
