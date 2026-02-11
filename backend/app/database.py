"""Async database session and engine."""
from collections.abc import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings

settings = get_settings()
engine = create_async_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=settings.debug,
)
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


async def ensure_database_exists() -> None:
    """Create the configured MySQL database if it does not exist."""
    settings = get_settings()
    # Escape backticks in database name for safe identifier in SQL
    db_name = settings.mysql_database.replace("`", "``")
    temp_engine = create_async_engine(
        settings.database_url_without_database,
        pool_pre_ping=True,
    )
    try:
        async with temp_engine.connect() as conn:
            await conn.execute(text(f"CREATE DATABASE IF NOT EXISTS `{db_name}`"))
            await conn.commit()
    finally:
        await temp_engine.dispose()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
