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
  // Answers may carry one inline [text](https://…) link, rendered by Answer.
  faq: [
    { q: "What is the OpenAI Student Collective?", a: "The OpenAI Student Collective is an official program that helps university students learn about AI and gain hands-on experience with tools like ChatGPT and Codex." },
    { q: "Who can participate?", a: "Students, staff, and faculty from the University of Alberta community are welcome to participate." },
    { q: "Do I need experience with AI or programming?", a: "No. Our events are designed for a range of experience levels, including complete beginners." },
    { q: "Are events free?", a: "Yes, Student Collective events are free to attend." },
    { q: "Do I need a paid ChatGPT subscription?", a: "No. Any tools or subscriptions required for an event will be provided." },
    { q: "What should I bring?", a: "Bring a laptop if you have one. Lab computers may also be available depending on the event." },
    { q: "What is the difference between a workshop and a studio session?", a: "Workshops are structured sessions focused on a specific topic or tool. Studio sessions are more flexible and give you time to ask questions, work on projects, and get help." },
    { q: "How do I register for an event?", a: "Register through our [events calendar](https://luma.com/openai-collective-ualberta). Registration details are also posted in the Discord announcements channel." },
    { q: "Where are events held?", a: "Events are held in person at the University of Alberta. The exact location will be included on each event page." },
    { q: "What if I register but cannot attend?", a: "Please cancel or update your registration so we have an accurate idea of attendance." },
    { q: "Will materials be shared afterward?", a: "Slides, resources, or other materials may be shared when possible. Recordings are not guaranteed." },
    { q: "Can the Collective help with a personal project?", a: "Yes. Studio sessions are a great place to bring questions, work on a project, or get feedback." },
    { q: "Can I use AI for coursework?", a: "That depends on the course and assignment. Always follow your instructor\u2019s guidance. If you are unsure, ask your instructor before using AI." },
    { q: "How can I request accessibility accommodations?", a: "Complete our [accessibility request form](https://studentcollectiveualberta.com/f/accessibility). Please submit requests as early as possible so we have time to make the necessary arrangements." },
    { q: "How can I suggest an event or workshop topic?", a: "Send Caden or Michael a message with your idea. We are always open to suggestions." },
    { q: "Is the Collective run by OpenAI?", a: "The Student Collective is an official OpenAI program. This chapter, including this site and our Discord server, is managed by the University of Alberta Campus Leads." },
    { q: "Where can I ask something that is not here?", a: "Ask in the Discord, or contact Caden or Michael directly." },
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
