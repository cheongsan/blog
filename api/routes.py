import re
from typing import Optional
from fastapi import APIRouter, HTTPException
import httpx

from api.notion.services import get_notion_service

router = APIRouter()


@router.get("/posts")
async def get_posts(
    status: Optional[str] = None,
    type: Optional[str] = None,
):
    """포스트 목록. status/type은 쉼표 구분 문자열."""
    notion = get_notion_service()
    posts = await notion.get_posts()

    accept_status = status.split(",") if status else ["Public", "Pinned", "Archived"]
    accept_type = type.split(",") if type else ["Post"]

    return notion.filter_posts(posts, accept_status=accept_status, accept_type=accept_type)


@router.get("/posts/{slug}")
async def get_post_by_slug(slug: str):
    """슬러그로 포스트 메타데이터 조회."""
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



GITHUB_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"]
GITLAB_COLORS = ["#ebedf0", "#acd5f2", "#7fa8c9", "#527ba0", "#254e77"]


def level_to_github_color(level: int) -> str:
    if 0 <= level < len(GITHUB_COLORS):
        return GITHUB_COLORS[level]
    return GITHUB_COLORS[-1]


def gitlab_color(count: int) -> str:
    if count == 0: return GITLAB_COLORS[0]
    if count <= 2: return GITLAB_COLORS[1]
    if count <= 5: return GITLAB_COLORS[2]
    if count <= 9: return GITLAB_COLORS[3]
    return GITLAB_COLORS[4]


@router.get("/contributions/github")
async def github_contributions(username: str):
    """GitHub contributions - HTML scraping (no token needed)"""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"https://github.com/users/{username}/contributions",
                timeout=15.0,
            )
        if resp.status_code != 200:
            return []

        html = resp.text
        # Extract week index (data-ix), date, and level from each td
        pattern = r'data-ix="(\d+)"[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="contribution-day-component-\d+-\d+"[^>]*data-level="(\d)"'
        matches = re.findall(pattern, html)

        return [
            {"date": date, "count": int(level), "color": level_to_github_color(int(level)),
             "weekIndex": int(ix)}
            for ix, date, level in matches
        ]
    except Exception:
        return []


@router.get("/contributions/gitlab")
async def gitlab_contributions(username: str):
    """GitLab contributions - calendar.json (no token needed)"""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"https://gitlab.com/users/{username}/calendar.json",
                timeout=15.0,
            )
        if resp.status_code != 200:
            return []

        data = resp.json()
        return [
            {"date": date, "count": count, "color": gitlab_color(count)}
            for date, count in data.items()
        ]
    except Exception:
        return []


COMBINED_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"]


def combined_color(count: int) -> str:
    if count == 0: return COMBINED_COLORS[0]
    if count <= 2: return COMBINED_COLORS[1]
    if count <= 5: return COMBINED_COLORS[2]
    if count <= 9: return COMBINED_COLORS[3]
    return COMBINED_COLORS[4]


@router.get("/contributions")
async def combined_contributions(github: str = "", gitlab: str = ""):
    """GitHub + GitLab contributions 통합"""
    merged: dict[str, dict] = {}

    if github:
        gh = await github_contributions(github)
        for entry in gh:
            key = entry["date"]
            merged[key] = {"date": key, "count": entry["count"], "weekIndex": entry.get("weekIndex")}

    if gitlab:
        gl = await gitlab_contributions(gitlab)
        for entry in gl:
            key = entry["date"]
            if key in merged:
                merged[key]["count"] += entry["count"]
            else:
                merged[key] = {"date": key, "count": entry["count"], "weekIndex": None}

    return [
        {**v, "color": combined_color(v["count"])}
        for v in merged.values()
    ]
