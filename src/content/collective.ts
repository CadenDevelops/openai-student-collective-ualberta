// Keep public community content here. Never put credentials or attendee data here.
// The canonical origin lives here too: link previews, the Discord webhook avatar
// and the form links shared into Discord all need the same absolute URL.
export const siteUrl = "https://studentcollectiveualberta.com";

// Links without a URL are simply not rendered rather than shown as dead placeholders.
export const collective = {
  name: "OpenAI Student Collective",
  university: "University of Alberta",
  links: {
    discord: "https://discord.gg/QzJvjYhubp",
    luma: "https://luma.com/openai-collective-ualberta",
  },
  team: [
    { name: "Caden Johnson", photo: "/caden-johnson.jpg", linkedin: "https://www.linkedin.com/in/caden-johnson-82ba12366/", instagram: "https://www.instagram.com/caden_j07/", role: "Campus Lead", program: "BSc Honours in Computing Science (Artificial Intelligence)" },
    { name: "Michael Seguin", photo: "/michael-seguin.jpg", linkedin: "https://www.linkedin.com/in/michaeltseguin/", instagram: "https://www.instagram.com/michaelseguinn/", role: "Campus Lead", program: "BCom in Accounting, with a minor in Strategy Management and a Certificate in Leadership" },
  ],
  events: {
    // One honest scheduling line for the whole section, rather than a placeholder date per card.
    note: "Dates for the first sessions are announced on Discord.",
    formats: [
      {
        title: "Workshops",
        description: "Try the latest AI tools and build something new, with guidance along the way.",
        image: "/events/workshops.webp",
        alt: "Students attending an OpenAI workshop in a lecture hall.",
      },
      {
        title: "Studio Sessions",
        description: "Bring your project, find people to work with, and get help when you need it.",
        image: "/events/studio-sessions.webp",
        alt: "Students collaborating around a table at an OpenAI community event.",
      },
      {
        title: "Showcases",
        description: "Share what you’ve made and see what other students are creating with AI.",
        image: "/events/showcases.webp",
        alt: "A speaker presenting a project at an OpenAI community event.",
      },
    ],
  },
};

export function externalUrl(value: string): string | undefined {
  if (!value) return undefined;
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("Community links must use HTTPS.");
  return url.href;
}
