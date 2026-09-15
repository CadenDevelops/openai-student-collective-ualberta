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

Open http://127.0.0.1:3000. For a production build, run `npm run build`, then
`npm start`. `npm run typecheck` checks TypeScript independently.

## Content

Edit `src/content/collective.ts` for links, names, roles, and programs. Discord is
configured with the supplied invite. Luma and Instagram are intentionally empty
until their URLs are supplied. Empty social destinations display “Link coming soon”
instead of linking to an unrelated page; the events button scrolls to this section.
Only HTTPS links are accepted.

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

Production: https://openai-student-collective-ualberta.vercel.app

The GitHub repository is connected to Vercel. Pushes to `redesign/quiet-landing`
automatically deploy to production. The `main` branch retains the earlier static
site. For an explicit local deployment, run `npx vercel deploy --prod`.
The linked Vercel project is
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
