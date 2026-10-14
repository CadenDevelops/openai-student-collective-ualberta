import type { DocumentSnapshot, Firestore } from "firebase-admin/firestore";

const slugShape = /^[a-z0-9][a-z0-9_-]{1,46}[a-z0-9]$/;
const idShape = /^[A-Za-z0-9_-]{1,128}$/;

export async function slugAvailable(database: Firestore, slug: string, formId: string) {
  const held = await database.collection("slugs").doc(slug).get();
  return !held.exists || held.data()?.formId === formId;
}

export async function setFormSlug(database: Firestore, formId: string, slug: string | null) {
  const formRef = database.collection("forms").doc(formId);
  return database.runTransaction(async (tx) => {
    // firestore transactions need every read before the first write
    const form = await tx.get(formRef);
    if (!form.exists) throw new Error("Form not found.");
    if (form.data()?.deleting) throw new Error("This form is being deleted.");
    const current: string | null = form.data()?.slug ?? null;
    if (current === slug) return slug;
    if (slug) {
      const held = await tx.get(database.collection("slugs").doc(slug));
      if (held.exists && held.data()?.formId !== formId)
        throw new Error("That link is already taken. Try another.");
      tx.set(database.collection("slugs").doc(slug), {
        formId,
        createdAt: new Date().toISOString(),
      });
    }
    if (current) tx.delete(database.collection("slugs").doc(current));
    tx.update(formRef, { slug });
    return slug;
  });
}

export async function findForm(database: Firestore, key: string): Promise<DocumentSnapshot | null> {
  if (!idShape.test(key) && !slugShape.test(key)) return null;
  if (idShape.test(key)) {
    const direct = await database.collection("forms").doc(key).get();
    if (direct.exists) return direct;
  }
  if (!slugShape.test(key)) return null;
  const claim = await database.collection("slugs").doc(key).get();
  if (!claim.exists) return null;
  const doc = await database.collection("forms").doc(claim.data()!.formId).get();
  return doc.exists ? doc : null;
}
