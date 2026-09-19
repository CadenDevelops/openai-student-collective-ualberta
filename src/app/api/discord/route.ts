import { db } from "@/lib/firebase-admin";
import { body, checkOrigin, lead } from "@/lib/auth";
import {
  DiscordValidationError,
  discordWebhookRequestUrl,
  normalizeDiscordMessage,
  validateDiscordWebhookUrl,
} from "@/lib/discord";
import { brandWebhook } from "@/lib/discord-webhook";

export const dynamic = "force-dynamic";

const settings = () => db().collection("settings").doc("discord");

function unauthorized() {
  return Response.json({ error: "Sign in to continue." }, { status: 401 });
}

function serverError() {
  return Response.json(
    { error: "Could not update the Discord integration. Please try again." },
    { status: 500 },
  );
}

function inputError(error: unknown) {
  if (error instanceof DiscordValidationError) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof Error && error.message === "Invalid request origin.") {
    return Response.json({ error: error.message }, { status: 400 });
  }
  return Response.json({ error: "Invalid request." }, { status: 400 });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function configuredFrom(value: unknown): boolean {
  if (!isRecord(value) || typeof value.webhookUrl !== "string") return false;
  try {
    validateDiscordWebhookUrl(value.webhookUrl);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await lead())) return unauthorized();
  try {
    const snap = await settings().get();
    return Response.json({ configured: snap.exists && configuredFrom(snap.data()) });
  } catch {
    return serverError();
  }
}

export async function POST(req: Request) {
  const user = await lead();
  if (!user) return unauthorized();
  try {
    checkOrigin(req);
    let input: unknown;
    try {
      input = await body(req);
    } catch {
      return Response.json({ error: "Invalid request." }, { status: 400 });
    }
    if (!isRecord(input) || typeof input.action !== "string") {
      return Response.json({ error: "Invalid request." }, { status: 400 });
    }

    if (input.action === "save") {
      const url = validateDiscordWebhookUrl(input.url);
      await settings().set(
        {
          webhookUrl: url,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid,
        },
        { merge: true },
      );
      // Best effort, and reported rather than thrown: the webhook is saved and
      // usable either way, and messages carry the logo regardless.
      return Response.json({ configured: true, branded: await brandWebhook(url) });
    }

    // Re-applies the name and picture, for a webhook connected before this
    // existed or one somebody renamed inside Discord.
    if (input.action === "brand") {
      const snap = await settings().get();
      const saved = snap.data();
      if (!snap.exists || !configuredFrom(saved))
        return Response.json(
          { error: "Connect a Discord webhook first." },
          { status: 409 },
        );
      const branded = await brandWebhook(saved!.webhookUrl as string);
      if (!branded)
        return Response.json(
          { error: "Discord did not accept the picture. Check the webhook and try again." },
          { status: 502 },
        );
      return Response.json({ branded });
    }

    if (input.action !== "send") {
      return Response.json({ error: "Invalid request." }, { status: 400 });
    }

    const snap = await settings().get();
    const saved = snap.data();
    if (!snap.exists || !configuredFrom(saved)) {
      return Response.json(
        { error: "Connect a Discord webhook before sending." },
        { status: 409 },
      );
    }

    // Normalize exactly the same input shape the client uses for its preview.
    const payload = normalizeDiscordMessage(input);
    let requestUrl: string;
    try {
      requestUrl = discordWebhookRequestUrl(saved?.webhookUrl);
    } catch {
      return Response.json(
        { error: "Saved Discord webhook is invalid. Save it again." },
        { status: 500 },
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const upstream = await fetch(requestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        redirect: "error",
        signal: controller.signal,
      });
      if (upstream.status === 429) {
        return Response.json(
          {
            error:
              "Discord is rate limiting messages. Please retry in a moment.",
          },
          { status: 429 },
        );
      }
      if (!upstream.ok) {
        return Response.json(
          { error: "Discord did not accept the message. Please check the webhook." },
          { status: 502 },
        );
      }
      return Response.json({ ok: true });
    } catch {
      if (controller.signal.aborted) {
        return Response.json(
          { error: "Discord did not confirm within 10 seconds. Check the channel before retrying to avoid a duplicate." },
          { status: 504 },
        );
      }
      return Response.json(
        { error: "Could not confirm delivery. Check the channel before retrying." },
        { status: 502 },
      );
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    return inputError(error);
  }
}

export async function DELETE(req: Request) {
  const user = await lead();
  if (!user) return unauthorized();
  try {
    checkOrigin(req);
    await settings().delete();
    return Response.json({ configured: false });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid request origin.") {
      return inputError(error);
    }
    return serverError();
  }
}
