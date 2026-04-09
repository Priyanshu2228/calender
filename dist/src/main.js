import { renderCalendarGrid } from "./components/calendarGrid.js";
import { renderSelectionPanel } from "./components/selectionPanel.js";
import {
  addMonths,
  buildMonthDays,
  compareDates,
  fromDateKey,
  formatMonthYear,
  formatShortDate,
  getInclusiveDaySpan,
  getOrderedRange,
  isSameMonth,
  normalizeDate,
  startOfMonth,
  toDateKey,
} from "./utils/date.js";
import { deleteNote, isStorageReady, loadNotes, saveNote } from "./utils/storage.js";

const today = normalizeDate(new Date());
const state = {
  activeDate: today,
  notes: loadNotes(),
  rangeEnd: null,
  rangeStart: null,
  today,
  viewDate: startOfMonth(today),
  motion: "today",
};

const elements = {
  heroMonthLabel: document.querySelector("#heroMonthLabel"),
  heroDateLabel: document.querySelector("#heroDateLabel"),
  todayChip: document.querySelector("#todayChip"),
  rangeChip: document.querySelector("#rangeChip"),
  monthHeading: document.querySelector("#monthHeading"),
  prevMonthButton: document.querySelector("#prevMonthButton"),
  nextMonthButton: document.querySelector("#nextMonthButton"),
  todayButton: document.querySelector("#todayButton"),
  calendarGrid: document.querySelector("#calendarGrid"),
  selectionPanel: document.querySelector("#selectionPanel"),
};

let panelRefs = null;

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getRangeKey(startDate, endDate) {
  const [orderedStart, orderedEnd] = getOrderedRange(startDate, endDate);
  return `${toDateKey(orderedStart)}__${toDateKey(orderedEnd)}`;
}

function countNotesForMonth(monthDate) {
  return Object.keys(state.notes.dateNotes).filter((dateKey) => {
    const date = fromDateKey(dateKey);
    return isSameMonth(date, monthDate);
  }).length;
}

function getRangeSummary() {
  if (!state.rangeStart) {
    return {
      headline: "Choose a start date",
      chipLabel: "Range: not started",
    };
  }

  if (!state.rangeEnd) {
    return {
      headline: `Start: ${formatShortDate(state.rangeStart)}`,
      chipLabel: "Range: waiting for end",
    };
  }

  const [orderedStart, orderedEnd] = getOrderedRange(state.rangeStart, state.rangeEnd);
  const daySpan = getInclusiveDaySpan(orderedStart, orderedEnd);

  return {
    headline: `${formatShortDate(orderedStart)} to ${formatShortDate(orderedEnd)}`,
    chipLabel: `${daySpan} day${daySpan === 1 ? "" : "s"} selected`,
  };
}

function updateTopSection() {
  const currentMonthLabel = formatMonthYear(state.viewDate);
  const rangeSummary = getRangeSummary();

  elements.heroMonthLabel.textContent = currentMonthLabel;
  elements.heroDateLabel.textContent = rangeSummary.headline;
  elements.monthHeading.textContent = currentMonthLabel;
  elements.todayChip.textContent = `Today: ${formatShortDate(state.today)}`;
  elements.rangeChip.textContent = rangeSummary.chipLabel;
}

function triggerAnimation(element, className, classesToClear) {
  classesToClear.forEach((cssClass) => element.classList.remove(cssClass));
  void element.offsetWidth;
  element.classList.add(className);
}

function renderCalendar(animate = true) {
  renderCalendarGrid(elements.calendarGrid, {
    activeDate: state.activeDate,
    days: buildMonthDays(state.viewDate, state.today),
    notes: state.notes.dateNotes,
    rangeStart: state.rangeStart,
    rangeEnd: state.rangeEnd,
  });

  if (!animate) {
    return;
  }

  const animationClass =
    state.motion === "prev"
      ? "is-animating-prev"
      : state.motion === "next"
        ? "is-animating-next"
        : "is-animating-today";

  triggerAnimation(elements.calendarGrid, animationClass, [
    "is-animating-prev",
    "is-animating-next",
    "is-animating-today",
  ]);
}

