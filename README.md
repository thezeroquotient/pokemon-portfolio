# Pokémon Portfolio

A playful, Pokémon‑themed personal portfolio. You land on a grassy field with a floating Poké Ball — tap it, it opens with a smooth animation, and you arrive at a clean profile page. The footer has a shared *"drop a Pokémon"* counter that grows as visitors stop by.

🔗 **Live demo:** https://thezeroquotient.com/portfolio

---

## What's inside

| File | What it is |
|------|------------|
| `index.html` | The landing — full‑screen grass + the Poké Ball (a short MP4 that plays on tap), a gentle wobble that leans toward your cursor, and a "Tap to meet…" hint. |
| `details.html` | The profile — a two‑column layout (About / Experience / Side Quests), an avatar that shows height/weight on hover, and the "drop a Pokémon" footer crowd. |
| `styles.css`, `script.js` | Shared styling and behavior. |
| `serve.py` | A tiny no‑cache Python server that also backs the shared counter at `/api/pokedrops`. |
| `home.mp4`, `poster.png`, `avatar.png`, `grass.jpg` | Assets. |

## Run it locally

```bash
python3 serve.py
# then open http://localhost:3210
```

Drops are saved to `pokedrops.json` next to the server and shared across everyone hitting it.

## How the Poké Ball animation works

The open is a short **MP4** (`home.mp4`) played on tap. It's encoded from a sequence of rendered frames with `ffmpeg`, upscaled and motion‑interpolated to 120fps for smoothness:

```bash
# 1) frames -> base video (frames not included — export your own)
ffmpeg -framerate 60 -i 'frames/Frame %d.jpg' \
  -vf "scale=-2:1440:flags=lanczos,unsharp=5:5:0.5" \
  -c:v libx264 -pix_fmt yuv420p -crf 15 -tune animation base.mp4

# 2) interpolate to a buttery 120fps
ffmpeg -i base.mp4 \
  -vf "minterpolate=fps=120:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" \
  -c:v libx264 -pix_fmt yuv420p -crf 17 -tune animation home.mp4
```

The still `poster.png` is just the first frame, shown before the video plays.

## Deploy

- **Static / simple:** upload the HTML/CSS/JS + assets to any host (Netlify, GitHub Pages, Vercel…). Without a backend, the counter gracefully falls back to per‑visitor.
- **Shared global counter:** run on a Python‑capable host (`serve.py`), or port the `/api/pokedrops` endpoint to a serverless function backed by a small KV store. The live site uses a Next.js API route + [Upstash Redis](https://upstash.com) on Vercel.

## Make it yours

- Swap `avatar.png` for your own character.
- Edit the copy in `details.html` (name, bio, experience, links).
- Replace the Poké Ball / grass art with your own.

## A note on assets

The Poké Ball, grassy backdrop, and Pokémon artwork are the intellectual property of **Nintendo / Game Freak / The Pokémon Company**. They're used here purely as a personal fan homage — this project is not affiliated with, sponsored by, or endorsed by them. If you build on this, please bring your own artwork. The **code** is free to learn from and adapt.

---

Built by **Shivank Goel** · [thezeroquotient.com](https://thezeroquotient.com)
