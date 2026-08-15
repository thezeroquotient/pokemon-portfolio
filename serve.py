#!/usr/bin/env python3
"""Static server for the portfolio, plus a tiny shared "Pokémon drop" store.

- No-cache headers so edits always show on reload.
- GET  /api/state  -> {"count": N, "recent": [ids...]}   (the shared crowd)
- POST /api/drop   -> adds one random Pokémon, returns {"count", "added"}

State persists to pokedrops.json next to this file, so it is shared across
every visitor of this server and survives restarts. Becomes truly global once
the site is deployed on a public host.
"""
import http.server
import os
import json
import random
from functools import partial

PORT = 3210
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(DIRECTORY, "pokedrops.json")

ID_MIN, ID_MAX = 1, 1025         # official-artwork exists reliably in this range
MAX_RECENT = 40                  # how many of the crowd we show (count stays the true total)


def load_dropped():
    try:
        with open(DATA) as f:
            return json.load(f).get("dropped", [])
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def load_state():
    """count is the true global total; recent is just the last MAX_RECENT shown."""
    dropped = load_dropped()
    return {"count": len(dropped), "recent": dropped[-MAX_RECENT:]}


def save_dropped(dropped):
    with open(DATA, "w") as f:
        json.dump({"dropped": dropped}, f)


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def _json(self, obj, code=200):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.split("?")[0] == "/api/pokedrops":
            return self._json(load_state())
        return super().do_GET()

    def do_POST(self):
        if self.path.split("?")[0] == "/api/pokedrops":
            # drain any request body so the connection stays clean
            length = int(self.headers.get("Content-Length") or 0)
            if length:
                self.rfile.read(length)
            dropped = load_dropped()
            new_id = random.randint(ID_MIN, ID_MAX)
            dropped.append(new_id)
            save_dropped(dropped)
            return self._json({"count": len(dropped), "added": new_id})
        self.send_error(404)


if __name__ == "__main__":
    handler = partial(Handler, directory=DIRECTORY)
    http.server.HTTPServer.allow_reuse_address = True
    with http.server.HTTPServer(("", PORT), handler) as httpd:
        print(f"Serving {DIRECTORY} at http://localhost:{PORT} (no-cache + /api shared store)")
        httpd.serve_forever()
