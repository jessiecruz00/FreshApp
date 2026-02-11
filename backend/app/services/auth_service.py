"""Auth: login, signup, Google, verify email."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    create_verification_token,
    decode_token,
    decode_access_token,
)
from app.core.email import send_verification_email
from app.models.user import User, UserRole
from app.models.setting import UserSetting
from app.models.verification_token import TokenType
from app.schemas.auth import LoginRequest, SignupRequest

settings = get_settings()


async def login(db: AsyncSession, data: LoginRequest) -> User | None:
    # Super admin from .env: get-or-create admin user when email + password match
    if settings.super_admin_email and settings.super_admin_password:
        if data.email == settings.super_admin_email and data.password == settings.super_admin_password:
            result = await db.execute(select(User).where(User.email == settings.super_admin_email))
            user = result.scalar_one_or_none()
            if user:
                user.role = UserRole.ADMIN
                user.hashed_password = get_password_hash(settings.super_admin_password)
                user.is_verified = True
                user.is_active = True
                await db.flush()
                await db.refresh(user)
                return user
            user = User(
                email=settings.super_admin_email,
                hashed_password=get_password_hash(settings.super_admin_password),
                full_name=settings.super_admin_name or settings.super_admin_email.split("@")[0],
                role=UserRole.ADMIN,
                is_verified=True,
            )
            db.add(user)
            await db.flush()
            db.add(UserSetting(user_id=user.id))
            await db.refresh(user)
            return user

    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not user.hashed_password or not verify_password(data.password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    return user


async def signup(db: AsyncSession, data: SignupRequest) -> tuple[User, str]:
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise ValueError("Email already registered")
    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name or data.email.split("@")[0],
        role=UserRole.USER,
        is_verified=False,
    )
    db.add(user)
    await db.flush()
    setting = UserSetting(user_id=user.id)
    db.add(setting)
    await db.refresh(user)
    token = create_verification_token(user.email, TokenType.SIGNUP_VERIFY.value)
    sent = send_verification_email(user.email, token)
    if not sent and settings.sendgrid_api_key:
        pass  # log in production
    return user, token


async def verify_email_token(db: AsyncSession, token: str) -> User | None:
    payload = decode_token(token)
    if not payload or payload.get("type") not in ("signup_verify", "invite"):
        return None
    email = payload.get("email")
    if not email:
        return None
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        return None
    user.is_verified = True
    await db.flush()
    return user


async def get_user_by_google_id(db: AsyncSession, google_id: str) -> User | None:
    result = await db.execute(select(User).where(User.google_id == google_id))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def create_or_update_google_user(
    db: AsyncSession,
    email: str,
    google_id: str,
    full_name: str = "",
    avatar_url: str | None = None,
) -> User:
    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()
    if user:
        user.full_name = full_name or user.full_name
        user.avatar_url = avatar_url or user.avatar_url
        user.is_verified = True
        await db.flush()
        await db.refresh(user)
        return user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user:
        user.google_id = google_id
        user.full_name = full_name or user.full_name
        user.avatar_url = avatar_url or user.avatar_url
        user.is_verified = True
        await db.flush()
        await db.refresh(user)
        return user
    user = User(
        email=email,
        google_id=google_id,
        full_name=full_name or email.split("@")[0],
        avatar_url=avatar_url,
        role=UserRole.USER,
        is_verified=True,
    )
    db.add(user)
    await db.flush()
    db.add(UserSetting(user_id=user.id))
    await db.refresh(user)
    return user


def tokens_for_user(user: User) -> dict:
    return {
        "access_token": create_access_token(user.id, extra={"email": user.email, "role": user.role.value}),
        "refresh_token": create_refresh_token(user.id),
        "token_type": "bearer",
        "expires_in": settings.access_token_expire_minutes * 60,
    }


def refresh_access_token(refresh_token: str) -> dict | None:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        return None
    sub = payload.get("sub")
    if not sub:
        return None
    return {
        "access_token": create_access_token(int(sub)),
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.access_token_expire_minutes * 60,
    }
