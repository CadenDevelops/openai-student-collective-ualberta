(() => {
  const links = window.CLUB_LINKS || {};
  const cards = document.querySelectorAll("[data-club-link]");

  for (const card of cards) {
    const key = card.dataset.clubLink;
    const value = typeof links[key] === "string" ? links[key].trim() : "";
    const status = card.querySelector("[data-link-status]");

    if (!value) {
      card.setAttribute("aria-disabled", "true");
      card.removeAttribute("href");
      card.removeAttribute("target");
      card.removeAttribute("rel");
      continue;
    }

    const href = key === "email" && !value.startsWith("mailto:") ? `mailto:${value}` : value;
    card.href = href;
    card.removeAttribute("aria-disabled");

    if (key !== "email") {
      card.target = "_blank";
      card.rel = "noopener noreferrer";
    }

    if (status) {
      status.textContent = key === "email" ? "Send an email ↗" : "Open link ↗";
    }
  }

  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
