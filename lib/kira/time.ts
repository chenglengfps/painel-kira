export function getZonedParts(date: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = dtf.formatToParts(date);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

export function dayKey(date: Date, timeZone: string): string {
  const p = getZonedParts(date, timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function zonedLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const parts = getZonedParts(new Date(utcGuess), timeZone);
  const asIfLocal = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return new Date(utcGuess - (asIfLocal - utcGuess));
}

export function pickSlotTimes(opts: {
  now: Date;
  timeZone: string;
  startHour: number;
  endHour: number;
  count: number;
  minGapMinutes: number;
}): Date[] {
  const p = getZonedParts(opts.now, opts.timeZone);
  const windowStart = zonedLocalToUtc(
    p.year, p.month, p.day, opts.startHour, 0, opts.timeZone,
  );
  const windowEnd = zonedLocalToUtc(
    p.year, p.month, p.day, opts.endHour, 0, opts.timeZone,
  );
  const rangeStart = opts.now > windowStart ? opts.now : windowStart;
  const span = windowEnd.getTime() - rangeStart.getTime();
  if (span < 2 * 60 * 1000 || opts.count <= 0) return [];

  const minGap = Math.max(1, opts.minGapMinutes) * 60 * 1000;
  const times: number[] = [];
  let attempts = 0;
  while (times.length < opts.count && attempts < 120) {
    attempts += 1;
    const t = rangeStart.getTime() + Math.random() * span;
    if (times.every((x) => Math.abs(x - t) >= minGap)) times.push(t);
  }

  if (times.length < opts.count) {
    const needed = opts.count - times.length;
    const step = span / (opts.count + 1);
    for (let i = 1; i <= needed; i += 1) {
      const t = rangeStart.getTime() + step * (times.length + i);
      if (t < windowEnd.getTime()) times.push(t);
    }
  }

  return times.sort((a, b) => a - b).slice(0, opts.count).map((t) => new Date(t));
}

export function formatClock(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone, hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDayLabel(day: string, timeZone: string): string {
  const [y, m, d] = day.split("-").map(Number);
  if (!y || !m || !d) return day;
  const date = zonedLocalToUtc(y, m, d, 12, 0, timeZone);
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone, weekday: "long", day: "2-digit", month: "long",
  }).format(date);
}

export function iso(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}
