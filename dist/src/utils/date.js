const monthYearFormatter = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
});

const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

const shortMonthFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
});

export function createSafeDate(year, monthIndex, day) {
  return new Date(year, monthIndex, day, 12);
}

export function normalizeDate(date) {
  return createSafeDate(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfMonth(date) {
  return createSafeDate(date.getFullYear(), date.getMonth(), 1);
}

export function addDays(date, amount) {
  return createSafeDate(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function addMonths(date, amount) {
  return createSafeDate(date.getFullYear(), date.getMonth() + amount, 1);
}

export function daysInMonth(date) {
  return createSafeDate(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function moveToMonthKeepingDay(date, targetMonthDate) {
  const maxDay = daysInMonth(targetMonthDate);
  return createSafeDate(
    targetMonthDate.getFullYear(),
    targetMonthDate.getMonth(),
    Math.min(date.getDate(), maxDay),
  );
}

export function isSameDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function isSameMonth(left, right) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return createSafeDate(year, month - 1, day);
}

export function formatMonthYear(date) {
  return monthYearFormatter.format(date);
}

export function formatFullDate(date) {
  return fullDateFormatter.format(date);
}

export function formatShortDate(date) {
  return shortDateFormatter.format(date);
}

export function formatShortMonth(date) {
  return shortMonthFormatter.format(date);
}

export function compareDates(left, right) {
  return normalizeDate(left).getTime() - normalizeDate(right).getTime();
}

export function getOrderedRange(startDate, endDate) {
  return compareDates(startDate, endDate) <= 0
    ? [normalizeDate(startDate), normalizeDate(endDate)]
    : [normalizeDate(endDate), normalizeDate(startDate)];
}

export function isDateWithinRange(date, startDate, endDate) {
  if (!startDate || !endDate) {
    return false;
  }

  const [rangeStart, rangeEnd] = getOrderedRange(startDate, endDate);
  const currentTime = normalizeDate(date).getTime();

  return currentTime >= rangeStart.getTime() && currentTime <= rangeEnd.getTime();
}

export function getInclusiveDaySpan(startDate, endDate) {
  if (!startDate || !endDate) {
    return 0;
  }

  const [rangeStart, rangeEnd] = getOrderedRange(startDate, endDate);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round((rangeEnd.getTime() - rangeStart.getTime()) / millisecondsPerDay) + 1;
}

export function buildMonthDays(viewDate, today) {
  const monthStart = startOfMonth(viewDate);
  const gridStart = addDays(monthStart, -monthStart.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);

    return {
      date,
      dateKey: toDateKey(date),
      dayNumber: date.getDate(),
      inCurrentMonth: date.getMonth() === viewDate.getMonth(),
      isToday: isSameDay(date, today),
    };
  });
}
