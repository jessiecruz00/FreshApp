"""Blog post schemas."""
from datetime import datetime
from pydantic import BaseModel, Field


class BlogPostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    content: str = Field(..., min_length=1)
    excerpt: str | None = None
    cover_image_url: str | None = None
    is_published: bool = False


class BlogPostCreate(BlogPostBase):
    pass


class BlogPostUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=500)
    content: str | None = Field(None, min_length=1)
    excerpt: str | None = None
    cover_image_url: str | None = None
    is_published: bool | None = None


class BlogPostResponse(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    excerpt: str | None
    cover_image_url: str | None
    is_published: bool
    author_id: int | None
    view_count: int
    created_at: datetime
    updated_at: datetime
    published_at: datetime | None

    model_config = {"from_attributes": True}


class BlogPostListResponse(BaseModel):
    items: list[BlogPostResponse]
    total: int
