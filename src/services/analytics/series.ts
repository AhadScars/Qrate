import { addDays, addMonths, format, startOfDay, startOfMonth, startOfWeek } from "date-fns";

export type ScanPoint = { label: string; scans: number };

export function bucketScans(dates: Date[], from: Date, to: Date, unit: "day" | "week" | "month"): ScanPoint[] {
  const buckets = new Map<string, ScanPoint>();
  const cursorStart =
    unit === "month" ? startOfMonth(from) : unit === "week" ? startOfWeek(from, { weekStartsOn: 1 }) : startOfDay(from);
  const end =
    unit === "month" ? startOfMonth(to) : unit === "week" ? startOfWeek(to, { weekStartsOn: 1 }) : startOfDay(to);

  for (let cursor = cursorStart; cursor <= end; ) {
    const key = bucketKey(cursor, unit);
    buckets.set(key, { label: bucketLabel(cursor, unit), scans: 0 });
    cursor = unit === "month" ? addMonths(cursor, 1) : unit === "week" ? addDays(cursor, 7) : addDays(cursor, 1);
  }

  for (const date of dates) {
    if (date < from || date > to) continue;
    const anchor =
      unit === "month" ? startOfMonth(date) : unit === "week" ? startOfWeek(date, { weekStartsOn: 1 }) : startOfDay(date);
    const point = buckets.get(bucketKey(anchor, unit));
    if (point) point.scans += 1;
  }

  return Array.from(buckets.values());
}

function bucketKey(date: Date, unit: "day" | "week" | "month") {
  if (unit === "month") return format(date, "yyyy-MM");
  return format(date, "yyyy-MM-dd");
}

function bucketLabel(date: Date, unit: "day" | "week" | "month") {
  if (unit === "month") return format(date, "MMM yyyy");
  return format(date, "d MMM");
}
