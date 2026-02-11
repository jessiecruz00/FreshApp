"""JWT and password hashing."""
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _password_bytes(password: str) -> bytes:
    """Truncate to 72 bytes (bcrypt limit). pyca/bcrypt raises if exceeded."""
    return password.encode("utf-8")[:72]


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(_password_bytes(plain), hashed)


def get_password_hash(password: str) -> str:
    """Hash password with bcrypt. Truncates to 72 bytes (bcrypt limit)."""
    return pwd_context.hash(_password_bytes(password))


def create_access_token(subject: str | int, extra: dict[str, Any] | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode = {"sub": str(subject), "exp": expire, "type": "access"}
    if extra:
        to_encode.update(extra)
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def create_refresh_token(subject: str | int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    to_encode = {"sub": str(subject), "exp": expire, "type": "refresh"}
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def create_verification_token(email: str, token_type: str = "signup_verify") -> str:
    minutes = (
        settings.verification_token_expire_minutes
        if token_type == "signup_verify"
        else settings.invite_token_expire_minutes
    )
    expire = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    to_encode = {"email": email, "exp": expire, "type": token_type}
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None


def decode_access_token(token: str) -> dict | None:
    payload = decode_token(token)
    if payload and payload.get("type") == "access":
        return payload
    return None
