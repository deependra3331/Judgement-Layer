Judgment Layer — ChatGPT Output Evaluator
Judgment Layer is a student-focused AI output evaluation tool. Paste any ChatGPT-generated response and the application surfaces hidden assumptions, uncertainty flags, missing context gaps, and critical thinking prompts — then generates an improved version using a second AI model.

How It Works
Paste your ChatGPT output (and optionally your original prompt).
Select the context type (General, Academic Research, Essay Writing, Summarisation).
Evaluate — five concurrent analysis calls fire in parallel, loading each panel progressively.
Review the Judgment Score breakdown (Reasoning, Completeness, Factual Confidence, Usefulness).
Improve — click "Help me improve this output" to see a side-by-side rewritten version with green diff highlights.
AI Backend Strategy
Provider	Model	Used For	Call Frequency
Groq	llama-3.1-8b-instant	5 evaluation endpoints (assumptions, uncertainty, context, prompts, score)	Multiple per run
Gemini	gemini-2.5-flash	1 output improvement endpoint (/api/improve)	Once per run
Groq is used for the high-frequency calls because it is near-instantaneous. Gemini is used for the single, heavier improvement rewrite.

Project Phases
Phase	Folder	Description
1	phase1/	Skeleton UI, SPA routing, mock loaders
2	phase2/	Groq API integration for 4 evaluation panels
3	phase3/	Groq judgment score breakdown with expandable bars
4	phase4/	Full app — adds Gemini-powered side-by-side improvement screen
Tech Stack
Backend: Zero-dependency Python 3 HTTP proxy server (http.server + urllib)
Frontend: HTML5, Vanilla CSS3, ES6 JavaScript
LLMs: Groq (evaluation), Gemini (improvement)
Quick Start (Phase 4 — Full App)
1. Configure API Keys
Create phase4/.env:

GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIzaSy...
Or enter keys via the Settings Gear ⚙️ in the web UI (stored in localStorage).

2. Start the Server
cd phase4
python server.py
3. Open the App
Navigate to http://localhost:8000

Documentation
All detailed docs live in the docs/ folder:

File	Description
docs/architecture.md	Full system architecture, API routing, endpoint schemas
docs/implementation_plan.md	Phase-by-phase implementation plan and prompt designs
docs/task.md	Task checklist
docs/walkthrough.md	Step-by-step walkthrough and verification
Getting API Keys
Groq: console.groq.com — free tier available
Gemini: aistudio.google.com — free tier available
