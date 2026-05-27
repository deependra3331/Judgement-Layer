# Phase 1 — Skeleton UI & Setup

This folder represents **Phase 1** of the Judgment Layer refactor. It establishes the baseline layout, style sheets, and page navigation flows using mock analysis.

---

## 🎯 Phase 1 Goals
- Set up the zero-dependency Python server.
- Build the Home/Input Screen UI (pasting inputs, prompts, context dropdown).
- Build the skeleton cards for the Results page.
- Build page switching routing in client-side Javascript.
- Run simulated sequential panel loaders to mock the evaluation flow.

## 📁 Key Files
- `server.py`: Base HTTP server handling file assets and `/api/health`.
- `public/index.html`: Holds the DOM wrappers for Page 1, Page 2, Page 3, and Page 4.
- `public/style.css`: Houses CSS custom properties, grid dashboards, loading skeleton shimmer effects, and typography.
- `public/app.js`: Connects logo clicks, back buttons, and runs simulated setTimeout calls to populate static evaluations.

## 🚀 Running Phase 1
1. Open terminal in `phase1/`.
2. Run `python server.py`.
3. Open browser to [http://localhost:8000](http://localhost:8000).
4. Paste any text and click **Evaluate This Output** to observe the progressive skeleton load states and mockup data.
