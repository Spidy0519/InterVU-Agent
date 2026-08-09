# AI Technical Interview Agent (Hackathon Submission)

An adaptive, multi-turn AI Technical Interviewer built for enterprise AI engineering candidates. Rather than a static set of questions, this agent dynamically orchestrates an adaptive interview session grounded in a 31-day enterprise curriculum covering RAG, Vector Databases, Prompt Engineering, Agentic AI, MCP, and Deployment.

---

## 💡 Inspiration
Traditional technical interviews are often rigidly scripted and fail to capture the true depth of a candidate's knowledge. We set out to build an **Adaptive Interviewer** that acts like a real senior engineer: it listens to the candidate's answer, evaluates its technical depth, challenges unsupported claims, and dynamically decides whether to drill deeper into the current topic or pivot to a new area.

> **Our Core Product Principle:** *The next question must be a consequence of the candidate's previous answer.*

## 🚀 What it does
- **Personalized Interview Strategy**: It analyzes the candidate's background, completed missions, skipped topics, and learning signals to formulate a unique, tailored interview plan.
- **Adaptive Multi-Turn Orchestration**: The AI dynamically chooses between:
  - **Deepen**: Asking follow-ups on interesting or complex points.
  - **Clarify / Challenge**: Probing shallow answers or unsupported claims.
  - **Switch Topic**: Seamlessly transitioning to unassessed curriculum areas.
- **Strict Proctoring**: Enforces fullscreen mode during the interview. Exiting prematurely automatically aborts the session and logs the system event.
- **Structured Final Evaluation Report**: Generates a rigorous executive summary, scoring across 5 dimensions (Conceptual, Depth, System Design, Reasoning, Production), evidence-backed strengths, critical knowledge gaps, and actionable next steps.

## 🛠️ How we built it

Our stack is separated into a robust backend API and a modern React frontend:
- **Backend (Node.js/Express)**: Exposes the exact `POST /api/interview` contract required by the hackathon spec. The core logic lives in `orchestrator.ts`, which leverages **Gemini 3.6 Flash** for high-speed, intelligent prompt orchestration.
- **Database (Supabase PostgreSQL)**: We migrated from local in-memory state to a robust relational database. It utilizes custom stored procedures (`create_interview_session`, `record_interview_turn`, `save_answer_evaluation`) to manage the complex, adaptive state of the engine.
- **Frontend (React/Vite)**: A minimalist, modern UI featuring a ChatGPT-like chat interface, real-time curriculum mapping, and strict proctoring mechanisms.

### Architecture
```text
React Frontend (Vite)
       │
       ▼
Express API Server (server.ts)
       │
       ├── POST /api/interview (Spec Endpoint)
       │
       ▼
Interview Orchestrator (orchestrator.ts)
       │
       ├── Candidate Loader & Strategy Engine
       ├── Answer Evaluator (Gemini 3.6 Flash)
       ├── Follow-up Decision Maker
       ├── Supabase DB State Manager
       └── Final Feedback Compiler
```

## 🧠 Challenges we ran into
- **Model Rate Limits**: Frequent testing caused Gemini API rate limits (`429 Resource Exhausted`). We engineered a dynamic fallback mechanism that still provides contextually appropriate questions and transitions even when the API is temporarily exhausted.
- **Database Constraints**: Mapping the complex LLM-generated JSON evaluations to strict PostgreSQL schema types required robust typing and validation before executing our custom RPCs.
- **State Looping**: Early iterations of the adaptive engine got "stuck" repeating the same topic. We fixed this by correctly synchronizing the `curriculum_days_covered` array between the LLM orchestrator and Supabase.

## 🔮 What's next
- **Audio/Voice Integration**: Allowing the candidate to speak their answers using WebRTC and Whisper for transcription.
- **Code Execution Environment**: Adding a live IDE where the AI can watch the candidate write code and ask questions about their implementation in real-time.
- **Expanded Curriculum Support**: Integrating dynamic JSON parsing for completely custom curriculums uploaded by recruiters.

---

## 🚦 Local Setup & Run

We use a monorepo setup.

```bash
# Terminal 1: Start Backend (Port 3000)
cd backend
npm install
npm run dev

# Terminal 2: Start Frontend (Port 5173)
cd frontend
npm install
npm run dev
```

## 📖 API Contract (`POST /api/interview`)

**Start Interview**
```json
POST /api/interview
{
  "sessionId": "sess_123",
  "candidate": { /* candidate profile */ }
}
```

**Conversation Turn**
```json
POST /api/interview
{
  "sessionId": "sess_123",
  "message": "We use dense vector embeddings with Cohere reranking..."
}
```

**Final Response on Completion**
```json
{
  "reply": "Interview completed.",
  "done": true,
  "feedback": {
    "summary": "...",
    "strengths": ["..."],
    "gaps": ["..."],
    "next": ["..."]
  }
}
```
