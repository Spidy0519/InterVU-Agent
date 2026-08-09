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
