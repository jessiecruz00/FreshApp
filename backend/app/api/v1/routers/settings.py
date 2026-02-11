"""User and admin settings (theme, notifications, profile, app settings)."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.setting import SettingResponse, SettingUpdate
from app.services import setting_service

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingResponse)
async def get_my_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    setting = await setting_service.get_or_create_setting(db, current_user)
    out = SettingResponse.model_validate(setting)
    out.app_name = setting.app_name
    out.app_logo_url = setting.app_logo_url
    out.meta_description = setting.meta_description
    return out


@router.patch("", response_model=SettingResponse)
async def update_my_settings(
    data: SettingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    setting = await setting_service.get_or_create_setting(db, current_user)
    return await setting_service.update_setting(db, current_user, setting, data)


@router.get("/app", response_model=SettingResponse)
async def get_app_settings_public(
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import select
    from app.models.setting import UserSetting
    result = await db.execute(select(UserSetting).where(UserSetting.app_name.isnot(None)).limit(1))
    row = result.scalar_one_or_none()
    if not row:
        return SettingResponse(id=0, user_id=0, theme="light", email_notifications=True, push_notifications=True)
    return SettingResponse.model_validate(row)
