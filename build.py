#!/usr/bin/env python3
"""Scan posts/*.md and generate posts.json index."""
import json
import re
import os
from pathlib import Path

POSTS_DIR = Path(__file__).parent / "posts"
OUTPUT = Path(__file__).parent / "posts.json"


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """Parse YAML-like frontmatter from Markdown text."""
    if not text.startswith("---"):
        return {}, text
    _, fm, body = text.split("---", 2)
    meta = {}
    for line in fm.strip().split("\n"):
        line = line.strip()
        if not line:
            continue
        match = re.match(r'(\w+):\s*"(.*)"', line)
        if match:
            meta[match.group(1)] = match.group(2)
        else:
            match = re.match(r"(\w+):\s*(.*)", line)
            if match:
                meta[match.group(1)] = match.group(2)
    return meta, body.strip()


def main():
    posts = []
    for md_file in sorted(POSTS_DIR.glob("*.md")):
        slug = md_file.stem
        text = md_file.read_text(encoding="utf-8")
        meta, body = parse_frontmatter(text)

        posts.append(
            {
                "slug": slug,
                "title": meta.get("title", slug),
                "date": meta.get("date", ""),
                "tag": meta.get("tag", ""),
                "tagClass": meta.get("tagClass", "tag-other"),
                "summary": meta.get("summary", body[:200].replace("\n", " ")),
            }
        )

    posts.sort(key=lambda p: p["date"], reverse=True)
    OUTPUT.write_text(
        json.dumps(posts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Generated {OUTPUT} with {len(posts)} posts.")


if __name__ == "__main__":
    main()
