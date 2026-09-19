import { deleteAllForms, deleteForm, deleteResponse } from "@/lib/delete-forms";
import { setFormSlug, slugAvailable } from "@/lib/slugs";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/firebase-admin";
import { body, checkOrigin, lead } from "@/lib/auth";
import {
  makeForm,
  validateDefinition,
  validateSlug,
  csvCell,
  type FormDefinition,
  type Submission,
} from "@/lib/forms";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
export async function GET(req: Request, ctx: Context) {
  if (!(await lead()))
    return Response.json({ error: "Sign in to continue." }, { status: 401 });
  const { path } = await ctx.params;
  try {
    // Checked as the lead types, so a taken link is caught before saving.
    // The claim on save is still transactional; this is only for the message.
    if (path[0] === "slugs" && path.length === 2) {
      const url = new URL(req.url);
      let slug: string;
      try {
        slug = validateSlug(path[1]);
      } catch (e) {
        return Response.json({ available: false, reason: (e as Error).message });
      }
      const free = await slugAvailable(db(), slug, url.searchParams.get("form") ?? "");
      return Response.json({
        available: free,
        reason: free ? "" : "That link is already taken. Try another.",
      });
    }
    if (path[0] !== "forms") return new Response(null, { status: 404 });
    if (!path[1]) {
      const s = await db()
        .collection("forms")
        .orderBy("createdAt", "desc")
        .limit(200)
        .get();
      return Response.json({
        forms: s.docs.map((d) => ({ ...d.data(), id: d.id })),
      });
    }
    const ref = db().collection("forms").doc(path[1]);
    const doc = await ref.get();
    if (!doc.exists)
      return Response.json({ error: "Form not found." }, { status: 404 });
    if (path[2] === "responses" || path[2] === "export") {
      const url = new URL(req.url);
      let q = ref
        .collection("responses")
        .orderBy("createdAt", "desc")
        .limit(path[2] === "export" ? 10000 : 100);
      const cursor = url.searchParams.get("cursor");
      if (cursor) {
        const c = await ref.collection("responses").doc(cursor).get();
        if (!c.exists)
          return Response.json({ error: "Invalid page." }, { status: 400 });
        q = q.startAfter(c);
      }
      const s = await q.get();
      const responses = s.docs.map((d) => ({
        ...d.data(),
        id: d.id,
      })) as Submission[];
      if (path[2] === "export") {
        if ((doc.data()?.count ?? 0) > 10000)
          return Response.json(
            { error: "Export supports up to 10,000 responses per form." },
            { status: 400 },
          );
        const labels = new Map<string, string>();
        responses.forEach((r) =>
          r.fields.forEach((f) =>
            labels.set(`${r.version}:${f.id}`, `v${r.version}: ${f.label}`),
          ),
        );
        const keys = [...labels.keys()];
        const rows = [
          ["Submitted at", "Version", ...labels.values()]
            .map(csvCell)
            .join(","),
          ...responses.map((r) =>
            [
              r.createdAt,
              r.version,
              ...keys.map((k) =>
                k.startsWith(`${r.version}:`)
                  ? r.answers[k.slice(k.indexOf(":") + 1)]
                  : "",
              ),
            ]
              .map(csvCell)
              .join(","),
          ),
        ];
        return new Response("\uFEFF" + rows.join("\r\n"), {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="responses.csv"',
            "Cache-Control": "no-store",
          },
        });
      }
      return Response.json({
        responses,
        total: doc.data()?.count ?? 0,
        nextCursor: s.size === 100 ? s.docs.at(-1)!.id : null,
      });
    }
    return Response.json({ form: { ...doc.data(), id: doc.id } });
  } catch {
    return Response.json(
      { error: "Could not load data. Please try again." },
      { status: 500 },
    );
  }
}
export async function POST(req: Request, ctx: Context) {
  const user = await lead();
  if (!user)
    return Response.json({ error: "Sign in to continue." }, { status: 401 });
  try {
    checkOrigin(req);
    const { path } = await ctx.params;
    const input = await body(req);
    if (path[0] !== "forms" || path.length > 2)
      return new Response(null, { status: 404 });
    if (!path[1]) {
      const kind = ["checkin", "interest", "feedback"].includes(input.template)
        ? input.template
        : "checkin";
      const f = makeForm(kind);
      const id = randomUUID();
      await db()
        .collection("forms")
        .doc(id)
        .set({ ...f, createdBy: user.uid, updatedBy: user.uid });
      return Response.json({ form: { ...f, id } });
    }
    if (input.action === "slug") {
      const slug = input.slug === null || input.slug === "" ? null : validateSlug(input.slug);
      await setFormSlug(db(), path[1], slug);
      return Response.json({ slug });
    }
    if (input.action === "duplicate") {
      const old = await db().collection("forms").doc(path[1]).get();
      if (!old.exists) throw new Error("Form not found.");
      const f = old.data() as FormDefinition;
      const id = randomUUID();
      const now = new Date().toISOString();
      const copy = {
        ...validateDefinition(f),
        title: f.title + " (copy)",
        status: "draft",
        version: 1,
        count: 0,
        createdAt: now,
        updatedAt: now,
        createdBy: user.uid,
        updatedBy: user.uid,
      };
      await db().collection("forms").doc(id).set(copy);
      return Response.json({ form: { ...copy, id } });
    }
    throw new Error("Unknown action.");
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Could not create form." },
      { status: 400 },
    );
  }
}
export async function PUT(req: Request, ctx: Context) {
  const user = await lead();
  if (!user)
    return Response.json({ error: "Sign in to continue." }, { status: 401 });
  try {
    checkOrigin(req);
    const { path } = await ctx.params;
    if (path[0] !== "forms" || path.length !== 2)
      return new Response(null, { status: 404 });
    const input = await body(req);
    const data = validateDefinition(input);
    const ref = db().collection("forms").doc(path[1]);
    const form = await db().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error("Form not found.");
      const old = snap.data()!;
      if (old.deleting) throw new Error("This form is being deleted.");
      if (input.version !== old.version)
        throw new Error(
          "This form was edited elsewhere. Reload before saving.",
        );
      const updated = {
        ...old,
        ...data,
        version: old.version + 1,
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid,
      };
      tx.set(ref.collection("versions").doc(String(old.version)), old);
      tx.set(ref, updated);
      return { ...updated, id: ref.id };
    });
    return Response.json({ form });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Could not save form." },
      { status: 400 },
    );
  }
}

