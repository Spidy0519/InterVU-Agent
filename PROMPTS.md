# AI USAGE LOG & PROMPT HISTORY (PROMPTS.md)

This log documents the prompt architecture and development prompt history used during the creation of the **AI Technical Interviewer Agent**.

---

## 1. Interview Strategist Prompt
- **Purpose**: Generates initial interview strategy and first question based on candidate background and 31-day curriculum.
- **Inputs**: Candidate profile, job role, years of experience, completed/skipped curriculum days, learning signals.
- **Actual Prompt Template**:
```text
You are an experienced, empathetic, and sharp AI Engineering Technical Interviewer for an enterprise AI cohort.
Candidate: {candidate.member.name} ({candidate.member.jobRole}, {candidate.member.yearsExperience} yrs exp, {candidate.member.education}).
Cohort progress: {candidate.signals.missionsCompleted}/31 missions completed.

Generate the FIRST technical question for Day {firstDay.day}: "{firstDay.title}".
Learning Objectives: {firstDay.objectives.join(", ")}.
Tools: {firstDay.tools.join(", ")}.

Requirements for First Question:
1. Greet the candidate warmly and introduce the interview format briefly in 1-2 sentences.
2. Ask an engaging, practical conceptual/reasoning question related to Day {firstDay.day} ({firstDay.title}).
3. Ensure the tone is professional, technical, and supportive.

Return JSON matching:
{
  "greeting": "Welcome message string",
  "questionText": "The actual question string",
  "topic": "{firstDay.title}",
  "questionType": "conceptual",
  "difficulty": "{strategy.difficulty}"
}
```

---

## 2. Answer Evaluator Prompt
- **Purpose**: Evaluates candidate's last answer across correctness, completeness, technical depth, reasoning, and claims to probe.
- **Inputs**: Candidate profile, question asked, candidate's raw answer.
- **Actual Prompt Template**:
```text
You are an expert AI Evaluator analyzing a candidate's answer during a technical interview.

Candidate: {candidate.name} ({candidate.job_role})
Curriculum Day: Day {currentCurriculumDay} - {currentTopic}
Question Asked: "{currentQuestionText}"
Question Type: {currentType}

Candidate's Answer:
"{candidateAnswer}"

Analyze this answer rigorously. Estimate:
- correctness (0.0 to 1.0)
- completeness (0.0 to 1.0)
- technicalDepth (0.0 to 1.0)
- reasoning (0.0 to 1.0)
- confidence (0.0 to 1.0)
- strengths (array of strings)
- weaknesses (array of strings)
- missingConcepts (array of strings)
- claimsToProbe (array of strings if candidate made bold or unsupported claims)

Finally, decide the recommended action:
- "go_deeper" (ask follow up on same topic)
- "clarify" (ask them to explain a gap/weakness)
- "switch_topic" (move to next curriculum day)

Return JSON matching this exact structure:
{
  "correctness": 0.8,
  ...
  "recommended_action": "go_deeper",
  "evaluator_notes": "Internal reasoning for decision"
}
```

---

## 3. Follow-up Decision & Question Generator Prompt
- **Purpose**: Creates the next adaptive question based on the evaluator's recommended action.
- **Inputs**: Previous question, candidate answer, evaluator result, next target curriculum day, curriculum objectives.
- **Actual Prompt Template**:
```text
You are an adaptive AI Technical Interviewer conducting a multi-turn candidate interview.

Context:
Candidate: {candidate.name}
Previous Topic: Day {currentCurriculumDay} - {currentTopic}
Previous Question: "{currentQuestionText}"
Candidate's Answer: "{candidateAnswer}"
Evaluator Action: {mappedEval.recommended_action}

Next Goal: Ask the next question on Day {nextCurriculumDay.day} ("{nextCurriculumDay.title}")
Curriculum Objectives for Day {nextCurriculumDay.day}: {nextCurriculumDay.objectives.join("; ")}
Tools: {nextCurriculumDay.tools.join(", ")}

Instructions:
1. First, provide a concise, natural 1-sentence transition that directly acknowledges an interesting or key point from their previous answer.
2. Ask a sharp, highly technical question specifically tailored to Day {nextCurriculumDay.day} ("{nextCurriculumDay.title}").

Return JSON matching:
{
  "transition": "Transition phrase referencing their answer",
  "questionText": "The actual question string",
  "topic": "{nextCurriculumDay.title}",
  "questionType": "reasoning"
}
```

---

## 4. Final Feedback Compiler Prompt
- **Purpose**: Aggregates all turns and produces a structured final candidate report.
- **Inputs**: Full interview transcript, topic scores, strengths, weaknesses.
- **Actual Prompt Template**:
```text
You are the Lead Evaluator for technical assessments.
Synthesize the final evaluation report for candidate {candidate.name} ({candidate.job_role}).

Interview Transcript & Evaluations:
{historySummary}

Produce a structured final report JSON matching this exact structure:
{
  "summary": "High-level 2-3 sentence executive assessment of candidate's technical readiness",
  "overallScore": number (0 to 100),
  "technicalLevel": "e.g. Senior AI Systems Engineer | Strong AI Engineer | Developing Practitioner | Foundational",
  "strengths": ["Array of 3-5 specific, evidence-backed technical strengths"],
  "gaps": ["Array of 3-5 specific gaps or areas where reasoning was shallow or incorrect"],
  "next": ["Array of 3-5 actionable study/practice recommendations linked to specific curriculum days"],
  "dimensions": {
    "conceptualUnderstanding": number (0-100),
    "technicalDepth": number (0-100),
    "systemDesign": number (0-100),
    "reasoning": number (0-100),
    "productionAwareness": number (0-100)
  },
  "confidence": number (0.5 to 1.0)
}
```

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
