"""Settings schemas."""
from pydantic import BaseModel, Field


class SettingBase(BaseModel):
    theme: str = Field(default="light", pattern="^(light|dark|system)$")
    email_notifications: bool = True
    push_notifications: bool = True


class SettingResponse(SettingBase):
    id: int
    user_id: int
    app_name: str | None = None
    app_logo_url: str | None = None
    meta_description: str | None = None

    model_config = {"from_attributes": True}


class SettingUpdate(BaseModel):
    theme: str | None = Field(None, pattern="^(light|dark|system)$")
    email_notifications: bool | None = None
    push_notifications: bool | None = None
    full_name: str | None = None
    avatar_url: str | None = None
    app_name: str | None = None
    app_logo_url: str | None = None
    meta_description: str | None = None
