# Mobile + SOS Mode (BuckTracks)

## Mobile

- Viewport, safe-area insets, 48px+ touch targets
- PWA manifest with home-screen install
- SOS app shortcut → `/sos`
- Floating SOS FAB on all pages except SOS itself

## SOS mode

- Full-screen `/sos` for emergency use
- GPS + back bearing + maps link
- Offline: cache last fix, queue alert until online
- Call 911 button always available

Full UI: https://github.com/aross197/NS-Deer-Paradise (`app/sos`, `components/SosFab`)
