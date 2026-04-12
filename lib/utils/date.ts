import {
  format,
  formatDistance,
  isToday,
  isTomorrow,
  isThisWeek,
  parseISO,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";

export function formatShiftDate(isoDate: string): string {
  const date = parseISO(isoDate);
  if (isToday(date)) return `Today, ${format(date, "h:mm a")}`;
  if (isTomorrow(date)) return `Tomorrow, ${format(date, "h:mm a")}`;
  if (isThisWeek(date)) return format(date, "EEEE, h:mm a");
  return format(date, "EEE d MMM, h:mm a");
}

export function formatShiftRange(startIso: string, endIso: string): string {
  const start = parseISO(startIso);
  const end = parseISO(endIso);
  return `${format(start, "h:mm a")} – ${format(end, "h:mm a")}`;
}

export function formatShiftDuration(startIso: string, endIso: string): string {
  const start = parseISO(startIso);
  const end = parseISO(endIso);
  const hours = differenceInHours(end, start);
  const mins = differenceInMinutes(end, start) % 60;

  if (mins === 0) return `${hours} hr${hours !== 1 ? "s" : ""}`;
  return `${hours}.${Math.round((mins / 60) * 10)} hrs`;
}

export function formatShiftHours(startIso: string, endIso: string): number {
  const start = parseISO(startIso);
  const end = parseISO(endIso);
  return parseFloat((differenceInMinutes(end, start) / 60).toFixed(2));
}

/** "EEE\ndd\nMMM" for the calendar date widget in shift cards */
export function formatDateCard(isoDate: string): {
  day: string;
  date: string;
  month: string;
} {
  const date = parseISO(isoDate);
  return {
    day: format(date, "EEE").toUpperCase(),
    date: format(date, "d"),
    month: format(date, "MMM").toUpperCase(),
  };
}

export function formatRelative(isoDate: string): string {
  return formatDistance(parseISO(isoDate), new Date(), { addSuffix: true });
}

export function formatFullDate(isoDate: string): string {
  return format(parseISO(isoDate), "EEEE d MMMM yyyy");
}

export function formatShortDate(isoDate: string): string {
  return format(parseISO(isoDate), "d MMM yyyy");
}
