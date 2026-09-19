# OpenAI Student Collective at UAlberta

A minimal Next.js landing page with a full-height hero, animated colour gradients,
community links, and campus lead profiles. The information starts below the first
screen. This is a redesign of the existing collective website in a separate checkout
on `redesign/quiet-landing`; the previous published site has not been replaced.

## Develop

Use Node.js 20.9 or newer.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:8000. For a production build, run `npm run build`, then
`npm start`. `npm run typecheck` checks TypeScript independently.

## Content

Edit `src/content/collective.ts` for links, names, roles, and programs. Discord
and Luma are configured with the supplied URLs; Instagram is intentionally empty
until one is supplied. A destination without a URL is not rendered at all, so the
link hub never shows a row that cannot be clicked; adding a URL adds its row to
the stack with no CSS change. Only HTTPS links are accepted.

Team content: Caden's name, role, and program were supplied by Caden. Michael's
spelling and program were verified against the OpenAI Student Collective
introduction email dated August 29, 2026. No email addresses or private email
content are included in the website.

## Design and accessibility

- The main content is rendered on the server; only motion controls and scroll
  reveals require client JavaScript.
- Local Inter font files avoid third-party font requests.
- The OpenAI logo is the unmodified white monoblossom SVG from the official
  [OpenAI logo package](https://cdn.openai.com/brand/OpenAI-Logos-2025.zip).
  OpenAI owns the logo; its use was authorized by the user for this collective.
- The animated background uses three CSS gradient layers, with transform-only
  movement, rather than a video or a 3D runtime.
- Reduced-motion preferences disable animation and smooth scrolling. A pause
  control also stores the visitor's preference locally. Without JavaScript the
  background stays still and all page content remains visible.
- Semantic headings, visible keyboard focus, a skip link, and responsive layouts
  support keyboard and screen-reader navigation.

## Hosting and future backend

Production: https://studentcollectiveualberta.com

The domain is registered at Porkbun and its nameservers point at Vercel, which
serves both the apex and `www` and issues the certificates. The canonical origin
is exported once as `siteUrl` in `src/content/collective.ts`; link previews, the
Discord webhook avatar and the form links shared into Discord all read it from
there, so a future domain change is a single line.

Deployment is manual, from a checkout: run `npx vercel deploy --prod`. There is
no GitHub integration on this project, so pushing a branch does not publish
anything. The `main` branch still holds the earlier static site, on an unrelated
history. The linked Vercel project is
`caden9036-5252s-projects/openai-student-collective-ualberta`.

 The old GitHub Pages setup serves static HTML and cannot run the
future server-backed check-in and admin features directly.

## Leads workspace and forms

`/leads` uses Google sign-in with a server-side email allowlist. Only verified
accounts in `LEAD_EMAILS` can create sessions or access any leads API. Sessions
last five days and are checked for revocation. Michael must be added explicitly.
There is no public navigation link to the workspace; authorization protects it.

The workspace supports check-in, interest, and feedback templates; custom
questions; required fields; reordering; drafts; publication and closure; scheduling;
duplication; live preview; shareable URLs; QR downloads; response details;
search and filters; summary charts; and CSV export. Attendees do not sign in.
Old responses preserve their original question labels and form version.
Conflicting edits are rejected rather than overwriting someone else's changes.

Firebase project: `ualberta-student-collective`. Firestore is in
`northamerica-northeast1` (Montréal). The project uses its no-cost Spark plan.
Vercel production environment variables hold the server credentials; use
`.env.example` as a reference. No credentials are committed. Firebase browser
configuration is intentionally public; database rules deny direct browser access.
All database access passes through server endpoints with explicit authorization.

Run `npm test` for validation and CSV tests, and `npm run build` for production.
Deploy database rules with `npx firebase-tools deploy --only firestore:rules
--project ualberta-student-collective`.

Operational limits: lists show the latest 200 forms; response pages load 100 at
a time and clearly label summaries as applying to loaded responses. CSV export
supports up to 10,000 responses per form. Totals represent submissions, not unique
people. Public submission endpoints use server validation, a honeypot, hashed
IP/form rate buckets (300 per ten minutes to allow shared campus networks), and
transactional idempotency for retries. Rate records contain no raw IP addresses.
These controls deter simple spam; they are not identity verification or App Check.
No Luma integration or automated AI processing of attendee data is enabled.

## Latest design revision

The hero title is smaller, and violet and teal gradients continue into the lower
sections. Program descriptions follow https://openai.com/student-collective/.
Michael’s profile photo was sourced from LinkedIn’s connection email. Caden’s
profile photo and the shared campus photo were retrieved from his signed-in
LinkedIn profile and announcement post, with his permission. Both are served
locally so the page does not depend on expiring LinkedIn image URLs.

Photo sources:
- https://www.linkedin.com/in/caden-johnson-82ba12366/
- https://www.linkedin.com/feed/update/urn:li:activity:7501032157247881216/

## Motion and link previews

The hero uses animated orbital paths, drifting stars, and a faint perspective grid.
The pause control and reduced-motion preference cover all background animation.
`src/app/opengraph-image.tsx` generates the branded 1200 by 630 PNG for shared links;
it contains no team photo. Existing messages may retain cached previews.

### Form appearance and check-in fields

Each form has Aurora, Moving grid, or Plain backgrounds and an animation toggle.
Attendees can pause motion; reduced-motion preferences override animations.
Check-in includes campus role (students, faculty, staff, alumni, visitors), faculty,
and faculty-dependent program choices. Year appears only for students. Other
programs can be entered as text. The program list is a broad check-in list, not
a complete admissions catalogue; maintain it in `src/lib/programs.ts`.
The QR codes tab generates PNGs locally for any HTTP(S) link.

Runtime: Node 24. `jwks-rsa` is pinned to 3.2.0 because version 4 requires
ESM-through-require support disabled in the Vercel runtime. Firebase Auth module
loading is verified with `node --no-experimental-require-module` before release.
Track upstream: https://github.com/firebase/firebase-admin-node/issues/3181.

## Discord announcements

The leads dashboard has a Discord tool for regular messages and a full single-embed
editor (author, title/link, description, accent colour, thumbnail, image, up to 25
fields, footer, and send timestamp). Published forms can populate either mode.
Messages send only when a lead presses Send. The preview is approximate for Markdown.

The webhook URL is stored in the private Firestore `settings/discord` document,
never returned by the API or stored in browser storage. Only approved lead sessions
can configure or send. The server accepts only Discord HTTPS webhook endpoints,
blocks redirects, enforces Discord size limits, and disables mention notifications.
Every post uses the collective name and the OpenAI logo PNG. Use a text-channel
webhook; forum/thread webhooks are not supported. A delivery timeout may be
ambiguous: check the channel before retrying. No webhook has been configured by
the implementation workflow and no live Discord test message has been sent.

## Event information

Event formats are in `src/content/collective.ts`. Scheduling is a single
`events.note` line under the gallery rather than a placeholder date on each card,
so three identical “date to be announced” lines cannot make the site look stalled.
The landing page keeps the hero simple and displays these details below the fold.
Instagram has been removed from the public page.

## Interface revision

A pass over the landing page, September 15, 2026:

- The link hub renders only links that exist, as a stack of full-width rows
  inside a framed panel. It sits in the hero rather than below it: the page is
  handed out as a QR code, so a scan has to land with both destinations already
  on screen. Each row carries its own `--brand`/`--brand-2` pair (Discord
  blurple, Luma warm red) and nothing else changes per service. Rows are 80px
  and up, well past the 44px touch minimum, and `:active` scales them slightly
  so a tap reads on a phone, where there is no hover to fall back on.
- The atmosphere is pinned to the hero's own box rather than to a fixed height,
  so the first screen can grow with what it holds and the background always
  ends where the hero does.
- `.about-figure` closes the About section: three tilted CSS rings with
  travelling highlights, echoing the hero's orbital motif. It is decorative,
  so it is `aria-hidden` and carries no text, and it honours the pause control
  and `prefers-reduced-motion` like the rest of the page. It deliberately does
  not involve the OpenAI blossom — that mark is used under permission and should
  not be rotated, recoloured, or animated. The rings hold still and only the
  highlight travels; animating the ring transforms would converge all three on a
  shared keyframe and stack them on top of each other.
- Running prose in the About section is left-aligned inside a centred column;
  only the eyebrow and heading stay centred.
- The dock sits in `.connect-band`, whose gradient fades into the first chapter,
  replacing the flat dark strip that used to read as a seam.
- The campus photo is cropped square with `object-position: 50% 90%` and graded to
  match the palette. The offset is chosen to keep both figures whole and must be
  re-checked if the photo is replaced.
- The hero is `92svh` under 760px so the Discord card is visible above the fold.
- `globals.css` was consolidated from five appended override layers into one
  cascade. Dead rules were removed (`.events-glow`, which was built and then
  hidden; `.member-monogram`, which had no markup; `.event-date`). Several
  declarations that were silently overridden by a later duplicate are now stated
  once at their effective value. The `prefers-contrast: more` dimming of the
  colour fields had been cancelled by a later `opacity` declaration and now
  applies.
