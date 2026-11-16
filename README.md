# AccuKnox Front-End Trainee Assignment — CNAPP Dashboard

A CNAPP-style (Cloud-Native Application Protection Platform) dashboard page built
with **React + Vite**, submitted for the AccuKnox Front-End Trainee assignment.

## What it does

- **JSON-driven dashboard** — all content lives in `src/data/dashboard.json`:
  5 categories (CSPM Executive Dashboard, Workload Protection / CWPP,
  Vulnerability Management, Compliance & Audit, Identity & Access), each
  containing multiple widgets with realistic security titles, values and text.
- **Add a widget** — the **+ Add Widget** button opens a dialog: pick a
  category, enter a name and text (plus optional type, value and unit) and the
  widget appears in that category.
- **Remove a widget** — two ways, as specified in the brief:
  1. the **×** button on any widget card, or
  2. **uncheck the widget** in the category list in the left sidebar.
- **Search across all widgets** — the search box in the top bar filters widgets
  by title, text or value across every category, with an empty-state message
  when nothing matches.

State is managed with React `useState` / `useMemo`; no external store library
is needed for this scope. The UI is a dark, professional security-dashboard
theme and is responsive (sidebar collapses below the content on narrow screens).

## Run it locally

Prerequisites: Node.js 18+ and npm.

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
```

Production build:

```bash
npm run build      # outputs static files to dist/
npm run preview    # serve the production build locally (http://localhost:4173)
```

## Project structure

```
index.html                  # page shell
src/
  main.jsx                  # React entry point
  App.jsx                   # dashboard UI: search, add dialog, remove, sidebar
  index.css                 # dark CNAPP theme
  data/
    dashboard.json          # categories -> widgets (the dashboard's data source)
```

## Author

K. Sasikumar Yadav — B.Tech CSE (Vellore Institute of Technology, 2026),
full-stack developer (React, Python, Django, Node.js).
