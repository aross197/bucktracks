# DeerBook

**A quieter social network for hunters — built to be put down.**

No algorithms. No ads. No engagement traps. Designed for mental health.

## Live site

**https://aross197.github.io/bucktracks/**

## Features

- **Registration & Login** — email + password, stored in your browser
- **Status updates** — text + photo posts, chronological feed only
- **Stories** — photo stories that disappear after 24 hours
- **Messenger** — private chats, no read receipts
- **Notifications** — optional, gentle, fully controllable
- **Quiet Mode** — one-tap silence
- **Break reminders** — gentle prompt after ~20 minutes
- **Pause screen** — full-screen “go outside” break

## Mental health design

| What Facebook does | What DeerBook does |
|--------------------|--------------------|
| Algorithm pushes content | Chronological only |
| Ads & sponsored posts | Zero ads |
| Endless scroll pressure | Clean, intentional layout |
| Notification spam | Quiet Mode + optional alerts |
| Read receipts | None |
| Keeps you scrolling | Break reminders + pause |
| Data on their servers | Everything stays on your device |

## Files

```
bucktracks/
├── index.html      # Full DeerBook app
├── sw.js           # Service worker (notifications)
├── .nojekyll       # Ensures GitHub Pages works
├── README.md       # This file
└── bucktracks-hub.html  # Separate hub tool (optional)
```

## How to use

1. Open https://aross197.github.io/bucktracks/
2. Create an account (name, camp, email, password)
3. Share posts, stories, and messages
4. Use **Quiet Mode** or **Pause** anytime from your profile

## GitHub Pages

If the site shows 404:

1. Repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / folder: **/ (root)**
4. Save and wait ~30–60 seconds

## Privacy

All data (accounts, posts, photos, messages) is stored in **your browser’s localStorage**. Nothing is sent to a server. Clearing browser data will clear your DeerBook data.

---

*Designed to be put down.*
