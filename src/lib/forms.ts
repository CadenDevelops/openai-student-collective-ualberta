import { programs, programOptions } from "./programs";
export type Field = {
  id: string;
  label: string;
  type: "text" | "email" | "textarea" | "select" | "multi" | "program";
  required: boolean;
  options: string[];
};
export type FormDefinition = {
  id: string;
  title: string;
  description: string;
  confirmation: string;
  privacy: string;
  background: "aurora" | "grid" | "none";
  animated: boolean;
  status: "draft" | "published" | "closed";
  opensAt: string;
  closesAt: string;
  fields: Field[];
  version: number;
  createdAt: string;
  updatedAt: string;
  count: number;
};
export type Submission = {
  id: string;
  createdAt: string;
  version: number;
  answers: Record<string, string | string[]>;
  fields: Field[];
};
const campusFields: Field[] = [
      { id: "role", label: "Campus role", type: "select", required: true, options: ["Undergraduate student", "Graduate student", "Faculty member", "Staff", "Alumni", "Visitor / other"] },
      { id: "faculty", label: "Faculty", type: "select", required: true, options: Object.keys(programs) },
      { id: "program", label: "Program", type: "program", required: true, options: [] },
      { id: "program_other", label: "Program name", type: "text", required: false, options: [] },
      { id: "year", label: "Year of study", type: "select", required: false, options: ["1", "2", "3", "4", "5+"] },
];
export const templates = {
  checkin: {
    title: "Event check-in",
    description: "Check in for this event.",
    fields: [
      {
        id: "name",
        label: "Your name",
        type: "text",
        required: true,
        options: [],
      },
      ...campusFields,
      {
        id: "source",
        label: "How did you hear about us?",
        type: "select",
        required: false,
        options: [
          "Friend",
          "Discord",
          "Instagram",
          "Campus poster",
          "Class announcement",
          "Other",
        ],
      },
    ],
  },
  interest: {
    title: "Stay in the loop",
    description: "Tell us what interests you and when events work best. Select all options that suit you. Times are Edmonton time.",
    fields: [
      {
        id: "name",
        label: "Your name",
        type: "text",
        required: true,
        options: [],
      },
      {
        id: "email",
        label: "Email address",
        type: "email",
        required: true,
        options: [],
      },
      ...campusFields,
      {
        id: "interest",
        label: "What interests you?",
        type: "multi",
        required: false,
        options: [
          "Workshops",
          "Building projects",
          "Meeting people",
          "Learning about AI",
        ],
      },
      {
        id: "available_days",
        label: "Which days usually work for you?",
        type: "multi",
        required: false,
        options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      },
      {
        id: "preferred_times",
        label: "What times work best?",
        type: "multi",
        required: false,
        options: ["Morning · 9 am–noon", "Lunch · noon–2 pm", "Afternoon · 2–5 pm", "Early evening · 5–7 pm", "Evening · 7–9 pm"],
      },
      {
        id: "event_length",
        label: "Ideal event length",
        type: "select",
        required: false,
        options: ["30 minutes", "1 hour", "90 minutes", "2 hours", "No preference"],
      },
      {
        id: "availability_notes",
        label: "Any scheduling details? (optional)",
        type: "text",
        required: false,
        options: [],
      },
    ],
  },
  feedback: {
    title: "How did it go?",
    description: "Help us make the next one even better.",
    fields: [
      {
        id: "rating",
        label: "How was your experience?",
        type: "select",
        required: true,
        options: ["Great", "Good", "Okay", "Could be better"],
      },
      {
        id: "feedback",
        label: "Anything you’d like us to know?",
        type: "textarea",
        required: false,
        options: [],
      },
    ],
  },
} satisfies Record<
  string,
  { title: string; description: string; fields: Field[] }
