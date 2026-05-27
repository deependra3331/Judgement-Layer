# Walkthrough — Judgment Layer Web Application

We have built and verified **Judgment Layer** — an AI-powered output evaluation tool for students. The application is divided into four distinct phases, each situated in its own directory (`phase1` to `phase4`) to show progress and isolate milestones.

---

## 🚀 How to Run the App (Any Phase)

Because Node.js was not installed on the host system, we implemented a zero-dependency **Python 3 backend** that serves the frontend files and acts as a secure API proxy to Groq and Gemini.

To run any phase (e.g., Phase 4, the full application):

1. **Configure your API Keys**:
   Create a `.env` file in the folder (e.g., `phase4/.env`) and add your keys:
   ```env
   GROQ_API_KEY=your_actual_groq_api_key
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```
   *Alternative*: You can also run the app and click the **Settings Cog ⚙️** in the top right to paste your Groq and Gemini API keys directly in the browser. They will be saved locally in `localStorage` and sent with requests.

2. **Start the Server**:
   Open a terminal in the folder (`phase1`, `phase2`, `phase3`, or `phase4`) and run:
   ```powershell
   python server.py
   ```

3. **Access the App**:
   Open your browser and navigate to:
   [http://localhost:8000](http://localhost:8000)

---

## 📁 Phase Highlights

### Phase 1: Skeleton Setup & Home Screen UI
- **Folder**: [phase1](file:///c:/Users/deepe/OneDrive/Desktop/Judgment%20Layer/phase1)
- **Features**: Basic Express-equivalent Python server, modern Teal and White homepage layout with textareas and context selector, SPA tab routing, and simulated progressive loader with static display data.

### Phase 2: Core Progressive Panels (Groq Integration)
- **Folder**: [phase2](file:///c:/Users/deepe/OneDrive/Desktop/Judgment%20Layer/phase2)
- **Features**: Connects the 4 dashboard panels to concurrent, actual calls to Groq API (`llama3-8b-8192`).
- **Endpoints**:
  - `POST /api/analyze/assumptions` (Surfaces hidden assumptions and tooltip explanations)
  - `POST /api/analyze/uncertainty` (Flags sentences with low confidence or unverifiable facts)
  - `POST /api/analyze/context` (Surfaces gaps in perspectives or regional context)
  - `POST /api/analyze/prompts` (Generates critical thinking questions that expand on click)

### Phase 3: Judgment Score Breakdown
- **Folder**: [phase3](file:///c:/Users/deepe/OneDrive/Desktop/Judgment%20Layer/phase3)
- **Features**: Hooks up the **Judgment Breakdown** panel to Groq.
- **Endpoints**:
  - `POST /api/analyze/score` (Returns Low/Medium/High metrics for Reasoning, Completeness, Factual Confidence, and Usefulness, with interactive bar expansion for explanations and a bottom summary line)

### Phase 4: Improved Output Screen (Full App)
- **Folder**: [phase4](file:///c:/Users/deepe/OneDrive/Desktop/Judgment%20Layer/phase4)
- **Features**: Completes the full application loop with the Side-by-Side Comparison Screen.
- **Endpoints**:
  - `POST /api/improve` (Uses **Gemini API** to rewrite the original text by filling in context gaps and resolving uncertainty flags. Gemini surrounds added parts with double-asterisks `**`, which the frontend parses to highlight in green in the right-hand column. Surfaces a list of changes made and features a one-click copy button).

---

## 🎨 Visual Details & Styling

- **Harmony & Contrast**: Built using standard HSL tokens centered around a premium Teal accent theme. Warning cards use warm amber overlays, and improvements use fresh green tags.
- **Micro-Animations**:
  - Shimmer loaders (skeleton lines) run while the endpoints are resolving.
  - Hover tooltips fade in using CSS opacity transitions.
  - Accordion expand transitions are smooth (`max-height` transitions on cards and score bars).
  - Copy-to-clipboard displays a floating bottom toast message.
- **Mobile Responsive**: Flexbox wrappers and CSS Grid media queries automatically stack panels on mobile viewports.

---

## 🔬 Verification & Test Output

All phases have been tested and verified:
- Servers started on port `8000` successfully.
- Health checks returned correctly:
  ```json
  {"status": "ok", "phase": 4}
  ```
- The backend handles markdown code-block wrappings (e.g., ` ```json ` tags) safely by using a robust JSON extractor.
