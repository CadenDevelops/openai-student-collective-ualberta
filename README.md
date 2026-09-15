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

Deployed directly with the Vercel CLI. To publish local updates, run
`npx vercel deploy --prod` from this directory. The local project is linked to
`caden9036-5252s-projects/openai-student-collective-ualberta`.
GitHub automatic deployments are not connected yet; Vercel requires a GitHub
login connection first. The redesign has not been pushed to GitHub. The old GitHub Pages setup serves static HTML and cannot run the
future server-backed check-in and admin features directly.

This deliverable implements the public landing page. Authentication, attendee
storage, check-in forms, and the admin panel are not yet implemented. Add those
as App Router routes with server-side authorization and validation when their
requirements are defined; do not store attendee data in this public content file.

No API keys or external accounts are needed to run the landing page.

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
