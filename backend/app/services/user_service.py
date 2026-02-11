"""User CRUD and listing."""
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate


async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def list_users(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 20,
    search: str | None = None,
) -> tuple[list[User], int]:
    q = select(User)
    count_q = select(func.count()).select_from(User)
    if search:
        like = f"%{search}%"
        q = q.where(User.email.ilike(like) | User.full_name.ilike(like))
        count_q = count_q.where(User.email.ilike(like) | User.full_name.ilike(like))
    total = (await db.execute(count_q)).scalar() or 0
    q = q.offset(skip).limit(limit).order_by(User.created_at.desc())
    result = await db.execute(q)
    return list(result.scalars().all()), total


async def create_user(db: AsyncSession, data: UserCreate) -> User:
    from app.core.security import get_password_hash
    from app.models.setting import UserSetting

    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name or data.email.split("@")[0],
        role=data.role,
        is_verified=False,
    )
    db.add(user)
    await db.flush()
    db.add(UserSetting(user_id=user.id))
    await db.refresh(user)
    return user


async def update_user(db: AsyncSession, user: User, data: UserUpdate) -> User:
    if data.full_name is not None:
        user.full_name = data.full_name
    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url
    if data.is_active is not None:
        user.is_active = data.is_active
    await db.flush()
    await db.refresh(user)
    return user
