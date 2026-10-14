import "server-only";
import { DISCORD_AVATAR_URL, DISCORD_NAME, validateDiscordWebhookUrl } from "./discord";

async function avatarDataUri(signal: AbortSignal) {
  const res = await fetch(DISCORD_AVATAR_URL, { cache: "no-store", signal });
  if (!res.ok) throw new Error(`Avatar responded ${res.status}.`);
  const type = res.headers.get("content-type") ?? "image/png";
  if (!type.startsWith("image/")) throw new Error("Avatar is not an image.");
  const bytes = Buffer.from(await res.arrayBuffer());
  // discord caps avatars at 10MB; the logo is under 100KB
  if (bytes.byteLength > 2_000_000) throw new Error("Avatar is too large.");
  return `data:${type};base64,${bytes.toString("base64")}`;
}

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
