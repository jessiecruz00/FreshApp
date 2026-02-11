"""Blog: public list/detail + admin CRUD."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user_optional, get_current_user, RequireAdmin
from app.models.user import User
from app.schemas.blog import BlogPostCreate, BlogPostUpdate, BlogPostResponse, BlogPostListResponse
from app.services import blog_service

router = APIRouter(prefix="/blog", tags=["blog"])


@router.get("", response_model=BlogPostListResponse)
async def list_posts(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    public_only: bool = Query(True),
):
    if public_only:
        items, total = await blog_service.list_posts(db, skip=skip, limit=limit, search=search, public_only=True)
    else:
        items, total = await blog_service.list_posts(db, skip=skip, limit=limit, search=search, public_only=False)
    return BlogPostListResponse(items=[BlogPostResponse.model_validate(p) for p in items], total=total)


@router.get("/slug/{slug}", response_model=BlogPostResponse)
async def get_post_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    post = await blog_service.get_post_by_slug(db, slug, public_only=True)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    await blog_service.increment_view_count(db, post)
    return post


@router.get("/{post_id}", response_model=BlogPostResponse)
async def get_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
):
    post = await blog_service.get_post_by_id(db, post_id, public_only=True)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    await blog_service.increment_view_count(db, post)
    return post


# Admin only (more specific route first so "/admin/list" is not captured as post_id)
@router.get("/admin/list", response_model=BlogPostListResponse)
async def admin_list_posts(
    db: AsyncSession = Depends(get_db),
    current_user: User = RequireAdmin,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=500),
    search: str | None = Query(None),
):
    items, total = await blog_service.list_posts(db, skip=skip, limit=limit, search=search, public_only=False)
    return BlogPostListResponse(items=[BlogPostResponse.model_validate(p) for p in items], total=total)


@router.get("/admin/{post_id}", response_model=BlogPostResponse)
async def admin_get_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = RequireAdmin,
):
    post = await blog_service.get_post_by_id(db, post_id, public_only=False)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post


@router.post("", response_model=BlogPostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    data: BlogPostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = RequireAdmin,
):
    return await blog_service.create_post(db, data, current_user.id)


@router.patch("/{post_id}", response_model=BlogPostResponse)
async def update_post(
    post_id: int,
    data: BlogPostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = RequireAdmin,
):
    post = await blog_service.get_post_by_id(db, post_id, public_only=False)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return await blog_service.update_post(db, post, data)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = RequireAdmin,
):
    from sqlalchemy import delete
    from app.models.blog import BlogPost
    await db.execute(delete(BlogPost).where(BlogPost.id == post_id))
    await db.flush()
