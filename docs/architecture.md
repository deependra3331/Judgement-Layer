# System Architecture — ChatGPT Judgment Layer

ChatGPT Judgment Layer is a multi-model evaluation application designed to scaffold students' critical reasoning when working with ChatGPT outputs. 

---

## Technical Concept & API Routing

To optimize speed, confidence, and cost, the application utilizes a hybrid LLM backend via a zero-dependency Python 3 proxy server:

1. **Groq API (`llama-3.1-8b-instant`)**: Used for the **5 progressive evaluation calls** because it handles multiple concurrent queries near-instantaneously.
2. **Gemini API (`gemini-2.5-flash`)**: Used for the **single, less-frequent output improvement call** because it possesses strong contextual rewrite capabilities.

```mermaid
graph TD
    subgraph Client (SPA Frontend)
        A["Home Input Form"]
        B["Progressive Dashboard (4 Panels)"]
        C["Judgment score Breakdown"]
        D["Settings (Groq + Gemini Key Storage)"]
        E["Side-by-Side Comparison"]
    end

    subgraph Python Server (BaseHTTPRequestHandler Proxy)
        F["GET Static Assets (HTML/CSS/JS)"]
        G["POST /api/analyze/*"]
        H["POST /api/improve"]
    end

    subgraph External LLMs
        I["Groq Cloud API<br>(llama-3.1-8b-instant)"]
        J["Google Gemini API<br>(gemini-2.5-flash)"]
    end

    A -->|1. Submit Output| B
    A -->|1. Submit Output| C
    B -->|2. Parallel Fetch| G
    C -->|2. Parallel Fetch| G
    G -->|3. Proxy Request| I
    E -->|4. Improve Call| H
    H -->|5. Proxy Request| J
    D -.->|Client Keys Override| G
    D -.->|Client Keys Override| H
```

---

## Directory Structure

```
Judgment Layer/
├── docs/
│   ├── implementation_plan.md
│   ├── task.md
│   ├── walkthrough.md
│   └── architecture.md     # System Architecture & Schemas
├── read_me.md              # Main project description & setup
├── phase1/                 # Phase 1: Skeleton
│   ├── .env
│   ├── server.py
│   ├── read_me.md
│   └── public/ (index.html, style.css, app.js)
├── phase2/                 # Phase 2: Groq 4-Panel API
│   ├── .env
│   ├── server.py
│   ├── read_me.md
│   └── public/ ...
├── phase3/                 # Phase 3: Groq Judgment Score
│   ├── .env
│   ├── server.py
│   ├── read_me.md
│   └── public/ ...
└── phase4/                 # Phase 4: Gemini Output Improvement
    ├── .env
    ├── server.py
    ├── read_me.md
    └── public/ ...
```

---

## Endpoint Schemas & System Prompts

To enforce structured rendering (tooltips, expandable blocks, color-coded badges, green visual diffs), the Python proxy requests JSON format from the LLMs.

### 1. assumptions (Groq)
- **Path**: `POST /api/analyze/assumptions`
- **System Prompt**: 
  > You are an AI output analyst. Given the following ChatGPT-generated response, identify 3–5 hidden assumptions the AI made while generating it. Be specific and concise. Return as bullet points only.
- **JSON Structure**:
  ```json
  [
    {
      "assumption": "Description of the assumption",
      "why_it_matters": "Context showing why this matters to the student"
    }
  ]
  ```

### 2. uncertainty (Groq)
- **Path**: `POST /api/analyze/uncertainty`
- **System Prompt**:
  > You are an AI output analyst. Given the following ChatGPT-generated response, identify 2–3 specific sentences or claims that have low confidence or cannot be easily verified. For each, explain in one plain sentence why it is uncertain. Return as a list.
- **JSON Structure**:
  ```json
  [
    {
      "sentence": "The flagged sentence or assertion",
      "reason": "Plain explanation of why it is questionable or unverified"
    }
  ]
  ```

### 3. context (Groq)
- **Path**: `POST /api/analyze/context`
- **System Prompt**:
  > You are an AI output analyst. Given the following ChatGPT-generated response and the original question, identify 2–4 important pieces of context, perspective, or information that are missing from this response. For each gap suggest how the student could fill it.
- **JSON Structure**:
  ```json
  [
    {
      "gap": "Description of the missing context",
      "how_to_fill": "Actionable instructions for the student to fill it"
    }
  ]
  ```

### 4. prompts (Groq)
- **Path**: `POST /api/analyze/prompts`
- **System Prompt**:
  > You are an AI output analyst. Given the following ChatGPT-generated response, generate 4–5 critical thinking questions a student should ask themselves before trusting and using this output. Make each question specific to the content, not generic.
- **JSON Structure**:
  ```json
  [
    {
      "question": "The critical thinking question",
      "explanation": "Explanation of why asking this question helps validate the output"
    }
  ]
  ```

### 5. score (Groq)
- **Path**: `POST /api/analyze/score`
- **System Prompt**:
  > You are an AI output analyst. Given the following ChatGPT-generated response, original prompt, and its context, rate the output across four categories: Reasoning Quality, Completeness, Factual Confidence, and Usefulness for the Task. Rate each as 'Low', 'Medium', or 'High' and explain why. Finally, write a summary sentence.
- **JSON Structure**:
  ```json
  {
    "reasoning": {"score": "Low"|"Medium"|"High", "explanation": "..." },
    "completeness": {"score": "Low"|"Medium"|"High", "explanation": "..." },
    "factual_confidence": {"score": "Low"|"Medium"|"High", "explanation": "..." },
    "usefulness": {"score": "Low"|"Medium"|"High", "explanation": "..." },
    "summary": "This output is a good starting point but needs verification on X key points."
  }
  ```

### 6. improve (Gemini)
- **Path**: `POST /api/improve`
- **System Prompt**:
  > You are an AI output improver. Given the original ChatGPT response, original prompt, and its analysis (assumptions, flags, missing context), output an improved version of the text that fills in gaps and resolves uncertainty. Also list the major changes you made and the reasons for them.
- **JSON Structure**:
  ```json
  {
    "improved_output": "The full revised text. Wrapped additions in double asterisks **like this**.",
    "changes": [
      {
        "change": "Description of modification",
        "reason": "Rationale detailing how it improves the response"
      }
    ]
  }
  ```

---

## Design System Tokens (CSS)

- **Fonts**: `Outfit` (headings), `Inter` (body/details).
- **Teal Base (Accent)**: HSL(175, 84%, 32%) for primary elements, borders, and selected states.
- **Warning Amber**: HSL(38, 92%, 50%) for low confidence scores and uncertainty banners.
- **Success Green**: HSL(142, 72%, 29%) for inline changes comparison highlights.
- **Shimmer Loaders**: CSS linear gradient animations mimicking skeleton lines during requests.
- **Responsive Layout**: Fluid flex/grid structures responding down to mobile screens (width <= 768px).
