import "server-only";
import {
  getApps,
  initializeApp,
  cert,
  applicationDefault,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
export function configured() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  );
}
function app() {
  if (!configured()) throw new Error("Firebase is not configured yet.");
  if (getApps().length) return getApps()[0];
  return initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
    credential: process.env.FIREBASE_PRIVATE_KEY
      ? cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        })
      : applicationDefault(),
  });
}
export const adminAuth = () => getAuth(app());
export const db = () => getFirestore(app());
