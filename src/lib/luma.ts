// luma's calendar JSON is undocumented, so parse defensively

export type LumaEvent = {
  id: string;
  title: string;
  url: string;
  start: Date;
  end?: Date;
  timeZone: string;
  cover?: string;
  venue?: string;
  online: boolean;
  status: "open" | "waitlist" | "full";
};

export const lumaRevalidate = 600;

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const date = (v: unknown) => {
  const d = typeof v === "string" ? new Date(v) : undefined;
  return d && !Number.isNaN(d.getTime()) ? d : undefined;
};

function parseEntry(entry: unknown): LumaEvent | undefined {
  if (!entry || typeof entry !== "object") return undefined;
  const e = entry as Record<string, any>;
  const ev = e.event;
  if (!ev || typeof ev !== "object") return undefined;
  const id = str(ev.api_id),
    title = str(ev.name),
    slug = str(ev.url),
    start = date(ev.start_at);
  if (!id || !title || !slug || !start || !/^[\w-]+$/.test(slug)) return undefined;
  if (ev.visibility && ev.visibility !== "public") return undefined;

  const geo = ev.geo_address_info;
  const venue = geo && geo.mode === "shown" ? str(geo.address) : undefined;
  const cover = str(ev.cover_url);
  const soldOut = e.ticket_info?.is_sold_out === true;
  return {
    id,
    title,
    url: `https://luma.com/${slug}`,
    start,
    end: date(ev.end_at),
    timeZone: str(ev.timezone) ?? "America/Edmonton",
    cover: cover?.startsWith("https://") ? cover : undefined,
    venue,
    online: ev.location_type === "online" || ev.location_type === "zoom",
    status:
      e.registration_availability === "waitlist" || e.waitlist_active === true
        ? "waitlist"
        : soldOut
          ? "full"
          : "open",
  };
}

export async function upcomingEvents(calendarId: string, limit = 12): Promise<LumaEvent[] | null> {
  const url = `https://api.lu.ma/calendar/get-items?calendar_api_id=${encodeURIComponent(calendarId)}&period=future&pagination_limit=${limit + 4}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: lumaRevalidate },
      signal: AbortSignal.timeout(5000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    const body = await res.json();
    if (!body || !Array.isArray(body.entries)) return null;
    const now = Date.now();
    return body.entries
      .map(parseEntry)
      .filter(
        (ev: LumaEvent | undefined): ev is LumaEvent =>
          !!ev && (ev.end ?? ev.start).getTime() > now,
      )
      .sort((a: LumaEvent, b: LumaEvent) => a.start.getTime() - b.start.getTime())
      .slice(0, limit);
  } catch {
    return null;
  }
}

export function formatWhen(ev: LumaEvent) {
  // edmonton stays at UTC-6 from nov 2026; older ICU data disagrees
  const alberta = ev.timeZone === "America/Edmonton";
  const timeZone =
    alberta && ev.start >= new Date("2026-11-01T08:00:00Z") ? "Etc/GMT+6" : ev.timeZone;
  const tz = { timeZone };
  const day = new Intl.DateTimeFormat("en-CA", {
    ...tz,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(ev.start);
  const time = (d: Date, zone: boolean) => {
    const value = new Intl.DateTimeFormat("en-US", {
      ...tz,
      hour: "numeric",
      minute: "2-digit",
      ...(zone && !alberta ? { timeZoneName: "short" } : {}),
    })
      .format(d)
      .toLowerCase()
      .replace(/ ([a-z]{3,4})$/, (m) => m.toUpperCase());
    return zone && alberta ? `${value} Edmonton time` : value;
  };
  const sameDay =
    ev.end &&
    new Intl.DateTimeFormat("en-CA", { ...tz, dateStyle: "short" }).format(ev.start) ===
      new Intl.DateTimeFormat("en-CA", { ...tz, dateStyle: "short" }).format(ev.end);
  const hours =
    ev.end && sameDay ? `${time(ev.start, false)} – ${time(ev.end, true)}` : time(ev.start, true);
  const hoursLocal =
    ev.end && sameDay ? `${time(ev.start, false)} – ${time(ev.end, false)}` : time(ev.start, false);
  const month = new Intl.DateTimeFormat("en-CA", { ...tz, month: "short" }).format(ev.start);
  const dayNum = new Intl.DateTimeFormat("en-CA", { ...tz, day: "numeric" }).format(ev.start);
  return { day, hours, hoursLocal, month, dayNum, iso: ev.start.toISOString() };
}