>;
export function makeForm(
  kind: keyof typeof templates,
): Omit<FormDefinition, "id"> {
  const t = templates[kind];
  const now = new Date().toISOString();
  return {
    ...t,
    fields: structuredClone(t.fields),
    confirmation:
      kind === "checkin"
        ? "You’re checked in."
        : "Thanks! Your response has been saved.",
    privacy:
      "Your responses are visible to the UAlberta OpenAI Student Collective Campus Leads and used to organize and improve our activities. Please do not include sensitive personal information.",
    background: "aurora",
    animated: true,
    status: "draft",
    opensAt: "",
    closesAt: "",
    version: 1,
    createdAt: now,
    updatedAt: now,
    count: 0,
  };
}
export function validateDefinition(value: unknown) {
  if (!value || typeof value !== "object") throw new Error("Invalid form.");
  const d = value as FormDefinition;
  for (const [key, max] of [
    ["title", 160],
    ["description", 2000],
    ["confirmation", 500],
    ["privacy", 2000],
  ] as const) {
    if (
      typeof d[key] !== "string" ||
      d[key].length > max ||
      (key !== "description" && !d[key].trim())
    )
      throw new Error(`Please check the ${key}.`);
  }
  if (!["draft", "published", "closed"].includes(d.status))
    throw new Error("Invalid status.");
  if (!Array.isArray(d.fields) || d.fields.length < 1 || d.fields.length > 25)
    throw new Error("Use between 1 and 25 questions.");
  const ids = new Set<string>();
  for (const f of d.fields) {
    if (
      !f ||
      typeof f.id !== "string" ||
      !/^[a-zA-Z0-9_-]{1,64}$/.test(f.id) ||
      ["__proto__", "constructor", "prototype"].includes(f.id) ||
      ids.has(f.id)
    )
      throw new Error("Invalid question identifier.");
    ids.add(f.id);
    if (
      typeof f.label !== "string" ||
      !f.label.trim() ||
      f.label.length > 250 ||
      !["text", "email", "textarea", "select", "multi", "program"].includes(f.type) ||
      typeof f.required !== "boolean"
    )
      throw new Error("Check your question labels and types.");
    if (
      !Array.isArray(f.options) ||
      f.options.length > 30 ||
      f.options.some(
        (o) => typeof o !== "string" || !o.trim() || o.length > 200,
      ) ||
      new Set(f.options).size !== f.options.length
    )
      throw new Error(
        "Options must be unique, non-empty, and under 200 characters.",
      );
    if (["select", "multi"].includes(f.type) && !f.options.length)
      throw new Error("Choice questions need at least one option.");
  }
  if (d.fields.some(f => f.type === "program") && !d.fields.some(f => f.id === "faculty" && f.type === "select")) throw new Error("Program questions need a Faculty dropdown (id: faculty).");
  if (d.background !== undefined && !["aurora", "grid", "none"].includes(d.background)) throw new Error("Invalid background.");
  if (d.animated !== undefined && typeof d.animated !== "boolean") throw new Error("Invalid animation setting.");
  for (const k of ["opensAt", "closesAt"] as const)
    if (
      typeof d[k] !== "string" ||
      (d[k] && !Number.isFinite(Date.parse(d[k])))
    )
      throw new Error("Invalid opening or closing time.");
  if (
    d.opensAt &&
    d.closesAt &&
    Date.parse(d.opensAt) >= Date.parse(d.closesAt)
  )
    throw new Error("Closing time must be after opening time.");
  return {
    background: d.background ?? "aurora",
    animated: d.animated ?? true,
    title: d.title.trim(),
    description: d.description,
    confirmation: d.confirmation,
    privacy: d.privacy,
    status: d.status,
    opensAt: d.opensAt,
    closesAt: d.closesAt,
    fields: d.fields.map((f) => ({
      id: f.id,
      label: f.label.trim(),
      type: f.type,
      required: f.required,
      options: f.options,
    })),
  };
}
export function isOpen(
  f: Pick<FormDefinition, "status" | "opensAt" | "closesAt">,
  now = Date.now(),
) {
  return (
    f.status === "published" &&
    (!f.opensAt || Date.parse(f.opensAt) <= now) &&
    (!f.closesAt || Date.parse(f.closesAt) > now)
  );
}
export function validateAnswers(fields: Field[], value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Please complete the form.");
  const answers: Record<string, string | string[]> = Object.create(null);
  for (const f of fields) {
    if (!fieldVisible(f, fields, value as Record<string, unknown>)) continue;
    const v = (value as Record<string, unknown>)[f.id];
    if (f.type === "multi") {
      if (
        v !== undefined &&
        (!Array.isArray(v) ||
          v.some((x) => typeof x !== "string" || !f.options.includes(x)) ||
          new Set(v).size !== v.length)
      )
        throw new Error(`Check “${f.label}”.`);
      const a = (v ?? []) as string[];
      if (f.required && !a.length)
        throw new Error(`Please answer “${f.label}”.`);
      answers[f.id] = a;
    } else {
      if (v !== undefined && typeof v !== "string")
        throw new Error(`Check “${f.label}”.`);
      const a = ((v ?? "") as string).trim();
      if (f.required && !a) throw new Error(`Please answer “${f.label}”.`);
      if (a.length > (f.type === "textarea" ? 4000 : 500))
        throw new Error(`“${f.label}” is too long.`);
      if (a && f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a))
        throw new Error("Enter a valid email address.");
      if (a && f.type === "select" && !f.options.includes(a))
        throw new Error(`Choose an option for “${f.label}”.`);
      if (a && f.type === "program" && !programOptions((value as Record<string,unknown>).faculty).includes(a)) throw new Error("Choose a program for the selected faculty.");
      answers[f.id] = a;
    }
  }
  return answers;
}
export function csvCell(value: unknown) {
  let s = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
}

export function fieldVisible(f: Field, fields: Field[], answers: Record<string, unknown>) {
  const hasRole = fields.some(x => x.id === "role" && x.type === "select");
  if (f.id === "year" && hasRole) return ["Undergraduate student", "Graduate student"].includes(String(answers.role));
  if (f.id === "program_other" && fields.some(x => x.id === "program" && x.type === "program")) return answers.program === "Other";
  return true;
}
