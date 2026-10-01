# BuckTracks Platform (Next.js)

Full hunting command center for northern Nova Scotia.

## Features

- **Crew Feed** — post kills/harvests, reactions, comments
- **Trail Cam Mass Dump Reader** — bulk upload + accurate detection design
- **I Am Lost** — GPS + back bearing + waypoints emailed to contacts
- **Seasons** — 2026–2027 NS deer data
- **Auth / journal / maps** — schema + docs ready

## Sync note

UI pages (landing, feed, cams, safety, dashboard) are fully built in:

**https://github.com/aross197/NS-Deer-Paradise**

Copy or subtree-merge that `app/` tree here and rebrand strings from "NS Deer Paradise" → **BuckTracks**.

Core already in this folder:

- `lib/seasons.ts`
- `lib/geo.ts`
- `prisma/schema.prisma`
- `package.json`

## Run

```bash
cd platform
npm install
cp .env.example .env.local
npx prisma db push
npm run dev
```
