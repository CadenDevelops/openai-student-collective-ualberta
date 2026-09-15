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
    eyebrow: "Events",
    title: "Events",
    description: "Workshops, project help, and demos. Open to all programs and experience levels.",
    formatsHeading: "Event formats",
    formats: [
      {
        title: "Workshops",
        description: "Learn a concept, try a tool, and build something in a guided session.",
      },
      {
        title: "Drop-in studio hours",
        description: "Bring a question or work in progress and get project help.",
      },
      {
        title: "Project demos",
        status: "Proposed format",
        description: "Share what you are making and exchange ideas with other students.",
      },
    ],
    upcomingHeading: "Upcoming events",
    upcomingDescription: "Dates and details will be shared here as plans are confirmed.",
    upcoming: [
      {
        title: "Collective workshop",
        format: "Workshop",
        description: "A guided session to learn a tool and build a small project.",
        date: "Date to be announced",
        status: "Planned",
      },
      {
        title: "Drop-in studio hours",
        format: "Drop-in studio hours",
        description: "Bring a question or work in progress for project help.",
        date: "Date to be announced",
        status: "Tentative",
      },
      {
        title: "Project demo session",
        format: "Project demos",
        description: "Share what you are making and see what others are working on.",
        date: "Date to be announced",
        status: "Tentative",
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
