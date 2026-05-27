# Phase 4 — Full Application (Groq + Gemini)

This folder represents **Phase 4** — the complete, production-ready Judgment Layer application. It combines the progressive Groq-powered evaluation panels and score breakdown with a Gemini-powered output improvement screen.

---

## 🎯 Phase 4 Goals
- All 5 evaluation endpoints (Assumptions, Uncertainty, Context, Prompts, Score) continue routing through **Groq** (`llama-3.1-8b-instant`).
- Add the `/api/improve` endpoint routing through **Gemini** (`gemini-2.5-flash`).
- Render a side-by-side comparison screen: Original (left) vs. Improved (right).
- Parse Gemini's `**double asterisk**` markers to render inline green highlights for additions.
- Display a summary of changes made and a **Copy Improved Output** clipboard button.

## 📁 Key Files
- `server.py`: Full Python proxy with `call_groq()` for 5 analysis endpoints and `call_gemini()` for the improvement endpoint.
- `public/app.js`: Stores the progressive analysis state globally and passes it to `/api/improve` when the user clicks the improve CTA. Displays shimmer loaders during generation.

## 🔑 API Keys Required
| Provider | Key Variable | Used For |
|----------|-------------|----------|
| Groq | `GROQ_API_KEY` | 5 evaluation endpoints (assumptions, uncertainty, context, prompts, score) |
| Gemini | `GEMINI_API_KEY` | 1 improvement endpoint (improve) using `gemini-2.5-flash` |

## 🚀 Running Phase 4
1. Add both keys to `.env`:
   ```env
   GROQ_API_KEY=gsk_...
   GEMINI_API_KEY=AIzaSy...
   ```
2. Run `python server.py`.
3. Load [http://localhost:8000](http://localhost:8000).
4. Paste a ChatGPT output, evaluate it, review scores, and click **Help me improve this output** to see the Gemini-powered rewrite.
