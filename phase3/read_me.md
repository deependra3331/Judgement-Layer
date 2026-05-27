# Phase 3 — Groq Judgment Score Breakdown

This folder represents **Phase 3** of the Judgment Layer. It extends Phase 2 by adding the **Judgment Breakdown** section — four interactive, expandable score bars connected to the Groq API.

---

## 🎯 Phase 3 Goals
- Add the `/api/analyze/score` endpoint routing through the **Groq API** (`llama-3.1-8b-instant`).
- Render 4 rating bars: Reasoning Quality, Completeness, Factual Confidence, and Usefulness.
- Each bar displays a badge (`Low` / `Medium` / `High`) and fills proportionally.
- Clicking a bar expands it to reveal a plain-English explanation from the model.
- Display a summary sentence and two CTA buttons: **Use the Output** or **Help Me Improve**.

## 📁 Key Files
- `server.py`: Adds `/api/analyze/score` endpoint proxying to Groq with JSON-mode scoring schema.
- `public/app.js`: Calls the scoring endpoint concurrently with the 4 panel calls, maps results to UI elements.

## 🚀 Running Phase 3
1. Add `GROQ_API_KEY=your_key` to `.env` (or configure via browser Settings).
2. Run `python server.py`.
3. Load [http://localhost:8000](http://localhost:8000) and evaluate a ChatGPT output.
4. Click individual score bars to see their explanations.
