// Keep public community content here. Never put credentials or attendee data here.
// Empty URLs get an honest unavailable state rather than a fabricated destination.
export const collective = {
  name: "OpenAI Student Collective",
  university: "University of Alberta",
  links: {
    discord: "https://discord.gg/QzJvjYhubp",
    luma: "",
    instagram: "",
  },
  team: [
    { name: "Caden Johnson", photo: "/caden-johnson.jpg", linkedin: "https://www.linkedin.com/in/caden-johnson-82ba12366/", role: "Campus Lead", program: "BSc Honours in Computing Science (Artificial Intelligence)" },
    { name: "Michael Seguin", photo: "/michael-seguin.jpg", linkedin: "https://www.linkedin.com/in/michaeltseguin/", role: "Campus Lead", program: "Accounting, with a minor in Strategy Management and a Certificate in Leadership" },
  ],
};

export function externalUrl(value: string): string | undefined {
  if (!value) return undefined;
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("Community links must use HTTPS.");
  return url.href;
}
