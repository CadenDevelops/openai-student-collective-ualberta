import "server-only";
import { DISCORD_AVATAR_URL, DISCORD_NAME, validateDiscordWebhookUrl } from "./discord";

/* Every message this app sends already carries `username` and `avatar_url`, so
   it looks right in the channel. That override does not touch the webhook
   itself, which keeps Discord's default grey avatar in the integrations list,
   in audit entries, and on anything posted through the same webhook from
   somewhere else. Writing the name and picture onto the webhook once, when it
   is connected, makes the two agree everywhere. */

/** Fetches the logo and encodes it the way Discord wants an avatar: a data URI.
    Read over HTTP rather than from disk because `public/` is not guaranteed to
    be on the serverless filesystem at runtime. */
async function avatarDataUri(signal: AbortSignal) {
  const res = await fetch(DISCORD_AVATAR_URL, { cache: "no-store", signal });
  if (!res.ok) throw new Error(`Avatar responded ${res.status}.`);
  const type = res.headers.get("content-type") ?? "image/png";
  if (!type.startsWith("image/")) throw new Error("Avatar is not an image.");
  const bytes = Buffer.from(await res.arrayBuffer());
  // Discord rejects avatars over 10MB and the logo is under 100KB, so this is
  // only a guard against the URL quietly starting to serve something else.
  if (bytes.byteLength > 2_000_000) throw new Error("Avatar is too large.");
  return `data:${type};base64,${bytes.toString("base64")}`;
}

/** Gives the webhook the collective's name and logo inside Discord.

    Never throws: connecting a webhook must succeed even when Discord refuses
    the appearance change, so the caller gets a boolean and can say so. */
export async function brandWebhook(webhookUrl: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const url = validateDiscordWebhookUrl(webhookUrl);
    const avatar = await avatarDataUri(controller.signal);
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: DISCORD_NAME, avatar }),
      redirect: "error",
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
