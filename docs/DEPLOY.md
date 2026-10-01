# Deploy BuckTracks (GitHub Actions → Pages)

## Live URL

https://aross197.github.io/bucktracks/

## Workflow

File: `.github/workflows/pages.yml`

- **Trigger:** push to `main`, or manual **Run workflow**
- **Build:** copies static pages into `_site`
- **Deploy:** `actions/deploy-pages@v4`

Published files:

- `index.html` — command center
- `bucktracks-hub.html` — tactical cam hub
- `land-3d.html` — MapLibre standing view
- `sos.html` — precision SOS
- `field-guide.html` — scouting guide
- `logo.svg` / `logo.png` / `sw.js`

`platform/` (Next.js) is **not** published by this workflow.

## One-time repo setting (required)

1. Open **https://github.com/aross197/bucktracks/settings/pages**
2. Under **Build and deployment → Source**, choose **GitHub Actions**
3. Save

If Source is still “Deploy from a branch”, switch it to **GitHub Actions** so this workflow owns the site.

## Run / check

1. **Actions** tab → **Deploy BuckTracks to GitHub Pages**
2. Open the latest run (or **Run workflow**)
3. When green, open https://aross197.github.io/bucktracks/

## Permissions

The workflow uses:

- `pages: write`
- `id-token: write`
- `contents: read`

No secrets required for public static Pages.
