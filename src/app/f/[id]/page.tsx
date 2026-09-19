import type { Metadata } from "next";
import { db, configured } from "@/lib/firebase-admin";
import { findForm } from "@/lib/slugs";
import { isOpen, validateDefinition, type FormDefinition } from "@/lib/forms";
import { PublicForm } from "@/components/leads/public-form";

import "../../leads/workspace.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Form | UAlberta Student Collective",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let form: FormDefinition | null = null;
  if (configured()) {
    // The segment is either a document id or a custom link. Either way the
    // form carries its real id from here on, so submissions reach the right
    // document whichever way the visitor arrived.
    const d = await findForm(db(), id);
    if (d && d.data()?.status !== "draft")
      form = {
        ...validateDefinition(d.data()),
        id: d.id,
        version: d.data()!.version,
        count: 0,
        createdAt: "",
        updatedAt: "",
      } as FormDefinition;
  }
  return (
    <div className="workspace public-workspace">

      <header className="workspace-brand">
        <a href="/">
          <img src="/openai-blossom.svg" width="32" height="32" alt="" />
          <span>
            Student Collective<small>University of Alberta</small>
          </span>
        </a>
      </header>
      <main>
        {form && isOpen(form) ? (
          <PublicForm form={form} />
        ) : (
          <section className="panel attendee-form">
            <span className="pill">Student Collective</span>
            <h1>{form ? "Check back soon." : "Form unavailable."}</h1>
            <p className="muted">
              {form
                ? "This form is not accepting responses right now."
                : "This link may be incorrect, or the form hasn’t been published yet."}
            </p>
            <a className="action" href="/">
              Back to the collective
            </a>
          </section>
        )}
      </main>
    </div>
  );
}
