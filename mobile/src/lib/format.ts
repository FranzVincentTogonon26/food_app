export const money = (n: number) =>
  "$" +
  (Math.round(n * 100) / 100)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const ini = (n: string) =>
  n
    .split(" ")
    .filter(Boolean)
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/**
 * "1 dish", "3 dishes", "2 items" - a count with its word, pluralised.
 */
export const cnt = (n: number, w: string) =>
  `${n} ${n === 1 ? w : /(s|sh|ch|x)$/.test(w) ? w + "es" : w + "s"}`;

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** Local calendar key, YYYY-MM-DD. */
export function dayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function fromDayKey(k: string): Date {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export type DayOption = {
  key: string;
  /** "Today" | "Tmrw" | "Fri" */
  wd: string;
  /** day of month */
  dn: string;
  mo: string;
  label: string;
  /** "Friday, October 16" */
  long: string;
};

export function nextDays(count: number, from: Date = new Date()): DayOption[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    return {
      key: dayKey(d),
      wd:
        i === 0
          ? "Today"
          : i === 1
            ? "Tmrw"
            : d.toLocaleDateString("en-US", { weekday: "short" }),
      dn: String(d.getDate()),
      mo: d.toLocaleDateString("en-US", { month: "short" }),
      label:
        i === 0
          ? "Tonight"
          : d.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            }),
      long: d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    };
  });
}

/** Evening booking slot such as "7:30" (always PM) → minutes after midnight. */
export function pmSlotMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return ((h % 12) + 12) * 60 + m;
}

/** "Tonight" for today, otherwise "Fri, Oct 16". */
export function dayLabel(key: string): string {
  if (key === dayKey()) return "Tonight";
  return fromDayKey(key).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function dayLong(key: string): string {
  return fromDayKey(key).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function orderTime(at: number, now = Date.now()): string {
  if (now - at < 60_000) return "Just now";
  const d = new Date(at);
  const today = dayKey(new Date(now));
  if (dayKey(d) === today)
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (dayKey(d) === dayKey(y)) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

/** Compact relative time for notifications / reviews: "Now", "5m", "2h", ... */
export function relTime(at: number, now = Date.now()): string {
  const s = Math.max(0, now - at) / 1000;
  if (s < 60) return "Now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  const d = new Date(at);
  if (dayKey(d) === dayKey(new Date(now)))
    return `${Math.floor(s / 3600)}h`;
  return orderTime(at, now);
}

/**
 * Reviews read "2h ago", "Yesterday", "3d ago".
 */
export function agoLabel(at: number, now = Date.now()): string {
  const s = Math.max(0, now - at) / 1000;
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const days = Math.floor(s / 86400);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

export const isToday = (at: number) => dayKey(new Date(at)) === dayKey();