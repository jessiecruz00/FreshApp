"""Pydantic schemas."""
from app.schemas.auth import (
    LoginRequest,
    SignupRequest,
    TokenResponse,
    VerifyEmailRequest,
    GoogleAuthRequest,
)
from app.schemas.user import UserCreate, UserResponse, UserUpdate, UserListResponse
from app.schemas.blog import BlogPostCreate, BlogPostUpdate, BlogPostResponse, BlogPostListResponse
from app.schemas.setting import SettingResponse, SettingUpdate
from app.schemas.notification import NotificationResponse, NotificationUpdate

__all__ = [
    "LoginRequest",
    "SignupRequest",
    "TokenResponse",
    "VerifyEmailRequest",
    "GoogleAuthRequest",
    "UserCreate",
    "UserResponse",
    "UserUpdate",
    "UserListResponse",
    "BlogPostCreate",
    "BlogPostUpdate",
    "BlogPostResponse",
    "BlogPostListResponse",
    "SettingResponse",
    "SettingUpdate",
    "NotificationResponse",
    "NotificationUpdate",
]
