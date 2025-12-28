# MindMint is a Base Mini App that delivers a 60‑second daily aura reset: breathe, spin the aura wheel, and receive guidance plus an affirmation.

## Status
🚧 MVP in progress.

## What it does (MVP)
- Spin the aura wheel for a daily (or practice) aura
- Receive an aura tip and related affirmation
- Optional mindfulness audio during the flow
- Single-page mini app experience at `/`

## Tech (initial)
- Next.js (App Router)
- Vercel deployment
- Web Audio API (sound)

## Analytics (optional)
Set the following environment variables to enable PostHog:

```
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

## Base Verification
This app includes a verification meta tag in the site `<head>` for Base Mini App ownership validation.

Example:
```html
<meta name="base:app_id" content="69400b49d19763ca26ddc309" />