function renderSelection() {
  const activeDateKey = toDateKey(state.activeDate);
  const activeMonthKey = getMonthKey(state.viewDate);
  const activeRangeKey =
    state.rangeStart && state.rangeEnd ? getRangeKey(state.rangeStart, state.rangeEnd) : null;

  panelRefs = renderSelectionPanel(elements.selectionPanel, {
    activeDate: state.activeDate,
    dateNoteText: state.notes.dateNotes[activeDateKey] ?? "",
    monthMemoText: state.notes.monthNotes[activeMonthKey] ?? "",
    notesInMonth: countNotesForMonth(state.viewDate),
    rangeNoteText: activeRangeKey ? state.notes.rangeNotes[activeRangeKey] ?? "" : "",
    rangeStart: state.rangeStart,
    rangeEnd: state.rangeEnd,
    storageReady: isStorageReady(),
    viewDate: state.viewDate,
  });

  bindNoteEditor(panelRefs.date, {
    emptyMessage: "No note saved for this date",
    focusAfterDelete: true,
    key: activeDateKey,
    scope: "dateNotes",
  });

  bindNoteEditor(panelRefs.month, {
    emptyMessage: "No memo saved for this month",
    key: activeMonthKey,
    scope: "monthNotes",
  });

  if (panelRefs.range && activeRangeKey) {
    bindNoteEditor(panelRefs.range, {
      emptyMessage: "No note saved for this range",
      key: activeRangeKey,
      scope: "rangeNotes",
    });
  }
}

function bindNoteEditor(refs, { emptyMessage, focusAfterDelete = false, key, scope }) {
  refs.textarea.addEventListener("input", (event) => {
    state.notes = saveNote(state.notes, scope, key, event.target.value);
    updateNoteStatus(refs, emptyMessage);
    updateTopSection();
    renderCalendar(false);
  });

  refs.deleteButton.addEventListener("click", () => {
    refs.textarea.value = "";
    state.notes = deleteNote(state.notes, scope, key);
    updateNoteStatus(refs, emptyMessage);
    updateTopSection();
    renderCalendar(false);

    if (focusAfterDelete) {
      refs.textarea.focus();
    }
  });

  updateNoteStatus(refs, emptyMessage);
}

function updateNoteStatus(refs, emptyMessage) {
  if (!refs) {
    return;
  }

  const hasContent = refs.textarea.value.trim().length > 0;
  refs.deleteButton.disabled = !hasContent;
  refs.status.textContent = hasContent
    ? isStorageReady()
      ? "Saved locally as you type"
      : "Saved for this session only"
    : emptyMessage;
  refs.status.classList.toggle("is-empty", !hasContent);
}

function render() {
  updateTopSection();
  renderCalendar();
  renderSelection();
}

function navigateMonth(direction) {
  state.viewDate = addMonths(state.viewDate, direction);
  state.motion = direction < 0 ? "prev" : "next";
  updateTopSection();
  renderCalendar();
  renderSelection();
}

function startNewRange(date, motion = "today") {
  state.activeDate = date;
  state.rangeStart = date;
  state.rangeEnd = null;
  state.viewDate = startOfMonth(date);
  state.motion = motion;
  render();
}

function completeRange(date, motion = "today") {
  state.activeDate = date;
  state.rangeEnd = date;
  state.viewDate = startOfMonth(date);
  state.motion = motion;
  render();
}

function getMotionForDate(date) {
  const targetMonth = startOfMonth(date);
  return compareDates(targetMonth, state.viewDate) < 0
    ? "prev"
    : compareDates(targetMonth, state.viewDate) > 0
      ? "next"
      : "today";
}

elements.prevMonthButton.addEventListener("click", () => {
  navigateMonth(-1);
});

elements.nextMonthButton.addEventListener("click", () => {
  navigateMonth(1);
});

elements.todayButton.addEventListener("click", () => {
  state.activeDate = state.today;
  state.viewDate = startOfMonth(state.today);
  state.motion = "today";
  render();
});

elements.calendarGrid.addEventListener("click", (event) => {
  const dayButton = event.target.closest("[data-date-key]");

  if (!dayButton) {
    return;
  }

  const selectedDate = fromDateKey(dayButton.dataset.dateKey);
  const motion = getMotionForDate(selectedDate);

  if (!state.rangeStart || state.rangeEnd) {
    startNewRange(selectedDate, motion);
    return;
  }

  completeRange(selectedDate, motion);
});

render();
