# DeerBook

Your own Facebook-style social network. Runs in the browser on GitHub Pages.

**Live:** https://aross197.github.io/bucktracks/

## Features

- **Sign up / Log in** — stays logged in until you log out
- **Profile** — name, hometown, bio, profile photo
- **Feed** — posts, photos, likes, comments
- **Stories** — expire after 24 hours
- **Messenger** — private chats
- **Friends** — add people who sign up on the same device

## Quick start

1. Open https://aross197.github.io/bucktracks/
2. Sign Up (name, email, password 6+)
3. You stay logged in
4. Post, chat, edit profile, share stories

### Friends

Someone else must sign up on the **same phone/computer**. Log out → second account → log back in → Add Friend.

### Clear data

Menu → **Clear all data on this device** wipes accounts and posts on that browser only.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Full app |
| `sw.js` | Service worker |
| `.nojekyll` | GitHub Pages config |

Data is stored in the browser (`localStorage`). It is not shared across different phones or computers.
