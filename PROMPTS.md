# AI USAGE LOG & PROMPT HISTORY (PROMPTS.md)

This log documents the prompt architecture and development prompt history used during the creation of the **AI Technical Interviewer Agent**.

---

## 1. Interview Strategist Prompt
- **Purpose**: Generates initial interview strategy and first question based on candidate background and 31-day curriculum.
- **Inputs**: Candidate profile, job role, years of experience, completed/skipped curriculum days, learning signals.
- **Output Schema**: JSON containing `greeting`, `questionText`, `topic`, `questionType`, `difficulty`.

---

## 2. Answer Evaluator Prompt
- **Purpose**: Evaluates candidate's last answer across correctness, completeness, technical depth, reasoning, and claims to probe.
- **Inputs**: Candidate profile, question asked, candidate's raw answer.
- **Output Schema**: JSON containing `correctness`, `completeness`, `technicalDepth`, `reasoning`, `confidence`, `strengths`, `weaknesses`, `missingConcepts`, `claimsToProbe`, `recommendedAction`, `evaluatorNotes`.

---

## 3. Follow-up Decision & Question Generator Prompt
- **Purpose**: Creates the next adaptive question based on the evaluator's recommended action.
- **Inputs**: Previous question, candidate answer, evaluator result, next target curriculum day, curriculum objectives.
- **Output Schema**: JSON containing `transition`, `questionText`, `topic`, `questionType`, `difficulty`.

---

## 4. Final Feedback Compiler Prompt
- **Purpose**: Aggregates all turns and produces a structured final candidate report.
- **Inputs**: Full interview transcript, topic scores, strengths, weaknesses.
- **Output Schema**: JSON containing `summary`, `overallScore`, `technicalLevel`, `strengths`, `gaps`, `next`, `dimensions`, `confidence`.

---

## 5. Repository Restructuring Prompts (Refactoring)
- **Prompt**: "all frontend files are change into frontend folder and all bakend files are change into backendd folder and only use user curriculum data in data folder"
- **Purpose**: Restructured the monolithic codebase into a clean monorepo architecture (`frontend/`, `backend/`, `data/`) for better separation of concerns between the React Vite SPA and the Express backend.
- **Prompt**: "only candidate page insert this data only"
- **Purpose**: Modified the frontend architecture to consume the candidate data source directly from the local JSON file to ensure complete separation from backend API dependencies for static profile loading.

---

## 6. UI Polish & Modern Chat Interface Prompts
- **Prompt**: "Edit ONLY the chat/interview conversation UI in the provided image... Replace the current single AI question card with a modern conversational chat interface: Show the AI interviewer message as a left-aligned chat bubble... candidate response as a right-aligned chat bubble... Add timestamp labels... small AI typing indicator... Make the conversation feel like ChatGPT/modern AI interview chat..."
- **Purpose**: Completely overhauled the standard question feed into a modern, full-fledged chat interface to provide a familiar and engaging ChatGPT-like user experience.
- **Prompt**: "text box fixed bottom" & "remove this upper the text box 'Adaptive Sequence'" & "in chat text box remove this in image analyse"
- **Purpose**: Refined the chat layout to dock the input composer fixed to the bottom of the screen (full width) while removing cluttered metadata and unused formatting icons, achieving a pristine, minimalist chat UI.

---

## 7. Supabase Master Database Integration Prompts
- **Prompt**: "Build the complete Supabase PostgreSQL database for an **AI Interview Agent hackathon application**. The database must support the complete application workflow: Candidate Profile → Curriculum Analysis → Interview Planning → Question Generation → Candidate Answer → Answer Evaluation → Adaptive Decision → Next Question → Interview State → Final Feedback... Do NOT design this as a simple chatbot database."
- **Purpose**: Designed and implemented a robust, relational PostgreSQL database schema with custom stored procedures (`create_interview_session`, `record_interview_turn`, `save_answer_evaluation`) to manage the state of the complex adaptive interview engine.
- **Prompt**: "all are ok how to intergrate supabase with this project you can change it"
- **Purpose**: Migrated the Express backend from an in-memory local state map to the Supabase PostgreSQL database. Developed a seeding script for Candidates and Curriculum data, and completely refactored the orchestrator engine to transact with the database asynchronously.
