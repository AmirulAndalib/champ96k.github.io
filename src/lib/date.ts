const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Parse an ISO date string into a Date object.
 *
 * Accepts:
 * - full ISO dates: `2026-08-15`
 * - month-only dates: `2026-08` or `2025-05`
 * - `present` -> returns null
 */
export function parseDate(value: string): Date | null {
  if (!value || value.toLowerCase() === 'present') return null;
  let normalized = value.trim();
  // `2026-08` -> `2026-08-01`
  if (/^\d{4}-\d{2}$/.test(normalized)) normalized = `${normalized}-01`;
  // Only append a time to bare calendar dates; leave ISO datetimes alone.
  if (!/T|Z|:/.test(normalized)) normalized += 'T00:00:00Z';
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `2026-08-15` -> `15 Aug 2026` */
export function formatDate(value: string): string {
  const date = parseDate(value);
  if (!date) return value;
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${day} ${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** `2026-08-15` -> `Aug 2026` */
export function formatMonthYear(value: string): string {
  const date = parseDate(value);
  if (!date) return value;
  return `${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** `2026-08-15` -> `2026` */
export function formatYear(value: string): string {
  const date = parseDate(value);
  if (!date) return value;
  return String(date.getUTCFullYear());
}

/** Year and full month for archive group headers: `August 2026` */
export function formatMonthLong(value: string): string {
  const date = parseDate(value);
  if (!date) return value;
  return `${MONTHS_LONG[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** Career/education range: `2025-05 – Present` */
export function formatRange(start: unknown, end: unknown): string {
  const s = String(start ?? '');
  const e = String(end ?? '').toLowerCase() === 'present' ? '' : String(end ?? '');
  const fs = s.length >= 7 ? formatMonthYear(s) : s;
  const fe = !e ? 'Present' : e.length >= 7 ? formatMonthYear(e) : e;
  return `${fs} — ${fe}`;
}

export interface DateParts {
  year: number;
  month: number;
}

export function dateParts(value: string): DateParts | null {
  const date = parseDate(value);
  if (!date) return null;
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
  };
}

export function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const da = parseDate(a.date)?.getTime() ?? 0;
    const db = parseDate(b.date)?.getTime() ?? 0;
    return db - da;
  });
}

export function sortByFieldDesc<T>(items: T[], field: keyof T): T[] {
  return [...items].sort((a, b) => {
    const va = a[field];
    const vb = b[field];
    if (typeof va === 'string' && typeof vb === 'string') return vb.localeCompare(va);
    return 0;
  });
}