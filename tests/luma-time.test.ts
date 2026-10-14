import test from "node:test";
import assert from "node:assert/strict";
import { formatWhen, type LumaEvent } from "../src/lib/luma";
function event(start: string, end: string): LumaEvent {
  return {
    id: "fall-event",
    title: "Session",
    url: "https://luma.com/example",
    start: new Date(start),
    end: new Date(end),
    timeZone: "America/Edmonton",
    online: false,
    status: "open",
  };
}
test("Edmonton events stay at UTC−6 when Alberta stops changing clocks in November 2026", () => {
  for (const day of ["2026-10-14", "2026-11-04", "2026-11-18"]) {
    const when = formatWhen(event(`${day}T22:30:00Z`, `${day}T23:30:00Z`));
    assert.equal(when.hoursLocal, "4:30 pm – 5:30 pm");
    assert.equal(when.hours, "4:30 pm – 5:30 pm Edmonton time");
  }
  assert.equal(
    formatWhen(event("2026-12-07T22:00:00Z", "2026-12-08T00:00:00Z")).hoursLocal,
    "4:00 pm – 6:00 pm",
  );
});
