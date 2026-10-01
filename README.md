# BuckTracks

**Every deer hunter's dream platform — built for Northern Nova Scotia.**

Free account → confirmation email → logged into paradise.

**Live (browser social):** https://aross197.github.io/bucktracks/  
**Full platform source:** this repo (`platform/` = Next.js app) · also mirrored at [NS-Deer-Paradise](https://github.com/aross197/NS-Deer-Paradise)

---

## What's in BuckTracks

| Feature | Description |
|--------|-------------|
| **Crew Feed** | Mini Facebook-style posts for kills/harvests — react (👍🔥🦌🫡🏹) and comment |
| **Mass Dump Trail Cam Reader** | Dump an SD card; EXIF + MegaDetector-class animal detection; filter empties; tag deer/bucks |
| **I Am Lost** | One button → GPS + **back bearing** to truck/home + waypoints emailed to emergency contacts |
| **Season Hub** | Live 2026–2027 NS deer dates, zones 101–112, bag limits |
| **Maps / Journal / Weather** | Crown land, hunt logs, solunar (in progress) |
| **Browser social (GitHub Pages)** | Sign up, feed, stories, messenger — runs at `/` via `index.html` |

---

## Repo layout

```
bucktracks/
├── index.html, app.js, sw.js   # GitHub Pages social app (DeerBook)
├── platform/                  # Full Next.js hunting platform
│   ├── app/                   # landing, feed, cams, safety, dashboard, auth
│   ├── lib/                   # seasons, geo (back bearing)
│   ├── prisma/                # users, posts, reactions, lost alerts, trail cams
│   └── docs/
└── README.md
```

---

## Run the full platform locally

```bash
git clone https://github.com/aross197/bucktracks.git
cd bucktracks/platform
npm install
cp .env.example .env.local
npx prisma generate && npx prisma db push
npm run dev
```

Open http://localhost:3000

---

## Safety note

**I Am Lost** helps share location and the walk-home bearing. It is not a substitute for 911, a PLB, or Search & Rescue.

Always follow current Nova Scotia DNR regulations. Hunt safe. Hunt ethical.

---

Built for the woods of northern Nova Scotia.
