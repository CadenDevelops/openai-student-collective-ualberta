# OpenAI Student Collective at the University of Alberta

An accessible, static club website designed for GitHub Pages.

## Update the club links

Edit `site-config.js` and add the complete URLs for Discord, Instagram, and the
UASU Rubric listing. Add either a plain email address or a `mailto:` link for email.

```js
window.CLUB_LINKS = {
  discord: "https://discord.gg/example",
  instagram: "https://www.instagram.com/example/",
  rubric: "https://campus.hellorubric.com/community/example/home",
  email: "club@example.ca",
};
```

Empty values are intentionally displayed as “coming soon” and cannot be activated.

## Preview locally

From this folder, run:

```sh
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173`.

## Accessibility

The site includes semantic landmarks, keyboard-visible focus styles, a skip link,
reduced-motion support, large controls, high contrast, and text alternatives for
meaningful interface elements.
