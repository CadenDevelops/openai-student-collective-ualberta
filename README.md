# OpenAI Student Collective at UAlberta

The website for the OpenAI Student Collective chapter at the University of Alberta, plus the internal tools our leads use to run events.

Live at [studentcollectiveualberta.com](https://studentcollectiveualberta.com)

## What it does

**Public site**
- Landing page with our Discord and Luma links, upcoming events, programs, the team, and an FAQ
- Upcoming events are pulled live from our Luma calendar. The next event shows up at the top of the page so people scanning a poster QR code land right on the register button.

**Leads workspace** (`/leads`, sign in required)
- A form builder for event check-ins, interest forms, and feedback. Custom questions, required fields, drafts, scheduling, custom links, and a live preview.
- Response viewer with search, filters, summary charts, and CSV export
- QR code generator for any form or link
- A Discord announcement tool that posts plain messages or full embeds to our server through a webhook

Attendees don't need an account to fill out a form.

## Stack

- Next.js (App Router) and React, written in TypeScript
- Firebase Auth (Google sign in) and Firestore
- Hosted on Vercel
- Tests use Node's built in test runner

## How it's put together

```
src/
  app/          pages and API routes
  components/   UI, with the leads workspace in components/leads
  content/      site copy, links, and team info in one file
  lib/          forms, auth, Discord, and Luma logic
tests/          unit tests for validation, Discord payloads, and Luma times
```

All page content lives in `src/content/collective.ts`, so updating links or adding a lead doesn't mean touching any components.

## Security

I wanted the leads tools to be safe to run on a free tier with no one babysitting them, so:

- The browser never talks to Firestore directly. The rules deny everything, and every read and write goes through a server route that checks the session.
- Only verified Google accounts on a server side allowlist can sign in to `/leads`
- Public form submissions are validated on the server and rate limited by a hashed IP, so no raw IPs get stored. There's also a honeypot field and idempotency keys so a retry doesn't create a duplicate response.
- If two leads edit the same form at once, the second save is rejected instead of overwriting the first
- The Discord webhook URL stays on the server. Outgoing messages are checked against Discord's size limits, can only go to real Discord webhook URLs, and have @everyone pings turned off.

## Performance and accessibility

- The page is server rendered and re-reads Luma at most every 10 minutes
- Background animations only use transforms and pause when they scroll off screen. Measured on a 2x display, this took running animations from 31 down to 9 and cut layer memory from about 630 MB to 150 MB further down the page.
- Respects reduced motion, has a pause button, a skip link, visible focus states, and works without JavaScript

## Running it locally

Needs Node 24.

```sh
npm ci
cp .env.example .env.local   # fill in your Firebase values
npm run dev
```

Then open http://127.0.0.1:8000

Other scripts:

```sh
npm test            # unit tests
npm run typecheck
npm run format
npm run build
```

## Notes

- Luma's official API needs a paid plan, so events come from the public JSON their calendar page uses. It's parsed defensively and the page falls back to a link to Luma if anything goes wrong.
- `jwks-rsa` is pinned to 3.2.0 because version 4 breaks Firebase Admin on Vercel's Node runtime ([firebase-admin-node#3181](https://github.com/firebase/firebase-admin-node/issues/3181)).
