import "server-only";
import { cookies } from "next/headers";
import { adminAuth, configured } from "./firebase-admin";
export function allowed(email?: string) {
  return Boolean(
    email &&
    (process.env.LEAD_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
      .includes(email.toLowerCase()),
  );
}
export async function lead() {
  if (!configured()) return null;
  const token = (await cookies()).get("__session")?.value;
  if (!token) return null;
  try {
    const u = await adminAuth().verifySessionCookie(token, true);
    return u.email_verified && allowed(u.email)
      ? { uid: u.uid, email: u.email! }
      : null;
  } catch {
    return null;
  }
}
export function checkOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin || new URL(origin).host !== req.headers.get("host"))
    throw new Error("Invalid request origin.");
}
export async function body(req: Request) {
  const text = await req.text();
  if (text.length > 60000) throw new Error("Request too large.");
  return JSON.parse(text);
}
