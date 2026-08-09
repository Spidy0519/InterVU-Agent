# AI Technical Interview Agent

An adaptive, multi-turn AI Technical Interviewer for enterprise AI engineering candidates. Built for an enterprise cohort covering Retrieval-Augmented Generation (RAG), Vector Databases, Prompt Engineering, Agentic AI, Model Context Protocol (MCP), and AI Deployment.

---

## 🌟 Core Product Principle

> **The next question must be a consequence of the candidate's previous answer.**

Instead of asking a fixed questionnaire, the AI interviewer dynamically evaluates candidate responses, assesses reasoning depth, probes weak areas, challenges unsupported claims, and updates its strategy turn-by-turn.

---

## 🚀 Key Features

1. **Personalized Interview Strategy**: Analyzes candidate background, completed missions, skipped topics, and learning signals.
2. **31-Day Ground-Truth Curriculum**: Grounded in the enterprise AI cohort curriculum across 8 modules.
3. **Adaptive Multi-Turn Orchestration**:
   - **Deepen**: Ask follow-ups on interesting points.
   - **Clarify / Challenge**: Probe shallow answers or unsupported claims.
   - **Switch Topic**: Move to unassessed curriculum areas.
   - **Dynamic Difficulty**: Adapt difficulty between Easy, Medium, and Hard.
4. **Structured Final Evaluation Report**:
   - Overall Score & Technical Readiness Level.
   - 5-Dimension Radar Breakdown (Conceptual, Depth, System Design, Reasoning, Production).
   - Evidence-backed Strengths & Critical Knowledge Gaps.
   - Actionable Next Steps linked to curriculum days.
5. **Technical Specification Spec Compliance**: Exposes `POST /api/interview` matching the hackathon API contract.
6. **Minimalist White Aesthetics**: Built using white and light neutrals (`bg-white`, slate borders, crisp typography).

---

## 🛠️ Architecture

```
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
       ├── State Manager (interviewStore.ts)
       └── Final Feedback Compiler
```

---

## 📖 API Contract (`POST /api/interview`)

### Start Interview
```json
POST /api/interview
{
  "sessionId": "sess_123",
  "candidate": { ...candidateProfile }
}
```

### Response
```json
{
  "reply": "Welcome. Let's begin your interview...",
  "done": false
}
```

### Conversation Turn
```json
POST /api/interview
{
  "sessionId": "sess_123",
  "message": "We use dense vector embeddings with Cohere reranking..."
}
```

### Response on Completion
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

---

## 🚦 Local Setup & Run

```bash
# Install dependencies
npm install

# Start development full-stack server
npm run dev

# Build for production
npm run build
```
