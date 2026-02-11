"""Auth endpoints: login, signup, Google, verify email, refresh."""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse, VerifyEmailRequest, GoogleAuthRequest
from app.schemas.user import UserResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    user = await auth_service.login(db, data)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return auth_service.tokens_for_user(user)


@router.post("/signup", response_model=TokenResponse)
async def signup(
    data: SignupRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        user, _ = await auth_service.signup(db, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return auth_service.tokens_for_user(user)


@router.post("/verify-email", response_model=TokenResponse)
async def verify_email(
    data: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db),
):
    user = await auth_service.verify_email_token(db, data.token)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")
    return auth_service.tokens_for_user(user)


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest):
    out = auth_service.refresh_access_token(data.refresh_token)
    if not out:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    return out


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


# Google: exchange code for tokens then create/update user (frontend sends id_token or code)
@router.post("/google", response_model=TokenResponse)
async def google_auth(
    data: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db),
):
    import httpx
    from app.config import get_settings
    settings = get_settings()
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Google auth not configured")

    id_token = data.id_token
    if data.code and not id_token:
        async with httpx.AsyncClient() as client:
            r = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": data.code,
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "redirect_uri": settings.google_redirect_uri or f"{settings.frontend_url}/auth/callback",
                    "grant_type": "authorization_code",
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            if r.status_code != 200:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google token exchange failed")
            id_token = r.json().get("id_token")

    if not id_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="id_token or code required")

    async with httpx.AsyncClient() as client:
        r = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": id_token},
        )
        if r.status_code != 200:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Google token")
        claims = r.json()
    email = claims.get("email")
    sub = claims.get("sub")
    name = (claims.get("name") or "").strip()
    picture = claims.get("picture")
    if not email or not sub:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Google token claims")
    user = await auth_service.create_or_update_google_user(db, email, sub, name, picture)
    return auth_service.tokens_for_user(user)
