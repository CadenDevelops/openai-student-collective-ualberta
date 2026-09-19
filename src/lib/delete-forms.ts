import type { DocumentReference, Firestore } from "firebase-admin/firestore";

/** Close one form before deleting it, including responses and saved versions.

    The close happens first and in its own transaction so an in-flight
    submission is rejected rather than landing in a subcollection that
    recursiveDelete has already walked past. Any custom link is released in the
    same step, which frees the wording for reuse immediately. */
export async function deleteForm(database: Firestore, ref: DocumentReference) {
  await database.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    if (!snapshot.exists) return;
    const slug = snapshot.data()?.slug;
    if (slug) tx.delete(database.collection("slugs").doc(slug));
    tx.update(ref, { status: "closed", deleting: true });
  });
  await database.recursiveDelete(ref);
}

/** Close each form before deleting it, including responses and saved versions. */
export async function deleteAllForms(database: Firestore) {
  // listDocuments also includes missing parent documents with subcollections.
  const refs = await database.collection("forms").listDocuments();
  for (const ref of refs) await deleteForm(database, ref);
  // Sweep the claim collection too: a form deleted before slugs existed, or one
  // whose document vanished without its claim, would otherwise hold a name.
  for (const claim of await database.collection("slugs").listDocuments())
    await claim.delete();
  return refs.length;
}

/** Removes one response and keeps the form's counter honest. */
export async function deleteResponse(database: Firestore, formId: string, responseId: string) {
  const formRef = database.collection("forms").doc(formId);
  const responseRef = formRef.collection("responses").doc(responseId);
  await database.runTransaction(async (tx) => {
    const [form, response] = await Promise.all([tx.get(formRef), tx.get(responseRef)]);
    if (!form.exists) throw new Error("Form not found.");
    if (!response.exists) throw new Error("That response has already been deleted.");
    tx.delete(responseRef);
    // Clamped, because the counter is the only record of the total and a
    // negative one would be worse than a slightly stale one.
    tx.update(formRef, { count: Math.max(0, (form.data()?.count ?? 1) - 1) });
  });
}
