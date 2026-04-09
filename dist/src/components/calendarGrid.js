import {
  formatFullDate,
  formatShortMonth,
  isDateWithinRange,
  isSameDay,
} from "../utils/date.js";

function getDayStateLabel({
  isRangeStart,
  isRangeEnd,
  isInRange,
  hasCompletedRange,
  inCurrentMonth,
}) {
  if (isRangeStart && isRangeEnd) {
    return "Single-day range";
  }

  if (isRangeStart) {
    return "Range start";
  }

  if (isRangeEnd) {
    return "Range end";
  }

  if (isInRange) {
    return "In range";
  }

  if (!hasCompletedRange) {
    return inCurrentMonth ? "Pick date" : "Browse";
  }

  return inCurrentMonth ? "Start new range" : "Browse";
}

export function renderCalendarGrid(container, { activeDate, days, notes, rangeStart, rangeEnd }) {
  const hasCompletedRange = Boolean(rangeStart && rangeEnd);

  container.innerHTML = days
    .map((day) => {
      const hasNote = Boolean((notes[day.dateKey] ?? "").trim());
      const isActive = Boolean(activeDate && isSameDay(day.date, activeDate));
      const isTodayFocus = day.isToday && isActive;
      const isRangeStart = Boolean(rangeStart && isSameDay(day.date, rangeStart));
      const isRangeEnd = Boolean(rangeEnd && isSameDay(day.date, rangeEnd));
      const isInRange = isDateWithinRange(day.date, rangeStart, rangeEnd);
      const isRangeMiddle = isInRange && !isRangeStart && !isRangeEnd;
      const isSingleDayRange = isRangeStart && isRangeEnd;
      const classes = [
        "day-cell",
        day.inCurrentMonth ? "" : "day-cell--muted",
        day.isToday ? "day-cell--today" : "",
        isInRange ? "day-cell--in-range" : "",
        isRangeMiddle ? "day-cell--range-middle" : "",
        isRangeStart ? "day-cell--range-start" : "",
        isRangeEnd ? "day-cell--range-end" : "",
        isSingleDayRange ? "day-cell--range-single" : "",
        isActive ? "day-cell--active" : "",
        isTodayFocus ? "day-cell--today-focus" : "",
        hasNote ? "day-cell--has-note" : "",
      ]
        .filter(Boolean)
        .join(" ");

      const marker = day.isToday
        ? `<span class="day-cell__marker day-cell__marker--today">Today</span>`
        : !day.inCurrentMonth
          ? `<span class="day-cell__marker">${formatShortMonth(day.date)}</span>`
          : "";

      const stateLabel = getDayStateLabel({
        isRangeStart,
        isRangeEnd,
        isInRange,
        hasCompletedRange,
        inCurrentMonth: day.inCurrentMonth,
      });
      const footerLabel = hasNote ? "Saved note" : stateLabel;

      return `
        <button
          class="${classes}"
          type="button"
          role="gridcell"
          data-date-key="${day.dateKey}"
          aria-pressed="${String(isInRange || isRangeStart || isRangeEnd)}"
          aria-label="${formatFullDate(day.date)}, ${hasNote ? "saved note available" : stateLabel}"
        >
          <span class="day-cell__range-fill" aria-hidden="true"></span>
          <span class="day-cell__content">
            <span class="day-cell__topline">${marker}</span>
            <span class="day-cell__body">
              <span class="day-cell__number">${day.dayNumber}</span>
              <span class="day-cell__meta">
                <span class="day-cell__footer-label">${footerLabel}</span>
                <span class="day-cell__note-dot${hasNote ? " is-visible" : ""}" aria-hidden="true"></span>
              </span>
            </span>
          </span>
        </button>
      `;
    })
    .join("");
}
