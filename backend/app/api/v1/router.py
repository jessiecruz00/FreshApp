"""Aggregate all v1 API routers."""
from fastapi import APIRouter

from app.api.v1.routers import auth, users, blog, settings, notifications

api_router = APIRouter()
api_router.include_router(auth.router, prefix="")
api_router.include_router(users.router, prefix="")
api_router.include_router(blog.router, prefix="")
api_router.include_router(settings.router, prefix="")
api_router.include_router(notifications.router, prefix="")