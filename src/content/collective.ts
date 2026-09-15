// Keep public community content here. Never put credentials or attendee data here.
// Empty URLs get an honest unavailable state rather than a fabricated destination.
export const collective = {
  name: "OpenAI Student Collective",
  university: "University of Alberta",
  links: {
    discord: "https://discord.gg/QzJvjYhubp",
    luma: "",
  },
  team: [
    { name: "Caden Johnson", photo: "/caden-johnson.jpg", linkedin: "https://www.linkedin.com/in/caden-johnson-82ba12366/", role: "Campus Lead", program: "BSc Honours in Computing Science (Artificial Intelligence)" },
    { name: "Michael Seguin", photo: "/michael-seguin.jpg", linkedin: "https://www.linkedin.com/in/michaeltseguin/", role: "Campus Lead", program: "Accounting, with a minor in Strategy Management and a Certificate in Leadership" },
  ],
  events: {
    formats: [
      {
        title: "Workshops",
        description: "Try the latest AI tools and build something new, with guidance along the way.",
        image: "/events/workshops.webp",
        alt: "Students attending an OpenAI workshop in a lecture hall.",
        date: "First workshop · Date to be announced",
      },
      {
        title: "Studio Hours",
        description: "Bring your project, find people to work with, and get help when you need it.",
        image: "/events/studio-hours.webp",
        alt: "Students collaborating around a table at an OpenAI community event.",
        date: "First session · Date to be announced",
      },
      {
        title: "Showcases",
        description: "Share what you’ve made and see what other students are creating with AI.",
        image: "/events/showcases.webp",
        alt: "A speaker presenting a project at an OpenAI community event.",
        date: "First showcase · Date to be announced",
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
