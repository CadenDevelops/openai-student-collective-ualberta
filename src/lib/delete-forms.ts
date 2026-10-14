import type { DocumentReference, Firestore } from "firebase-admin/firestore";

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

export async function deleteAllForms(database: Firestore) {
  // listDocuments also returns missing parents that have subcollections
  const refs = await database.collection("forms").listDocuments();
  for (const ref of refs) await deleteForm(database, ref);
  // also sweep orphaned slug claims
  for (const claim of await database.collection("slugs").listDocuments()) await claim.delete();
  return refs.length;
}

export async function deleteResponse(database: Firestore, formId: string, responseId: string) {
  const formRef = database.collection("forms").doc(formId);
  const responseRef = formRef.collection("responses").doc(responseId);
  await database.runTransaction(async (tx) => {
    const [form, response] = await Promise.all([tx.get(formRef), tx.get(responseRef)]);
    if (!form.exists) throw new Error("Form not found.");
    if (!response.exists) throw new Error("That response has already been deleted.");
    tx.delete(responseRef);
    tx.update(formRef, { count: Math.max(0, (form.data()?.count ?? 1) - 1) });
  });
}
