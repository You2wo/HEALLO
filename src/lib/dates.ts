// Days are handled as 'YYYY-MM-DD' keys in the user's own timezone and stored
// as UTC midnight of that key, so the server never depends on its local time.

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

export function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && DATE_KEY.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export function parseDateKey(key: string): Date {
  return new Date(`${key}T00:00:00Z`);
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(key: string, days: number): string {
  return toDateKey(new Date(parseDateKey(key).getTime() + days * DAY_MS));
}

export function diffDays(laterKey: string, earlierKey: string): number {
  return Math.round((parseDateKey(laterKey).getTime() - parseDateKey(earlierKey).getTime()) / DAY_MS);
}

// Date key for "now" in the browser's timezone.
export function localDateKey(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

// The client's date, trusted only when it is within a day of the server's.
export function clientToday(request: Request, now: Date = new Date()): string {
  const serverKey = toDateKey(now);
  const header = request.headers.get('x-client-date');
  if (isDateKey(header) && Math.abs(diffDays(header, serverKey)) <= 1) {
    return header;
  }
  return serverKey;
}

// UTC bounds of a calendar month (month is 1-12).
export function monthRange(year: number, month: number): { gte: Date; lt: Date } {
  return {
    gte: new Date(Date.UTC(year, month - 1, 1)),
    lt: new Date(Date.UTC(year, month, 1)),
  };
}
