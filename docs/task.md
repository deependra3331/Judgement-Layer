# Task Checklist — Judgment Layer

## Phase 1: Skeleton Setup & Home Screen UI
- [x] Create `phase1/public/index.html` (Home screen and placeholders for other screens)
- [x] Create `phase1/public/style.css` (Teal color scheme, Outfit & Inter fonts, core layout)
- [x] Create `phase1/public/app.js` (Client-side routing, tab switching, mock data loaders)
- [x] Implement `phase1/server.py` (Python 3 backend serving public files and mocking health endpoint)
- [x] Verify Phase 1 runs and displays clean static layouts

## Phase 2: Core Progressive Panels (Claude Integration)
- [x] Create `phase2/` files from Phase 1 foundation
- [x] Implement actual Claude API calls in `phase2/server.py` using urllib to call Anthropic API for Assumptions, Uncertainty, Context, and Prompts
- [x] Update `phase2/public/app.js` to trigger concurrent requests and load panels progressively with skeleton loader states
- [x] Add tooltips and expandable elements in `phase2/public/index.html` and `style.css`
- [x] Verify Phase 2 with sample inputs and ensure panels stream/resolve progressively

## Phase 3: Judgment Score Breakdown
- [x] Create `phase3/` files from Phase 2 foundation
- [x] Implement the `/api/analyze/score` endpoint in `phase3/server.py`
- [x] Update `phase3/public/app.js` to render the 4 score bars (Reasoning, Completeness, Factual Confidence, Usefulness)
- [x] Make the bars expandable, showing explanations on click
- [x] Render the summary statement and the bottom navigation CTA buttons (Use Output / Improve Output)
- [x] Verify Phase 3 flow

## Phase 4: Improved Output Screen (Full App)
- [x] Create `phase4/` files from Phase 3 foundation
- [x] Implement the `/api/improve` endpoint in `phase4/server.py`
- [x] Update `phase4/public/app.js` to handle "Help me improve this output" transition and load side-by-side comparison
- [x] Add visual comparison highlighting (showing added parts in green) and the "Copy Improved Output" copy-to-clipboard functionality
- [x] Refine responsive styling across all pages for a gorgeous premium design
- [x] Perform full system verification and produce walkthrough.md