export async function DELETE(req: Request, ctx: Context) {
  if (!(await lead())) return Response.json({ error: "Sign in to continue." }, { status: 401 });
  const { path } = await ctx.params;
  if (path[0] !== "forms") return new Response(null, { status: 404 });
  try {
    checkOrigin(req);
    // One response: forms/<id>/responses/<responseId>
    if (path.length === 4 && path[2] === "responses") {
      await deleteResponse(db(), path[1], path[3]);
      return Response.json({ deleted: 1 });
    }
    // One form: forms/<id>
    if (path.length === 2) {
      const input = await body(req);
      if (input.confirmation !== "DELETE FORM")
        return Response.json({ error: "Confirm deletion of this form." }, { status: 400 });
      const ref = db().collection("forms").doc(path[1]);
      if (!(await ref.get()).exists)
        return Response.json({ error: "Form not found." }, { status: 404 });
      await deleteForm(db(), ref);
      return Response.json({ deleted: 1 });
    }
    // Every form: forms
    if (path.length === 1) {
      const input = await body(req);
      if (input.confirmation !== "DELETE ALL FORMS")
        return Response.json({ error: "Confirm deletion of all forms." }, { status: 400 });
      return Response.json({ deleted: await deleteAllForms(db()) });
    }
    return new Response(null, { status: 404 });
  } catch (e) {
    // A response delete reports its own reason; the recursive deletes cannot
    // say how far they reached, so they ask for a retry instead.
    const message =
      path.length === 4
        ? e instanceof Error
          ? e.message
          : "Could not delete that response."
        : "Deletion did not finish. Refresh and try again to remove what is left.";
    return Response.json({ error: message }, { status: path.length === 4 ? 400 : 500 });
  }
}
