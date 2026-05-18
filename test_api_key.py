"""Quick smoke test for a Claude API key.

Usage:
    ANTHROPIC_API_KEY=sk-... python test_api_key.py
    ANTHROPIC_API_KEY=sk-... ANTHROPIC_BASE_URL=https://example.com python test_api_key.py
"""

import json
import os
import sys
import urllib.error
import urllib.request


def main() -> int:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ANTHROPIC_API_KEY is not set", file=sys.stderr)
        return 2

    base_url = os.environ.get("ANTHROPIC_BASE_URL", "https://api.anthropic.com").rstrip("/")
    model = os.environ.get("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")

    payload = {
        "model": model,
        "max_tokens": 32,
        "messages": [{"role": "user", "content": "Reply with exactly: pong"}],
    }

    req = urllib.request.Request(
        f"{base_url}/v1/messages",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "content-type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code} from {base_url}")
        print(e.read().decode("utf-8", errors="replace"))
        return 1
    except urllib.error.URLError as e:
        print(f"Network error: {e}")
        return 1

    text = "".join(b.get("text", "") for b in body.get("content", []) if b.get("type") == "text")
    print(f"OK  model={body.get('model')}  stop={body.get('stop_reason')}")
    print(f"reply: {text!r}")
    print(f"usage: {body.get('usage')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
