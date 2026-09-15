import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { allowed, body, checkOrigin } from "@/lib/auth";
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const { token } = await body(req);
    const u = await adminAuth().verifyIdToken(token, true);
    if (
      !u.email_verified ||
      !allowed(u.email) ||
      Date.now() / 1000 - u.auth_time > 300
    )
      return Response.json(
        { error: "This account does not have leads access." },
        { status: 403 },
      );
    const expiresIn = 5 * 24 * 60 * 60 * 1000;
    const session = await adminAuth().createSessionCookie(token, { expiresIn });
    (await cookies()).set("__session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: expiresIn / 1000,
    });
    return Response.json({ ok: true });
  } catch (e) {
    console.error(
      "Session creation failed",
      e instanceof Error ? e.message : "Unknown error",
    );
    return Response.json(
      { error: "Could not sign in. Please try again." },
      { status: 401 },
    );
  }
}
export async function DELETE(req: Request) {
  try {
    checkOrigin(req);
    (await cookies()).delete("__session");
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 403 });
  }
}
