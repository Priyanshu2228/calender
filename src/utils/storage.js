const STORAGE_KEY = "wall-calendar-notes-v2";

function createEmptyNotes() {
  return {
    dateNotes: {},
    monthNotes: {},
    rangeNotes: {},
  };
}

function canUseStorage() {
  try {
    const probeKey = "__wall_calendar_probe__";
    window.localStorage.setItem(probeKey, "1");
    window.localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

function normalizeScopeValue(value) {
  return value && typeof value === "object" ? value : {};
}

function normalizeNotesShape(rawValue) {
  if (!rawValue || typeof rawValue !== "object") {
    return createEmptyNotes();
  }

  if ("dateNotes" in rawValue || "monthNotes" in rawValue || "rangeNotes" in rawValue) {
    return {
      dateNotes: normalizeScopeValue(rawValue.dateNotes),
      monthNotes: normalizeScopeValue(rawValue.monthNotes),
      rangeNotes: normalizeScopeValue(rawValue.rangeNotes),
    };
  }

  return {
    dateNotes: normalizeScopeValue(rawValue),
    monthNotes: {},
    rangeNotes: {},
  };
}

const storageAvailable = canUseStorage();

export function loadNotes() {
  if (!storageAvailable) {
    return createEmptyNotes();
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return createEmptyNotes();
    }

    return normalizeNotesShape(JSON.parse(rawValue));
  } catch {
    return createEmptyNotes();
  }
}

function writeNotes(notes) {
  if (!storageAvailable) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function saveNote(notes, scope, key, content) {
  const trimmedContent = content.trim();
  const nextNotes = {
    ...notes,
    [scope]: {
      ...notes[scope],
    },
  };

  if (trimmedContent) {
    nextNotes[scope][key] = trimmedContent;
  } else {
    delete nextNotes[scope][key];
  }

  writeNotes(nextNotes);
  return nextNotes;
}

export function deleteNote(notes, scope, key) {
  const nextNotes = {
    ...notes,
    [scope]: {
      ...notes[scope],
    },
  };

  delete nextNotes[scope][key];
  writeNotes(nextNotes);
  return nextNotes;
}

export function isStorageReady() {
  return storageAvailable;
}
