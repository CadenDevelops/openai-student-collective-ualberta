"use client";
import { useRef, useState } from "react";
import { fieldVisible, type FormDefinition, type Field } from "@/lib/forms";
import { programOptions } from "@/lib/programs";
import { FormBackground } from "./form-background";
export function Question({
  field: f,
  value,
  onChange,
}: {
  field: Field;
  value: string | string[];
  onChange: (v: string | string[]) => void;
}) {
  const id = `field-${f.id}`;
  return (
    <div className="question">
      {f.type === "multi" ? (
        <fieldset>
          <legend>
            {f.label}
            {f.required ? " *" : ""}
          </legend>
          <p className="choice-hint">Select all that apply.</p>
          <div className="choice-list">
            {f.options.map((o) => (
              <label key={o} className="choice">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(o)}
                  onChange={(e) => {
                    const a = Array.isArray(value) ? value : [];
                    onChange(
                      e.target.checked ? [...a, o] : a.filter((x) => x !== o),
                    );
                  }}
                />
                <span className="choice-label">{o}</span>
                <span className="choice-mark" aria-hidden="true">{Array.isArray(value) && value.includes(o) ? "✓" : "+"}</span>
              </label>
            ))}
          </div>
          {f.required && <small>Select at least one.</small>}
        </fieldset>
      ) : (
        <>
          <label htmlFor={id}>
            {f.label}
            {f.required ? " *" : ""}
          </label>
          {(f.type === "select" || f.type === "program") ? (
            <select
              id={id}
              value={value as string}
              required={f.required}
              onChange={(e) => onChange(e.target.value)}
            >
              <option value="">Choose an option</option>
              {f.options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ) : f.type === "textarea" ? (
            <textarea
              id={id}
              rows={4}
              maxLength={4000}
              value={value as string}
              required={f.required}
              onChange={(e) => onChange(e.target.value)}
            />
          ) : (
            <input
              id={id}
              type={f.type}
              maxLength={500}
              required={f.required}
              autoComplete={
                f.type === "email" ? "email" : f.id === "name" ? "name" : "off"
              }
              value={value as string}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
        </>
      )}
    </div>
  );
}
export function PublicForm({
  form,
  preview = false,
}: {
  form: FormDefinition;
  preview?: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const key = useRef("");
  const [website, setWebsite] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (preview) return;
    setBusy(true);
    setError("");
    if (!key.current) key.current = crypto.randomUUID();
    try {
      const r = await fetch(`/api/forms/${form.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          key: key.current,
          version: form.version,
          website,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setDone(d.confirmation);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  if (done)
    return (
      <section className="panel attendee-form success" role="status">
        <span className="success-mark" aria-hidden="true">
          ✓
        </span>
        <h1>All done.</h1>
        <p>{done}</p>
        <a className="action" href="/">
          Explore the collective ↗
        </a>
      </section>
    );
  return (
    <div className="form-scene"><FormBackground background={form.background} animated={form.animated} /><form className="panel attendee-form" onSubmit={submit}>
      <span className="pill">
        {preview
          ? "Preview · responses won’t be saved"
          : "UAlberta Student Collective"}
      </span>
      <h1>{form.title}</h1>
      <p className="muted">{form.description}</p>
      <p className="small muted">Fields marked * are required.</p>
      <div className="questions">
        {form.fields.filter(f => fieldVisible(f, form.fields, answers)).map((f) => (
          <Question
            key={f.id}
            field={f.type === "program" ? {...f, options: programOptions(answers.faculty)} : f}
            value={answers[f.id] ?? (f.type === "multi" ? [] : "")}
            onChange={(v) => setAnswers(old => {
              const next = {...old, [f.id]: v};
              if (f.id === "faculty") { for (const dependent of form.fields.filter(x => x.type === "program")) next[dependent.id] = ""; next.program_other = ""; }
              return next;
            })}
          />
        ))}
      </div>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>
      <p className="privacy">{form.privacy}</p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <button className="action primary wide" disabled={busy || preview}>
        {busy
          ? "Saving your response…"
          : preview
            ? "Preview only"
            : "Submit response"}{" "}
        <span aria-hidden="true">↗</span>
      </button>
    </form></div>
  );
}
