import { formatMonthYear, formatShortDate, getInclusiveDaySpan, getOrderedRange } from "../utils/date.js";

function getSelectionCopy(rangeStart, rangeEnd) {
  if (!rangeStart) {
    return {
      title: "Brain dump",
      description:
        "Click any day to begin a range. The selected day opens here for notes, and you can also keep a memo for the whole month.",
    };
  }

  if (!rangeEnd) {
    return {
      title: "Choose The End Date",
      description:
        "Your start date is set. Move across months if needed, then click a second date to finish the inclusive span and unlock a note for that range.",
    };
  }

  return {
    title: "Selected Range",
    description:
      "The highlighted span remains active while you browse. You can keep separate notes for the month, the active date, and the completed range.",
  };
}

function renderEditor({
  datePill,
  deleteLabel,
  emptyMessage,
  idPrefix,
  placeholder,
  statusText,
  title,
}) {
  return `
    <div class="selection-sheet__editor-card">
      <div class="selection-sheet__editor-header">
        <div>
          <p class="selection-sheet__detail-label">${title}</p>
          <p class="selection-sheet__editor-date">${datePill}</p>
        </div>
      </div>

      <label class="selection-sheet__editor">
        <span class="selection-sheet__detail-label">${title}</span>
        <textarea
          class="selection-sheet__textarea"
          id="${idPrefix}Textarea"
          placeholder="${placeholder}"
          data-empty-message="${emptyMessage}"
          spellcheck="true"
        ></textarea>
      </label>

      <div class="selection-sheet__footer">
        <p class="selection-sheet__status" id="${idPrefix}Status">${statusText}</p>
        <button
          class="selection-sheet__button selection-sheet__button--danger"
          id="${idPrefix}DeleteButton"
          type="button"
        >
          ${deleteLabel}
        </button>
      </div>
    </div>
  `;
}

export function renderSelectionPanel(
  container,
  {
    activeDate,
    dateNoteText,
    monthMemoText,
    notesInMonth,
    rangeEnd,
    rangeNoteText,
    rangeStart,
    storageReady,
    viewDate,
  },
) {
  const copy = getSelectionCopy(rangeStart, rangeEnd);
  const [orderedStart, orderedEnd] =
    rangeStart && rangeEnd ? getOrderedRange(rangeStart, rangeEnd) : [rangeStart, rangeEnd];
  const daySpan = orderedStart && orderedEnd ? getInclusiveDaySpan(orderedStart, orderedEnd) : 0;
  const statusText = storageReady ? "Saved locally" : "Saved for this session only";

  container.innerHTML = `
    <div class="selection-sheet__card">
      <header class="selection-sheet__header">
        <p class="selection-sheet__eyebrow">Memo</p>
        <h2>${copy.title}</h2>
        <p class="selection-sheet__subhead">${copy.description}</p>
      </header>

      <div class="selection-sheet__meta">
        <span class="selection-sheet__meta-pill">Viewing: ${formatMonthYear(viewDate)}</span>
        <span class="selection-sheet__meta-pill">${
          daySpan > 0 ? `${daySpan} day${daySpan === 1 ? "" : "s"} selected` : "No completed range yet"
        }</span>
        <span class="selection-sheet__meta-pill">${notesInMonth} noted day${notesInMonth === 1 ? "" : "s"} this month</span>
      </div>

      <div class="selection-sheet__editor-stack">
        ${renderEditor({
          datePill: formatMonthYear(viewDate),
          deleteLabel: "Delete month memo",
          emptyMessage: "No memo saved for this month",
          idPrefix: "monthMemo",
          placeholder: `Write a monthly memo for ${formatMonthYear(viewDate)}...`,
          statusText,
          title: "Month Memo",
        })}

        ${
          orderedStart && orderedEnd
            ? renderEditor({
                datePill: `${formatShortDate(orderedStart)} to ${formatShortDate(orderedEnd)}`,
                deleteLabel: "Delete range note",
                emptyMessage: "No note saved for this range",
                idPrefix: "rangeNote",
                placeholder: `Write something for ${formatShortDate(orderedStart)} to ${formatShortDate(orderedEnd)}...`,
                statusText,
                title: "Range Note",
              })
            : `
              <div class="selection-sheet__editor-card selection-sheet__editor-card--placeholder">
                <p class="selection-sheet__detail-label">Range Note</p>
                <p class="selection-sheet__placeholder-copy">
                  Complete a range selection to attach one shared note to the whole span.
                </p>
              </div>
            `
        }

        ${renderEditor({
          datePill: formatShortDate(activeDate),
          deleteLabel: "Delete date note",
          emptyMessage: "No note saved for this date",
          idPrefix: "dateNote",
          placeholder: `Write something memorable for ${formatShortDate(activeDate)}...`,
          statusText,
          title: "Date Note",
        })}
      </div>
    </div>
  `;

  const refs = {
    date: {
      deleteButton: container.querySelector("#dateNoteDeleteButton"),
      status: container.querySelector("#dateNoteStatus"),
      textarea: container.querySelector("#dateNoteTextarea"),
    },
    month: {
      deleteButton: container.querySelector("#monthMemoDeleteButton"),
      status: container.querySelector("#monthMemoStatus"),
      textarea: container.querySelector("#monthMemoTextarea"),
    },
    range: rangeEnd
      ? {
          deleteButton: container.querySelector("#rangeNoteDeleteButton"),
          status: container.querySelector("#rangeNoteStatus"),
          textarea: container.querySelector("#rangeNoteTextarea"),
        }
      : null,
  };

  refs.date.textarea.value = dateNoteText;
  refs.month.textarea.value = monthMemoText;

  if (refs.range) {
    refs.range.textarea.value = rangeNoteText;
  }

  container.classList.remove("is-animating");
  void container.offsetWidth;
  container.classList.add("is-animating");

  return refs;
}
