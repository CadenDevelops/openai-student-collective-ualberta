import { createHmac } from "node:crypto";
import { db } from "@/lib/firebase-admin";
import { body, checkOrigin } from "@/lib/auth";
import { isOpen, validateAnswers, type FormDefinition } from "@/lib/forms";
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    checkOrigin(req);
    const { id } = await params;
    const input = await body(req);
    if (
      typeof input.key !== "string" ||
      !/^[a-f0-9-]{36}$/.test(input.key) ||
      input.website
    )
      throw new Error("Invalid submission.");
    const secret = process.env.SUBMISSION_RATE_SECRET;
    if (!secret)
      return Response.json(
        { error: "This form is temporarily unavailable." },
        { status: 503 },
      );
    const ip =
      req.headers.get("x-vercel-forwarded-for") ??
      req.headers.get("x-forwarded-for") ??
      "local";
    const bucket = Math.floor(Date.now() / 600000);
    const hash = createHmac("sha256", secret)
      .update(`${ip}:${id}`)
      .digest("hex");
    const ref = db().collection("forms").doc(id);
    const response = ref.collection("responses").doc(input.key);
    const rate = db().collection("submissionLimits").doc(hash);
    const result = await db().runTransaction(async (tx) => {
      const [f, r, l] = await Promise.all([
        tx.get(ref),
        tx.get(response),
        tx.get(rate),
      ]);
      if (r.exists)
        return {
          ok: true,
          confirmation: "Your response has already been saved.",
        };
      if (!f.exists) throw new Error("Form not found.");
      const form = f.data() as FormDefinition;
      if (!isOpen(form))
        throw new Error("This form is not accepting responses right now.");
      if (input.version !== form.version)
        throw new Error(
          "This form has changed. Reload the page before submitting.",
        );
      const recentCount =
        l.data()?.bucket === bucket ? (l.data()?.count ?? 0) : 0;
      if (recentCount >= 300)
        throw new Error(
          "Too many submissions. Please try again in a few minutes.",
        );
      const answers = validateAnswers(form.fields, input.answers);
      const createdAt = new Date().toISOString();
      tx.set(response, {
        createdAt,
        version: form.version,
        fields: form.fields,
        answers,
      });
      tx.update(ref, { count: (form.count ?? 0) + 1 });
      tx.set(rate, {
        count: recentCount + 1,
        bucket,
        expiresAt: new Date(Date.now() + 86400000),
      });
      return { ok: true, confirmation: form.confirmation };
    });
    return Response.json(result);
  } catch (e) {
    return Response.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Could not save your response. Please try again.",
      },
      { status: 400 },
    );
  }
}
