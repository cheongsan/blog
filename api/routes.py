import re
from typing import Optional
from fastapi import APIRouter, HTTPException, Request
import httpx

from api.notion.services import get_notion_service

router = APIRouter()


@router.get("/posts")
async def get_posts(status: Optional[str] = None, type: Optional[str] = None):
    notion = get_notion_service()
    posts = await notion.get_posts()
    accept_status = status.split(",") if status else ["Public", "Pinned", "Archived"]
    accept_type = type.split(",") if type else ["Post"]
    return notion.filter_posts(posts, accept_status=accept_status, accept_type=accept_type)


@router.get("/posts/{slug}")
async def get_post_by_slug(slug: str):
    notion = get_notion_service()
    post = await notion.get_post_by_slug(slug)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.get("/tags")
async def get_tags():
    notion = get_notion_service()
    return await notion.get_all_tags()


@router.get("/categories")
async def get_categories():
    notion = get_notion_service()
    return await notion.get_all_categories()


@router.get("/pages/{page_id}/blocks")
async def get_page_blocks(page_id: str, request: Request):
    from api.config import NOTION_CONFIG
    notion = get_notion_service()
    page = await notion.client.get_page(page_id)
    blocks = await notion.client.get_all_block_children(page_id)

    async def fetch_children(block_list):
        for block in block_list:
            if block.get("has_children"):
                children = await notion.client.get_all_block_children(block["id"])
                block["children"] = children
                await fetch_children(children)

    await fetch_children(blocks)

    # Cache page cover/icon
    base_url = str(request.base_url).rstrip("/")
    for media_field in (page.get("cover"), page.get("icon")):
        if media_field:
            for mk in ("file", "external"):
                m = media_field.get(mk)
                if m and isinstance(m, dict) and m.get("url"):
                    url = m["url"]
                    if "secure.notion-static.com" in url or "s3.us-west-2.amazonaws.com" in url:
                        key = await _download_and_cache(url)
                        m["url"] = f"{base_url}/py-api/image/{key}"

    # Cache all block images/icons
    await _cache_block_images(blocks, base_url)

    return {"page": page, "blocks": blocks}


from fastapi.responses import Response
import hashlib

# In-memory image cache: hash -> (content_type, bytes)
_image_cache: dict[str, tuple[str, bytes]] = {}


async def _download_and_cache(url: str) -> str:
    """Download image immediately and return cache key."""
    cache_key = hashlib.md5(url.split("?")[0].encode()).hexdigest()
    if cache_key not in _image_cache:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=30.0, follow_redirects=True)
            if resp.status_code == 200:
                _image_cache[cache_key] = (
                    resp.headers.get("content-type", "image/png"),
                    resp.content,
                )
    return cache_key


@router.get("/image/{cache_key}")
async def serve_cached_image(cache_key: str):
    """Serve cached image by key."""
    if cache_key not in _image_cache:
        raise HTTPException(status_code=404, detail="Image not found in cache")
    ct, data = _image_cache[cache_key]
    return Response(content=data, media_type=ct,
                    headers={"Cache-Control": "public, max-age=31536000, immutable"})


async def _cache_block_images(blocks: list, base_url: str) -> list:
    """Walk blocks, download S3 images, replace URLs with cache URLs."""
    for block in blocks:
        bt = block.get("type", "")
        data = block.get(bt, {})

        # Media (image, video, file, pdf)
        for media_key in ("file", "external"):
            media = data.get(media_key)
            if media and isinstance(media, dict) and media.get("url"):
                url = media["url"]
                if "secure.notion-static.com" in url or "s3.us-west-2.amazonaws.com" in url:
                    key = await _download_and_cache(url)
                    media["url"] = f"{base_url}/py-api/image/{key}"

        # Icon
        icon = data.get("icon")
        if icon:
            for ik in ("file", "external"):
                ic = icon.get(ik)
                if ic and isinstance(ic, dict) and ic.get("url"):
                    url = ic["url"]
                    if "secure.notion-static.com" in url or "s3.us-west-2.amazonaws.com" in url:
                        key = await _download_and_cache(url)
                        ic["url"] = f"{base_url}/py-api/image/{key}"

        # Recurse children
        if block.get("children"):
            await _cache_block_images(block["children"], base_url)

    return blocks


# --- Contributions ---

GITHUB_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"]
GITLAB_COLORS = ["#ebedf0", "#acd5f2", "#7fa8c9", "#527ba0", "#254e77"]


def level_to_github_color(level: int) -> str:
    return GITHUB_COLORS[level] if 0 <= level < len(GITHUB_COLORS) else GITHUB_COLORS[-1]


def gitlab_color(count: int) -> str:
    if count == 0: return GITLAB_COLORS[0]
    if count <= 2: return GITLAB_COLORS[1]
    if count <= 5: return GITLAB_COLORS[2]
    if count <= 9: return GITLAB_COLORS[3]
    return GITLAB_COLORS[4]


def combined_color(count: int) -> str:
    if count == 0: return GITHUB_COLORS[0]
    if count <= 2: return GITHUB_COLORS[1]
    if count <= 5: return GITHUB_COLORS[2]
    if count <= 9: return GITHUB_COLORS[3]
    return GITHUB_COLORS[4]


@router.get("/contributions/github")
async def github_contributions(username: str):
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"https://github.com/users/{username}/contributions", timeout=15.0)
        if resp.status_code != 200:
            return []
        pattern = r'data-ix="(\d+)"[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="contribution-day-component-\d+-\d+"[^>]*data-level="(\d)"'
        return [
            {"date": date, "count": int(level), "color": level_to_github_color(int(level)), "weekIndex": int(ix)}
            for ix, date, level in re.findall(pattern, resp.text)
        ]
    except Exception:
        return []


@router.get("/contributions/gitlab")
async def gitlab_contributions(username: str):
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"https://gitlab.com/users/{username}/calendar.json", timeout=15.0)
        if resp.status_code != 200:
            return []
        return [{"date": d, "count": c, "color": gitlab_color(c)} for d, c in resp.json().items()]
    except Exception:
        return []


@router.get("/contributions")
async def combined_contributions(github: str = "", gitlab: str = ""):
    merged: dict[str, dict] = {}
    if github:
        for e in await github_contributions(github):
            merged[e["date"]] = {"date": e["date"], "count": e["count"], "weekIndex": e.get("weekIndex")}
    if gitlab:
        for e in await gitlab_contributions(gitlab):
            if e["date"] in merged:
                merged[e["date"]]["count"] += e["count"]
            else:
                merged[e["date"]] = {"date": e["date"], "count": e["count"], "weekIndex": None}
    return [{**v, "color": combined_color(v["count"])} for v in merged.values()]
