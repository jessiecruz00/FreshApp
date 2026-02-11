"""User notifications (list, mark read)."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.notification import NotificationResponse, NotificationUpdate
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationResponse])
async def list_my_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    unread_only: bool = Query(False),
):
    items, _ = await notification_service.list_notifications(
        db, current_user.id, skip=skip, limit=limit, unread_only=unread_only
    )
    return [NotificationResponse.model_validate(n) for n in items]


@router.patch("/{notification_id}", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: int,
    data: NotificationUpdate,
  db: AsyncSession = Depends(get_db),
  current_user: User = Depends(get_current_user),
):
    n = await notification_service.get_notification(db, notification_id, current_user.id)
    if not n:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return await notification_service.mark_read(db, n)


@router.post("/mark-all-read")
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await notification_service.mark_all_read(db, current_user.id)
    return {"ok": True}


# Admin: create notification for a user
from app.api.deps import RequireAdmin
from pydantic import BaseModel


class CreateNotificationRequest(BaseModel):
    user_id: int
    title: str
    message: str
    link: str | None = None


@router.post("/admin", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_notification(
    data: CreateNotificationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = RequireAdmin,
):
    from app.models.notification import Notification
    n = Notification(user_id=data.user_id, title=data.title, message=data.message, link=data.link)
    db.add(n)
    await db.flush()
    await db.refresh(n)
    return n
