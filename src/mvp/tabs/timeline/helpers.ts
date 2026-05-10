import type { TimelineEvent, TimelineEventType, TimelineSort } from './types';

/** Pinned to the seed window so relative-time strings render
 *  deterministically across screenshots. */
export const REL_NOW = '2026-02-26T10:00:00Z';

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function diffMs(iso: string, refIso: string = REL_NOW): number {
  return new Date(refIso).getTime() - new Date(iso).getTime();
}

export function formatRel(iso: string, refIso: string = REL_NOW): string {
  const ms = diffMs(iso, refIso);
  if (ms < 0) return 'just now';
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  if (sameLocalDay(iso, addDays(refIso, -1))) return 'Yesterday';
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return shortDate(iso);
}

export function absTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** "TODAY · 26 FEB 2026" / "YESTERDAY · 25 FEB 2026" / "24 FEB 2026". */
export function dayKey(iso: string, refIso: string = REL_NOW): string {
  const d = new Date(iso);
  const today = startOfUTCDay(refIso);
  const yesterday = addDays(today.toISOString(), -1);
  if (sameLocalDay(iso, today.toISOString())) return `TODAY · ${dayLabel(d)}`;
  if (sameLocalDay(iso, yesterday)) return `YESTERDAY · ${dayLabel(d)}`;
  return dayLabel(d);
}

function dayLabel(d: Date): string {
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = MONTHS_SHORT[d.getUTCMonth()].toUpperCase();
  return `${dd} ${mm} ${d.getUTCFullYear()}`;
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}`;
}

function startOfUTCDay(iso: string): Date {
  const d = new Date(iso);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addDays(iso: string, n: number): string {
  const d = startOfUTCDay(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString();
}

function sameLocalDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth() &&
    da.getUTCDate() === db.getUTCDate()
  );
}

export function selectVisibleTimelineEvents(
  events: TimelineEvent[],
  filters: Set<TimelineEventType>,
  query: string,
  sort: TimelineSort,
): TimelineEvent[] {
  const q = query.trim().toLowerCase();
  const filtered = events.filter((e) => {
    if (filters.size > 0 && !filters.has(e.type)) return false;
    if (!q) return true;
    return matchesQuery(e, q);
  });
  filtered.sort((a, b) => {
    const cmp = new Date(a.ts).getTime() - new Date(b.ts).getTime();
    return sort === 'newest' ? -cmp : cmp;
  });
  return filtered;
}

function matchesQuery(e: TimelineEvent, q: string): boolean {
  if (e.title.toLowerCase().includes(q)) return true;
  if (e.desc?.toLowerCase().includes(q)) return true;
  if (e.who.toLowerCase().includes(q)) return true;
  if (e.source?.toLowerCase().includes(q)) return true;
  if (e.payload && JSON.stringify(e.payload).toLowerCase().includes(q)) {
    return true;
  }
  return false;
}

export interface TimelineDayGroup {
  key: string;
  events: TimelineEvent[];
}

export function groupByDayKey(events: TimelineEvent[]): TimelineDayGroup[] {
  const out: TimelineDayGroup[] = [];
  let current: TimelineDayGroup | undefined;
  for (const e of events) {
    const k = dayKey(e.ts);
    if (!current || current.key !== k) {
      current = { key: k, events: [e] };
      out.push(current);
    } else {
      current.events.push(e);
    }
  }
  return out;
}
