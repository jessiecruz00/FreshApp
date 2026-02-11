"""Blog post CRUD and listing."""
import re
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.blog import BlogPost
from app.schemas.blog import BlogPostCreate, BlogPostUpdate


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    return text.strip("-") or "post"


async def get_post_by_id(db: AsyncSession, post_id: int, public_only: bool = False) -> BlogPost | None:
    q = select(BlogPost).where(BlogPost.id == post_id)
    if public_only:
        q = q.where(BlogPost.is_published == True)
    result = await db.execute(q)
    return result.scalar_one_or_none()


async def get_post_by_slug(db: AsyncSession, slug: str, public_only: bool = False) -> BlogPost | None:
    q = select(BlogPost).where(BlogPost.slug == slug)
    if public_only:
        q = q.where(BlogPost.is_published == True)
    result = await db.execute(q)
    return result.scalar_one_or_none()


async def list_posts(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 20,
    search: str | None = None,
    public_only: bool = False,
) -> tuple[list[BlogPost], int]:
    q = select(BlogPost)
    count_q = select(func.count()).select_from(BlogPost)
    if public_only:
        q = q.where(BlogPost.is_published == True)
        count_q = count_q.where(BlogPost.is_published == True)
    if search:
        like = f"%{search}%"
        q = q.where(or_(BlogPost.title.ilike(like), BlogPost.content.ilike(like)))
        count_q = count_q.where(or_(BlogPost.title.ilike(like), BlogPost.content.ilike(like)))
    total = (await db.execute(count_q)).scalar() or 0
    q = q.offset(skip).limit(limit).order_by(BlogPost.created_at.desc())
    result = await db.execute(q)
    return list(result.scalars().all()), total


async def create_post(db: AsyncSession, data: BlogPostCreate, author_id: int) -> BlogPost:
    base_slug = slugify(data.title)
    slug = base_slug
    n = 0
    while True:
        r = await db.execute(select(BlogPost).where(BlogPost.slug == slug))
        if r.scalar_one_or_none() is None:
            break
        n += 1
        slug = f"{base_slug}-{n}"
    post = BlogPost(
        title=data.title,
        slug=slug,
        content=data.content,
        excerpt=data.excerpt,
        cover_image_url=data.cover_image_url,
        is_published=data.is_published,
        author_id=author_id,
    )
    db.add(post)
    await db.flush()
    await db.refresh(post)
    return post


async def update_post(db: AsyncSession, post: BlogPost, data: BlogPostUpdate) -> BlogPost:
    if data.title is not None:
        post.title = data.title
        post.slug = slugify(data.title)
    if data.content is not None:
        post.content = data.content
    if data.excerpt is not None:
        post.excerpt = data.excerpt
    if data.cover_image_url is not None:
        post.cover_image_url = data.cover_image_url
    if data.is_published is not None:
        post.is_published = data.is_published
    await db.flush()
    await db.refresh(post)
    return post


async def increment_view_count(db: AsyncSession, post: BlogPost) -> None:
    post.view_count += 1
    await db.flush()
