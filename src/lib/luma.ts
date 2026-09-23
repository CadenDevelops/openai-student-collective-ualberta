// Upcoming events from the collective's public Luma calendar, rendered natively
// on the home page so visitors do not have to leave the site to see them.
//
// Luma's official API needs a paid Luma Plus plan, so this reads the same public
// JSON the calendar page itself loads. It is undocumented, so everything below
// is parsed defensively: a missing field drops that detail, a malformed entry is
// skipped, and any failure returns null so the page falls back to a plain link
// to the calendar rather than an error.

export type LumaEvent = {
  id: string;
  title: string;
  url: string;
  start: Date;
  end?: Date;
  timeZone: string;
  cover?: string;
  /** Venue name when the host has made the address public. */
  venue?: string;
  online: boolean;
  status: "open" | "waitlist" | "full";
};

/** How often the home page re-reads the calendar, in seconds. */
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
  const id = str(ev.api_id), title = str(ev.name), slug = str(ev.url), start = date(ev.start_at);
  if (!id || !title || !slug || !start || !/^[\w-]+$/.test(slug)) return undefined;
  if (ev.visibility && ev.visibility !== "public") return undefined;

  const geo = ev.geo_address_info;
  const venue = geo && geo.mode === "shown" ? str(geo.address) : undefined;
  const cover = str(ev.cover_url);
  const soldOut = e.ticket_info?.is_sold_out === true;
  return {
    id, title,
    url: `https://luma.com/${slug}`,
    start,
    end: date(ev.end_at),
    timeZone: str(ev.timezone) ?? "America/Edmonton",
    cover: cover?.startsWith("https://") ? cover : undefined,
    venue,
    online: ev.location_type === "online" || ev.location_type === "zoom",
    status: e.registration_availability === "waitlist" || e.waitlist_active === true ? "waitlist" : soldOut ? "full" : "open",
  };
}

/** Upcoming public events, soonest first; `null` when the calendar could not be read. */
export async function upcomingEvents(calendarId: string, limit = 6): Promise<LumaEvent[] | null> {
  const url = `https://api.lu.ma/calendar/get-items?calendar_api_id=${encodeURIComponent(calendarId)}&period=future&pagination_limit=${limit + 4}`;
  try {
    const res = await fetch(url, { next: { revalidate: lumaRevalidate }, signal: AbortSignal.timeout(5000), headers: { accept: "application/json" } });
    if (!res.ok) return null;
    const body = await res.json();
    if (!body || !Array.isArray(body.entries)) return null;
    const now = Date.now();
    return body.entries
      .map(parseEntry)
      .filter((ev: LumaEvent | undefined): ev is LumaEvent => !!ev && (ev.end ?? ev.start).getTime() > now)
      .sort((a: LumaEvent, b: LumaEvent) => a.start.getTime() - b.start.getTime())
      .slice(0, limit);
  } catch {
    return null;
  }
}

/** "Thu, Oct 2" / "5:00 – 7:00 pm MDT", in the event's own time zone. */
export function formatWhen(ev: LumaEvent) {
  const tz = { timeZone: ev.timeZone };
  const day = new Intl.DateTimeFormat("en-CA", { ...tz, weekday: "short", month: "short", day: "numeric" }).format(ev.start);
  const time = (d: Date, zone: boolean) => new Intl.DateTimeFormat("en-US", { ...tz, hour: "numeric", minute: "2-digit", ...(zone ? { timeZoneName: "short" } : {}) }).format(d).toLowerCase().replace(/ ([a-z]{3,4})$/, (m) => m.toUpperCase());
  const sameDay = ev.end && new Intl.DateTimeFormat("en-CA", { ...tz, dateStyle: "short" }).format(ev.start) === new Intl.DateTimeFormat("en-CA", { ...tz, dateStyle: "short" }).format(ev.end);
  const hours = ev.end && sameDay ? `${time(ev.start, false)} – ${time(ev.end, true)}` : time(ev.start, true);
  const month = new Intl.DateTimeFormat("en-CA", { ...tz, month: "short" }).format(ev.start);
  const dayNum = new Intl.DateTimeFormat("en-CA", { ...tz, day: "numeric" }).format(ev.start);
  return { day, hours, month, dayNum, iso: ev.start.toISOString() };
}
