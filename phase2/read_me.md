# Phase 2 — Groq API Panel Integration

This folder represents **Phase 2** of the Judgment Layer. It replaces the simulated loading states of the 4 progressive panels with actual, concurrent calls to the **Groq API**.

---

## 🎯 Phase 2 Goals
- Add the `GROQ_API_KEY` configuration options to the server and Settings modal.
- Connect `/api/analyze/assumptions`, `/api/analyze/uncertainty`, `/api/analyze/context`, and `/api/analyze/prompts` to Groq (`llama-3.1-8b-instant`).
- Trigger concurrent `fetch` requests in `app.js` to let panels load progressively as they complete.
- Highlight assumptions with tooltips and display uncertainty warnings using amber warning layouts.
- Integrate inline error messages in the cards if keys are missing or invalid.

## 📁 Key Files
- `server.py`: Performs HTTPS POST operations to Groq's completions endpoint and handles JSON extraction.
- `public/app.js`: Dispatches concurrent POST actions and parses JSON lists to build cards dynamically.

## 🚀 Running Phase 2
1. Add `GROQ_API_KEY=your_key` to a `.env` file in `phase2/`, or run the server and enter it via the web interface.
2. Run `python server.py`.
3. Load [http://localhost:8000](http://localhost:8000) and evaluate a ChatGPT output.
