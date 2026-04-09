# Wall Calendar Range

A premium wall-hanging monthly calendar built with vanilla JavaScript. Features a tactile paper aesthetic, smooth month navigation, cross-month date range selection, and persistent notes — all with zero dependencies.

![License](https://img.shields.io/badge/license-private-lightgrey) ![JS](https://img.shields.io/badge/JavaScript-ES%20Modules-f7df1e) ![No deps](https://img.shields.io/badge/dependencies-none-brightgreen)

---

## Features

- **Monthly calendar view** — Navigate forward and backward through months with animated transitions (slide left/right, or jump-to-today).
- **Cross-month date range selection** — Click a start date, navigate freely across months and years, then click an end date to complete a range. Ranges are visually highlighted with distinct start, middle, and end cells.
- **Three note scopes** — Write and save independent notes for:
  - A specific **date**
  - A completed **date range**
  - A whole **month memo**
- **LocalStorage persistence** — Notes are saved automatically as you type and survive page reloads. Falls back to session-only storage if localStorage is unavailable.
- **Cover art panel** — A decorative illustrated cover with landscape artwork (sun, clouds, hills, branches) rendered entirely in CSS.
- **Responsive layout** — Two-column layout (calendar + notes panel) collapses to a single column on smaller screens.
- **Reduced motion support** — Respects `prefers-reduced-motion`.
- **Accessible** — ARIA roles (`role="grid"`, `role="gridcell"`, `aria-pressed`, `aria-label`, `aria-live`) for screen reader support.

---

## Project Structure

```
wall-calendar-range/
├── index.html              # Entry point
├── styles.css              # All styles (CSS custom properties, BEM-like classes)
├── src/
│   ├── main.js             # App bootstrap, state management, event wiring
│   ├── components/
│   │   ├── calendarGrid.js    # Renders the 7×6 day grid
│   │   └── selectionPanel.js  # Renders the notes/memo side panel
│   └── utils/
│       ├── date.js            # Date math & Intl formatters
│       └── storage.js         # localStorage read/write helpers
├── dist/                   # Build output (mirrors src structure)
├── scripts/
│   ├── build.mjs           # Simple file-copy build script
│   └── start.mjs           # Minimal Node.js HTTP dev server
└── package.json
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later

### Install

No `npm install` needed — there are no dependencies.

```bash
git clone <repo-url>
cd wall-calendar-range
```

### Run (development)

```bash
npm run dev
# or
npm start
```

Opens a local HTTP server at [http://localhost:3000](http://localhost:3000). The server serves files directly from the project root with `no-store` cache headers, so edits to `src/` and `styles.css` are reflected on page reload.

### Build

```bash
npm run build
```

Copies `index.html`, `styles.css`, and the entire `src/` directory into `dist/`. The `dist/` folder is a self-contained, deployable snapshot.

---

## How It Works

### State

All UI state lives in a single plain object in `src/main.js`:

| Field | Type | Description |
|---|---|---|
| `activeDate` | `Date` | The currently selected/focused date |
| `viewDate` | `Date` | The first day of the month currently displayed |
| `rangeStart` | `Date \| null` | First click of a range selection |
| `rangeEnd` | `Date \| null` | Second click; completes the range |
| `notes` | `object` | `{ dateNotes, monthNotes, rangeNotes }` keyed by date/month/range strings |
| `today` | `Date` | Normalized reference to the current day |
| `motion` | `string` | Animation direction hint (`"prev"`, `"next"`, `"today"`) |

### Range Selection Flow

1. **First click** — Sets `rangeStart`, clears any previous `rangeEnd`. Navigation is unrestricted.
2. **Second click** — Sets `rangeEnd`. The range is considered complete regardless of order; `getOrderedRange()` normalises the dates so clicking backwards works correctly.
3. **Next click** — Starts a new range, resetting `rangeStart` and clearing `rangeEnd`.

### Note Storage Keys

| Scope | Key format | Example |
|---|---|---|
| Date note | `YYYY-MM-DD` | `2025-04-09` |
| Month memo | `YYYY-MM` | `2025-04` |
| Range note | `YYYY-MM-DD__YYYY-MM-DD` | `2025-04-01__2025-04-15` |

All notes are stored under the localStorage key `wall-calendar-notes-v2` as a single JSON blob.

### Date Utilities (`src/utils/date.js`)

All date operations use noon-anchored `Date` objects (`new Date(year, month, day, 12)`) to avoid DST boundary issues. Key exports:

- `buildMonthDays(viewDate, today)` — Generates the 42-cell (6-week) grid array.
- `getOrderedRange(start, end)` — Returns `[earlier, later]` regardless of click order.
- `getInclusiveDaySpan(start, end)` — Day count including both endpoints.
- `isDateWithinRange(date, start, end)` — Used to apply range highlight classes.
- `toDateKey / fromDateKey` — Serialize/deserialize dates to `YYYY-MM-DD` strings.

---

## Styling

All visual tokens are defined as CSS custom properties in `:root` (see `styles.css`). The palette is a warm paper/parchment theme:

| Token | Usage |
|---|---|
| `--ink` | Primary text |
| `--accent` / `--accent-deep` | Buttons, highlights |
| `--gold` / `--gold-soft` | Today indicator |
| `--surface` / `--surface-strong` | Card backgrounds |
| `--selected` / `--selected-ink` | Range start/end cells |
| `--shadow-xl/lg/sm` | Layered box shadows |

Class naming follows a BEM-inspired pattern: `block__element--modifier` (e.g. `day-cell__note-dot--is-visible`, `selection-sheet__button--danger`).

---

## Browser Support

Works in any modern browser with ES Module support (Chrome 61+, Firefox 60+, Safari 11+, Edge 79+). No polyfills are included.

---

## Deployment

The `dist/` folder after running `npm run build` is a static site — drop it into any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.) with no additional configuration.

---

## License

Private — all rights reserved.
