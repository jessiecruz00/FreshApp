"""User and app settings."""
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.setting import UserSetting
from app.models.user import User
from app.schemas.setting import SettingUpdate


async def get_setting_for_user(db: AsyncSession, user_id: int) -> UserSetting | None:
    result = await db.execute(select(UserSetting).where(UserSetting.user_id == user_id))
    return result.scalar_one_or_none()


async def get_or_create_setting(db: AsyncSession, user: User) -> UserSetting:
    setting = await get_setting_for_user(db, user.id)
    if setting:
        return setting
    setting = UserSetting(user_id=user.id)
    db.add(setting)
    await db.flush()
    await db.refresh(setting)
    return setting


async def update_setting(db: AsyncSession, user: User, setting: UserSetting, data: SettingUpdate) -> UserSetting:
    if data.theme is not None:
        setting.theme = data.theme
    if data.email_notifications is not None:
        setting.email_notifications = data.email_notifications
    if data.push_notifications is not None:
        setting.push_notifications = data.push_notifications
    if data.app_name is not None:
        setting.app_name = data.app_name
    if data.app_logo_url is not None:
        setting.app_logo_url = data.app_logo_url
    if data.meta_description is not None:
        setting.meta_description = data.meta_description
    if data.full_name is not None:
        user.full_name = data.full_name
    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url
    await db.flush()
    await db.refresh(setting)
    return setting
