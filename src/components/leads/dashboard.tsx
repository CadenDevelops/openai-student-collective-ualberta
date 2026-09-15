"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { type FormDefinition, type Submission, type Field } from "@/lib/forms";
import { PublicForm } from "./public-form";
import { DiscordPanel } from "./discord";
async function api(path: string, method = "GET", data?: unknown) {
  const r = await fetch(`/api/leads/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error ?? "Something went wrong.");
  return d;
}
const answer = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v.join(", ") : v || "—";
const date = (s: string) =>
  new Date(s).toLocaleString("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
export function Dashboard({ email }: { email: string }) {
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [view, setView] = useState("overview");
  const [selected, setSelected] = useState<FormDefinition | null>(null);
  const [tab, setTab] = useState("edit");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dirty, setDirty] = useState(false);
  const [search, setSearch] = useState("");
  async function load() {
    setError("");
    try {
      setForms((await api("forms")).forms);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    function warn(e: BeforeUnloadEvent) {
      if (dirty) e.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function leave() {
    return !dirty || window.confirm("Leave without saving your changes?");
  }
  function open(f: FormDefinition, t = "edit") {
    if (!leave()) return;
    setSelected(structuredClone(f));
    setTab(t);
    setDirty(false);
    setNotice("");
    setError("");
  }
  function patch(p: Partial<FormDefinition>) {
    setSelected((f) => (f ? { ...f, ...p } : f));
    setDirty(true);
    setNotice("");
  }
  async function create(template: string) {
    if (!leave()) return;
    setBusy(true);
    setError("");
    try {
      const d = await api("forms", "POST", { template });
      setForms((f) => [d.form, ...f]);
      setSelected(d.form);
      setTab("edit");
      setDirty(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save(status?: FormDefinition["status"]) {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const d = await api(`forms/${selected.id}`, "PUT", {
        ...selected,
        status: status ?? selected.status,
      });
      setSelected(d.form);
      setForms((f) => f.map((x) => (x.id === d.form.id ? d.form : x)));
      setDirty(false);
      setNotice(
        status === "published"
          ? "Form published."
          : status === "closed"
            ? "Form closed."
            : "Changes saved.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function duplicate() {
    if (!selected || !leave()) return;
    setBusy(true);
    try {
      const d = await api(`forms/${selected.id}`, "POST", {
        action: "duplicate",
      });
      setForms((f) => [d.form, ...f]);
      setSelected(d.form);
      setTab("edit");
      setDirty(false);
      setNotice("Created a draft copy.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function removeAllForms() {
    if (!window.confirm("Permanently delete ALL forms, responses, and saved versions? This cannot be undone. Shared form links will stop working.")) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api("forms", "DELETE", { confirmation: "DELETE ALL FORMS" });
      setSelected(null);
      setDirty(false);
      setForms([]);
      setSearch("");
      setNotice("All forms and responses deleted.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    if (!leave()) return;
    await fetch("/api/session", { method: "DELETE" });
    window.location.reload();
  }
  const visible = forms.filter((f) =>
    f.title.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="dashboard">
      <aside className="workspace-nav">
        <div className="nav-label">LEADS</div>
        {[
          ["overview", "Overview"],
          ["forms", "Forms"],
          ["responses", "Responses"],
          ["qr", "QR codes"],
          ["discord", "Discord"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={!selected && view === id ? "active" : ""}
            onClick={() => {
              if (leave()) {
                setSelected(null);
                setView(id);
                setDirty(false);
                setError("");
                setNotice("");
              }
            }}
          >
            {label}
            <span aria-hidden="true">↗</span>
          </button>
        ))}
        <div className="nav-account">
          <small>{email}</small>
          <button onClick={logout}>Sign out</button>
        </div>
      </aside>
      <div className="workspace-content">
        {error && (
          <div className="error" role="alert">
            {error} <button onClick={load}>Retry loading</button>
          </div>
        )}
        {notice && (
          <div className="notice" role="status">
            {notice}
          </div>
        )}
        {selected ? (
          <>
            <div className="page-heading">
              <div>
                <button
                  className="text-button"
                  onClick={() => {
                    if (leave()) {
                      setSelected(null);
                      setDirty(false);
                    }
                  }}
                >
                  ← All forms
                </button>
                <h1>{selected.title}</h1>
                <p className="muted">
                  <span className={`status ${selected.status}`}>
                    {selected.status}
                  </span>{" "}
                  · Version {selected.version} ·{" "}
                  {dirty
                    ? "Unsaved changes"
                    : `Saved ${date(selected.updatedAt)}`}
                </p>
              </div>
              <div className="actions">
                <button className="action" disabled={busy} onClick={duplicate}>
                  Duplicate
                </button>
                <button
                  className="action primary"
                  disabled={busy || !dirty}
                  onClick={() => save()}
                >
                  {busy ? "Saving" : "Save changes"}
                </button>
              </div>
            </div>
            <nav className="tabs" aria-label="Form tools">
              {["edit", "preview", "share", "responses"].map((t) => (
                <button
                  key={t}
                  className={tab === t ? "active" : ""}
                  aria-current={tab === t ? "page" : undefined}
                  onClick={() => setTab(t)}
                >
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </nav>
            {tab === "edit" ? (
              <Editor form={selected} patch={patch} busy={busy} save={save} />
            ) : tab === "preview" ? (
              <PublicForm
                key={selected.id + selected.version}
                form={selected}
                preview
              />
            ) : tab === "share" ? (
              <Share form={selected} dirty={dirty} />
            ) : (
              <Responses key={selected.id} form={selected} />
            )}
          </>
        ) : view === "discord" ? <DiscordPanel forms={forms} /> : view === "qr" ? <LinkQR /> : (
          <>
            <div className="page-heading">
              <div>
                <span className="eyebrow">CAMPUS LEADS</span>
                <h1>
                  {view === "overview"
                    ? "Overview"
                    : view === "forms"
                      ? "Forms"
                      : "Responses"}
                </h1>
                <p className="muted">
                  {view === "overview"
                    ? "Forms and response totals."
                    : view === "forms"
                      ? "Create and manage forms."
                      : "Select a form to view responses."}
                </p>
              </div>
              <div className="actions">
                <button className="action" onClick={load} disabled={loading || busy}>Refresh</button>
                <button className="action danger" onClick={removeAllForms} disabled={loading || busy || !forms.length}>{busy ? "Working" : "Delete all forms"}</button>
              </div>
            </div>
            {view === "overview" && (
              <div className="metrics">
                <Metric
                  label="Total responses"
                  value={forms.reduce((n, f) => n + f.count, 0)}
                />
                <Metric
                  label="Published forms"
                  value={forms.filter((f) => f.status === "published").length}
                />
                <Metric
                  label="Drafts"
                  value={forms.filter((f) => f.status === "draft").length}
                />
              </div>
            )}
            {view !== "responses" && (
              <section className="templates">
                <h2>Start with a template</h2>
                <div className="template-grid">
                  {[
                    ["checkin", "Event check-in", "Record attendance."],
                    [
                      "interest",
                      "Interest form",
                      "Collect interests and contact details.",
                    ],
                    [
                      "feedback",
                      "Feedback",
                      "Collect event feedback.",
                    ],
                  ].map(([id, title, desc]) => (
                    <button
                      key={id}
                      className="panel template"
                      disabled={busy}
                      onClick={() => create(id)}
                    >
                      <span className="template-icon" aria-hidden="true">
                        {id === "checkin" ? "↗" : id === "interest" ? "+" : "✧"}
                      </span>
                      <strong>{title}</strong>
                      <span className="muted">{desc}</span>
                      <span className="small">Create form →</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
            <section className="panel form-list">
              <div className="list-heading">
                <h2>
                  {view === "responses" ? "Forms" : "Forms"}
                </h2>
                <label className="search-label">
                  <span className="sr-only">Search forms</span>
                  <input
                    placeholder="Search forms"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
              </div>
              {loading ? (
                <p role="status">Loading forms</p>
              ) : visible.length ? (
                visible.map((f) => (
                  <button
                    className="form-row"
                    key={f.id}
                    onClick={() =>
                      open(f, view === "responses" ? "responses" : "edit")
                    }
                  >
                    <span>
                      <strong>{f.title}</strong>
                      <small>Updated {date(f.updatedAt)}</small>
                    </span>
                    <span className={`status ${f.status}`}>{f.status}</span>
                    <span>
                      {f.count} <small>responses</small>
                    </span>
                    <span aria-hidden="true">↗</span>
                  </button>
                ))
              ) : (
                <div className="empty">
                  <h3>
                    {search
                      ? "No matching forms."
                      : "No forms yet."}
                  </h3>
                  <p className="muted">
                    {search
                      ? "Try a different search."
                      : "Choose a template to create a form."}
                  </p>
                </div>
              )}
              <p className="small muted">
                Showing up to 200 recent forms. Totals count submissions, not
                unique people.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel metric">
      <span className="muted">{label}</span>
      <strong>{value.toLocaleString()}</strong>
    </div>
  );
}
function Editor({
  form,
  patch,
  busy,
  save,
}: {
  form: FormDefinition;
  patch: (p: Partial<FormDefinition>) => void;
  busy: boolean;
  save: (s?: FormDefinition["status"]) => void;
}) {
  function field(i: number, p: Partial<Field>) {
    patch({
      fields: form.fields.map((f, n) => (n === i ? { ...f, ...p } : f)),
    });
  }
  function move(i: number, d: number) {
    const fields = [...form.fields];
    [fields[i], fields[i + d]] = [fields[i + d], fields[i]];
    patch({ fields });
  }
  function local(s: string) {
    if (!s) return "";
    const d = new Date(s);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }
  return (
    <fieldset disabled={busy} className="editor-lock">
      <div className="editor-grid">
        <div>
          <section className="panel editor-section">
            <h2>Details</h2>
            <label>
              Form title
              <input
                value={form.title}
                maxLength={160}
                onChange={(e) => patch({ title: e.target.value })}
              />
            </label>
            <label>
              Description
              <textarea
                value={form.description}
                maxLength={2000}
                rows={3}
                onChange={(e) => patch({ description: e.target.value })}
              />
            </label>
          </section>
          <section className="editor-section">
            <div className="list-heading">
              <h2>Questions</h2>
              <span className="small muted">{form.fields.length} / 25</span>
            </div>
            {form.fields.map((f, i) => (
              <div className="panel field-editor" key={f.id}>
                <div className="list-heading">
                  <span className="pill">Question {i + 1}</span>
                  <div className="actions">
                    <button
                      aria-label={`Move question ${i + 1} up`}
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                    >
                      ↑
                    </button>
                    <button
                      aria-label={`Move question ${i + 1} down`}
                      disabled={i === form.fields.length - 1}
                      onClick={() => move(i, 1)}
                    >
                      ↓
                    </button>
                    <button
                      aria-label={`Remove question ${i + 1}`}
                      disabled={form.fields.length === 1}
                      onClick={() =>
                        patch({ fields: form.fields.filter((_, n) => n !== i) })
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <label>
                  Question
                  <input
                    maxLength={250}
                    value={f.label}
                    onChange={(e) => field(i, { label: e.target.value })}
                  />
                </label>
                <div className="field-settings">
                  <label>
                    Answer type
                    <select
                      value={f.type}
                      onChange={(e) =>
                        field(i, { type: e.target.value as Field["type"] })
                      }
                    >
                      <option value="text">Short answer</option>
                      <option value="email">Email</option>
                      <option value="textarea">Long answer</option>
                      <option value="select">Choose one</option>
                      <option value="multi">Choose several</option>
                      <option value="program">Program by faculty</option>
                    </select>
                  </label>
                  <label className="inline-check">
                    <input
                      type="checkbox"
                      checked={f.required}
                      onChange={(e) => field(i, { required: e.target.checked })}
                    />
                    Required
                  </label>
                </div>
                {f.type === "program" && <p className="small muted">Options follow the Faculty field. Includes Other and Not applicable.</p>}
                {["select", "multi"].includes(f.type) && (
                  <label>
                    Options, one per line
                    <textarea
                      rows={Math.max(3, f.options.length)}
                      value={f.options.join("\n")}
                      onChange={(e) =>
                        field(i, { options: e.target.value.split("\n") })
                      }
                    />
                  </label>
                )}
              </div>
            ))}
            <button
              className="action wide"
              disabled={form.fields.length >= 25}
              onClick={() =>
                patch({
                  fields: [
                    ...form.fields,
                    {
                      id: crypto.randomUUID(),
                      label: "New question",
                      type: "text",
                      required: false,
                      options: [],
                    },
                  ],
                })
              }
            >
              + Add a question
            </button>
          </section>
        </div>
        <aside>
          <section className="panel editor-section">
            <h2>Appearance</h2>
            <label>Background<select value={form.background ?? "aurora"} onChange={e => patch({background: e.target.value as FormDefinition["background"]})}>
              <option value="aurora">Aurora</option><option value="grid">Moving grid</option><option value="none">Plain</option>
            </select></label>
            <label className="inline-check"><input type="checkbox" checked={form.animated !== false} onChange={e => patch({animated:e.target.checked})} />Animate background</label>
            <p className="small muted">Preview shows these settings. Reduced motion is respected.</p>
          </section><section className="panel editor-section">
            <h2>Publish & timing</h2>
            <p className="muted small">
              Drafts are private. Published forms accept responses within the
              times you choose.
            </p>
            <label>
              Opens at
              <input
                type="datetime-local"
                value={local(form.opensAt)}
                onChange={(e) =>
                  patch({
                    opensAt: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : "",
                  })
                }
              />
            </label>
            <label>
              Closes at
              <input
                type="datetime-local"
                value={local(form.closesAt)}
                onChange={(e) =>
                  patch({
                    closesAt: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : "",
                  })
                }
              />
            </label>
            <p className="small muted">
              Times use your device’s local timezone. Leave blank for no time
              limit.
            </p>
            <button
              className="action primary wide"
              disabled={busy}
              onClick={() =>
                save(form.status === "published" ? "closed" : "published")
              }
            >
              {form.status === "published" ? "Close form" : "Save & publish"}
            </button>
          </section>
          <section className="panel editor-section">
            <h2>Confirmation</h2>
            <label>
              Confirmation message
              <textarea
                rows={3}
                maxLength={500}
                value={form.confirmation}
                onChange={(e) => patch({ confirmation: e.target.value })}
              />
            </label>
            <label>
              How responses will be used
              <textarea
                rows={5}
                maxLength={2000}
                value={form.privacy}
                onChange={(e) => patch({ privacy: e.target.value })}
              />
            </label>
          </section>
        </aside>
      </div>
    </fieldset>
  );
}
function Share({ form, dirty }: { form: FormDefinition; dirty: boolean }) {
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState("");
  const [url, setUrl] = useState("");
  useEffect(() => {
    const u = `${window.location.origin}/f/${form.id}`;
    setUrl(u);
    QRCode.toDataURL(u, {
      width: 960,
      margin: 3,
      errorCorrectionLevel: "M",
      color: { dark: "#141326", light: "#ffffff" },
    })
      .then(setQr)
      .catch(() => setCopied("Could not generate the QR code."));
  }, [form.id]);
  return (
    <section className="panel share-panel">
      <div>
        
        <h2>Share form</h2>
        <p className="muted">
          Copy the link or download the QR code.
        </p>
        {(form.status !== "published" || dirty) && (
          <p role="status" className="notice">
            {dirty
              ? "Save your changes before sharing."
              : form.status === "draft"
                ? "Publish this form before sharing."
                : "This form is closed."}
          </p>
        )}
        <label>
          Form link
          <input readOnly value={url} onFocus={(e) => e.target.select()} />
        </label>
        <div className="actions">
          <button
            className="action primary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                setCopied("Link copied.");
              } catch {
                setCopied("Select the link above to copy it.");
              }
            }}
          >
            Copy link
          </button>
          <a className="action" href={url} target="_blank" rel="noreferrer">
            Open form ↗
          </a>
        </div>
        <p role="status" className="small">
          {copied}
        </p>
      </div>
      <div className="qr-card">
        {qr && (
          <>
            <img
              src={qr}
              width="240"
              height="240"
              alt={`QR code linking to ${form.title}`}
            />
            <a className="action" href={qr} download={`${form.id}-qr.png`}>
              Download QR code
            </a>
          </>
        )}
      </div>
    </section>
  );
}
function Responses({ form }: { form: FormDefinition }) {
  const [rows, setRows] = useState<Submission[]>([]);
  const [total, setTotal] = useState(form.count);
  const [cursor, setCursor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Submission | null>(null);
  const [filter, setFilter] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [columns, setColumns] = useState<string[]>(
    form.fields.slice(0, 4).map((f) => f.id),
  );
  async function load(more = false) {
    setBusy(true);
    setError("");
    try {
      const d = await api(
        `forms/${form.id}/responses${more && cursor ? `?cursor=${cursor}` : ""}`,
      );
      setRows((r) => (more ? [...r, ...d.responses] : d.responses));
      setCursor(d.nextCursor);
      setTotal(d.total);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    load();
  }, [form.id]);
  const fields = Array.from(
    new Map(
      [...form.fields, ...rows.flatMap((r) => r.fields)].map((f) => [f.id, f]),
    ).values(),
  );
  const visible = rows.filter(
    (r) =>
      (!search ||
        Object.values(r.answers)
          .flat()
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())) &&
      (!filter ||
        !filterValue ||
        (Array.isArray(r.answers[filter])
          ? r.answers[filter].includes(filterValue)
          : r.answers[filter] === filterValue)),
  );
  const days = new Map<string, number>();
  rows.forEach((r) => {
    const day = new Date(r.createdAt).toLocaleDateString("en-CA");
    days.set(day, (days.get(day) ?? 0) + 1);
  });
  const chosen = fields.find((f) => f.id === filter);
  const summary = fields
    .filter((f) => ["select", "multi"].includes(f.type) || f.id === "program")
    .slice(0, 4);
  return (
    <>
      <div className="list-heading">
        <div>
          <h2>Responses</h2>
          <p className="muted small">
            {rows.length} loaded · {total} total. Summaries and filters use
            loaded responses.
          </p>
        </div>
        <div className="actions">
          <button className="action" disabled={busy} onClick={() => load()}>
            Refresh responses
          </button>
          <a className="action" href={`/api/leads/forms/${form.id}/export`}>
            Export CSV ↓
          </a>
        </div>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="summary-grid">
        <section className="panel breakdown">
          <h3>Responses over time</h3>
          {[...days]
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-7)
            .map(([day, n]) => (
              <div className="bar-row" key={day}>
                <span>{day}</span>
                <strong>{n}</strong>
                <div className="bar-track">
                  <div
                    style={{
                      width: `${(100 * n) / Math.max(...days.values(), 1)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          {!days.size && (
            <p className="muted small">
              No responses yet.
            </p>
          )}
        </section>
        {summary.map((f) => {
          const counts = new Map<string, number>();
          rows.forEach((r) => {
            const a = r.answers[f.id];
            (Array.isArray(a) ? a : a ? [a] : []).forEach((v) =>
              counts.set(v, (counts.get(v) ?? 0) + 1),
            );
          });
          return (
            <section className="panel breakdown" key={f.id}>
              <h3>{f.label}</h3>
              {[...counts]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([label, n]) => (
                  <div className="bar-row" key={label}>
                    <span>{label}</span>
                    <strong>{n}</strong>
                    <div className="bar-track">
                      <div
                        style={{
                          width: `${(100 * n) / Math.max(rows.length, 1)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              {!counts.size && (
                <p className="muted small">Responses will appear here.</p>
              )}
            </section>
          );
        })}
      </div>
      <section className="panel response-panel">
        <div className="response-filters">
          <label>
            Search responses
            <input
              value={search}
              placeholder="Name, program, answer"
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label>
            Filter by
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setFilterValue("");
              }}
            >
              <option value="">All questions</option>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          {chosen && (
            <label>
              Answer
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              >
                <option value="">All answers</option>
                {[...new Set(rows.flatMap((r) => r.answers[chosen.id] ?? []))]
                  .filter(Boolean)
                  .map((v) => (
                    <option key={v}>{v}</option>
                  ))}
              </select>
            </label>
          )}
        </div>
        <details className="column-picker">
          <summary>Visible columns</summary>
          <div className="choice-list">
            {fields.map((f) => (
              <label className="inline-check" key={f.id}>
                <input
                  type="checkbox"
                  checked={columns.includes(f.id)}
                  onChange={(e) =>
                    setColumns((c) =>
                      e.target.checked
                        ? [...c, f.id]
                        : c.filter((x) => x !== f.id),
                    )
                  }
                />
                {f.label}
              </label>
            ))}
          </div>
        </details>
        {busy && !rows.length ? (
          <p role="status">Loading responses</p>
        ) : !visible.length ? (
          <div className="empty">
            <h3>
              {rows.length
                ? "No matching responses."
                : "Ready when your guests are."}
            </h3>
            <p className="muted">
              {rows.length
                ? "Try changing your filters."
                : "Share the form link or QR code to start collecting responses."}
            </p>
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <caption className="sr-only">Form responses</caption>
                <thead>
                  <tr>
                    <th>Submitted</th>
                    {fields
                      .filter((f) => columns.includes(f.id))
                      .map((f) => (
                        <th key={f.id}>{f.label}</th>
                      ))}
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <tr key={r.id}>
                      <td>{date(r.createdAt)}</td>
                      {fields
                        .filter((f) => columns.includes(f.id))
                        .map((f) => (
                          <td key={f.id}>{answer(r.answers[f.id])}</td>
                        ))}
                      <td>
                        <button onClick={() => setDetail(r)}>
                          View
                          <span className="sr-only">
                            {" "}
                            response from {date(r.createdAt)}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="response-cards">
              {visible.map((r) => (
                <button
                  className="response-card"
                  key={r.id}
                  onClick={() => setDetail(r)}
                >
                  <strong>{String(r.answers.name ?? "Response")}</strong>
                  <span>{date(r.createdAt)}</span>
                  <small>
                    {Object.values(r.answers).flat().slice(0, 3).join(" · ")}
                  </small>
                </button>
              ))}
            </div>
          </>
        )}
        {cursor && (
          <button
            className="action wide"
            disabled={busy}
            onClick={() => load(true)}
          >
            {busy ? "Loading" : "Load next 100 responses"}
          </button>
        )}
      </section>
      {detail && <ResponseDetail row={detail} close={() => setDetail(null)} />}
    </>
  );
}
function ResponseDetail({
  row,
  close,
}: {
  row: Submission;
  close: () => void;
}) {
  useEffect(() => {
    const d = document.getElementById("response-detail") as HTMLDialogElement;
    d.showModal();
    return () => d.close();
  }, []);
  return (
    <dialog
      id="response-detail"
      className="panel response-detail"
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="list-heading">
        <h2>Response details</h2>
        <button autoFocus onClick={close} aria-label="Close response details">
          Close ×
        </button>
      </div>
      <p className="muted small">
        {date(row.createdAt)} · Form version {row.version}
      </p>
      <dl>
        {row.fields.map((f) => (
          <div key={f.id}>
            <dt>{f.label}</dt>
            <dd>{answer(row.answers[f.id])}</dd>
          </div>
        ))}
      </dl>
    </dialog>
  );
}

function LinkQR() {
  const [url,setUrl]=useState(""); const [image,setImage]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  async function generate(e:React.FormEvent) {e.preventDefault();setError("");setImage("");setBusy(true);try {const u=new URL(url.trim());if(!["https:","http:"].includes(u.protocol)) throw new Error("Enter an http or https link.");if(u.href.length>2000) throw new Error("This link is too long.");setImage(await QRCode.toDataURL(u.href,{width:1200,margin:4,errorCorrectionLevel:"M"}));}catch(e){setError(e instanceof Error?e.message:"Could not generate QR code.");}finally{setBusy(false);}}
  return <><div className="page-heading"><h1>QR codes</h1></div><section className="panel editor-section"><form onSubmit={generate}><label>Web link<input type="url" required placeholder="https://" value={url} onChange={e=>{setUrl(e.target.value);setImage("");setError("");}} /></label><button className="action primary" disabled={busy}>{busy?"Generating":"Generate QR code"}</button></form>{error&&<p className="error" role="alert">{error}</p>}{image&&<div className="link-qr-result"><img src={image} width="300" height="300" alt="QR code for the entered web link" /><a className="action" href={image} download="qr-code.png">Download PNG</a></div>}</section></>;
}
