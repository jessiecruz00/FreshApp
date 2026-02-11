"""Notifications CRUD."""
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


async def list_notifications(
    db: AsyncSession,
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False,
) -> tuple[list[Notification], int]:
    count_q = select(func.count()).select_from(Notification).where(Notification.user_id == user_id)
    if unread_only:
        count_q = count_q.where(Notification.is_read == False)
    total = (await db.execute(count_q)).scalar() or 0
    q = select(Notification).where(Notification.user_id == user_id)
    if unread_only:
        q = q.where(Notification.is_read == False)
    q = q.order_by(Notification.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(q)
    return list(result.scalars().all()), total


async def get_notification(db: AsyncSession, notification_id: int, user_id: int) -> Notification | None:
    result = await db.execute(
        select(Notification).where(Notification.id == notification_id, Notification.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def mark_read(db: AsyncSession, notification: Notification) -> Notification:
    notification.is_read = True
    await db.flush()
    await db.refresh(notification)
    return notification


async def mark_all_read(db: AsyncSession, user_id: int) -> int:
    result = await db.execute(select(Notification).where(Notification.user_id == user_id, Notification.is_read == False))
    for n in result.scalars().all():
        n.is_read = True
    await db.flush()
    return 1
