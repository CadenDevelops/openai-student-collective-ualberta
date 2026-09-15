import type { Firestore } from "firebase-admin/firestore";

/** Close each form before deleting it, including responses and saved versions. */
export async function deleteAllForms(database: Firestore) {
  // listDocuments also includes missing parent documents with subcollections.
  const refs = await database.collection("forms").listDocuments();
  for (const ref of refs) {
    await database.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (snapshot.exists) {
        tx.update(ref, { status: "closed", deleting: true });
      }
    });
    await database.recursiveDelete(ref);
  }
  return refs.length;
}
