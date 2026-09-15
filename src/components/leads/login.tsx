"use client";
import { useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  inMemoryPersistence,
  setPersistence,
} from "firebase/auth";
export function LeadLogin({ ready }: { ready: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function login() {
    setBusy(true);
    setError("");
    try {
      const app =
        getApps()[0] ??
        initializeApp({
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        });
      const auth = getAuth(app);
      await setPersistence(auth, inMemoryPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const r = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: await result.user.getIdToken() }),
      });
      const data = await r.json();
      await signOut(auth);
      if (!r.ok) throw new Error(data.error);
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign in.");
      setBusy(false);
    }
  }
  return (
    <section className="panel login-panel">
      <span className="pill">Campus Leads</span>
      <h1>Sign in</h1>
      <p className="muted">Manage forms and responses.</p>
      <button
        className="action primary"
        disabled={!ready || busy}
        onClick={login}
      >
        {busy ? "Signing in…" : "Continue with Google"}{" "}
        <span aria-hidden="true">↗</span>
      </button>
      <p className="small muted">Access is limited to approved Campus Leads.</p>
      {!ready && (
        <p role="status">
          The workspace is being connected. Please check back shortly.
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
