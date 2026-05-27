# ChatGPT Judgment Layer — Student Output Evaluator

ChatGPT Judgment Layer is a modern, responsive web application designed for students. It parses ChatGPT-generated responses to surface hidden assumptions, uncertainty flags, missing context gaps, and critical thinking prompts, helping students build critical reasoning skills rather than relying blindly on AI.

---

## 🛠️ Tech Stack & Key Choices
- **Backend**: Zero-dependency **Python 3** HTTP proxy server (built with `http.server` and `urllib`), ensuring cross-platform capability without node module installation.
- **Frontend**: Clean **HTML5, Vanilla CSS3**, and **ES6 JavaScript** featuring HSL color schemes, skeleton load states, tooltips, accordions, and side-by-side highlighting.
- **AI Backend**:
  - **Groq API (`llama3-8b-8192`)**: Handles multiple concurrent requests for the 4 evaluation panels and judgment scores.
  - **Gemini API (`gemini-1.5-flash`)**: Handles the single output improvement rewrite.

---

## 📂 Folder Layout

- **[docs/](file:///c:/Users/deepe/OneDrive/Desktop/Judgment%20Layer/docs)**: Core project documentation (Implementation plan, task checklist, walkthrough, and [architecture.md](file:///c:/Users/deepe/OneDrive/Desktop/Judgment%20Layer/docs/architecture.md)).
- **[phase1/](file:///c:/Users/deepe/OneDrive/Desktop/Judgment%20Layer/phase1)**: Basic skeleton layout with SPA tab routing and mock loading animations.
- **[phase2/](file:///c:/Users/deepe/OneDrive/Desktop/Judgment%20Layer/phase2)**: Core progressive panels connected to the **Groq API** for live evaluations.
- **[phase3/](file:///c:/Users/deepe/OneDrive/Desktop/Judgment%20Layer/phase3)**: Judgment score breakdown page connected to the **Groq API** for rating bars.
- **[phase4/](file:///c:/Users/deepe/OneDrive/Desktop/Judgment%20Layer/phase4)**: Full application with side-by-side improved rewrite comparison connected to the **Gemini API**.

---

## ⚙️ How to Configure API Keys

The backend looks for a local `.env` file in the folder you are running. 

### Method A: Setup `.env` File (Recommended)
Create a `.env` file inside the phase folder you wish to run (e.g. `phase4/.env`):
```env
# Groq API Key (obtained from console.groq.com)
GROQ_API_KEY=gsk_...
# Gemini API Key (obtained from aistudio.google.com)
GEMINI_API_KEY=AIzaSy...
```

### Method B: Web UI Settings Overrides (Fallback)
1. Run the server and open the browser.
2. Click the **Settings Gear ⚙️** icon in the top right.
3. Paste your Groq API Key and Gemini API Key.
4. Click **Save Settings**. (Stored securely in browser `localStorage`).

---

## 🚀 Running the Server

1. Open your terminal in the desired phase folder (e.g., `phase4`):
   ```powershell
   cd phase4
   ```
2. Start the Python proxy server:
   ```powershell
   python server.py
   ```
3. Open your browser and navigate to:
   [http://localhost:8000](http://localhost:8000)
