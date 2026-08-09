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

## supabase tablet query 

-- ============================================================================
-- SUPABASE POSTGRESQL MIGRATION: AI INTERVIEW AGENT HACKATHON
-- ============================================================================
-- This migration contains the complete database schema required for the 
-- adaptive technical interview decision engine.
-- ============================================================================


-- ============================================================================
-- 1. EXTENSIONS & HELPER FUNCTIONS
-- ============================================================================
-- Reusable function to automatically update the updated_at timestamp.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 2. TABLE: curriculum_modules
-- ============================================================================
-- Stores the high-level 31-day AI engineering curriculum modules.
CREATE TABLE IF NOT EXISTS curriculum_modules (
    n integer PRIMARY KEY,
    title text NOT NULL,
    day_start integer NOT NULL CHECK (day_start >= 1),
    day_end integer NOT NULL,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT valid_days CHECK (day_end >= day_start)
);


-- ============================================================================
-- 3. TABLE: curriculum_days
-- ============================================================================
-- Stores specific days and their learning objectives/tools.
CREATE TABLE IF NOT EXISTS curriculum_days (
    day integer PRIMARY KEY,
    module_n integer REFERENCES curriculum_modules(n),
    title text NOT NULL,
    type text,
    tools jsonb CHECK (jsonb_typeof(tools) = 'array'),
    objectives jsonb CHECK (jsonb_typeof(objectives) = 'array'),
    created_at timestamptz DEFAULT now()
);


-- ============================================================================
-- 4. TABLE: candidates
-- ============================================================================
-- Stores the learning profile of the candidates.
CREATE TABLE IF NOT EXISTS candidates (
    id text PRIMARY KEY,
    name text NOT NULL CHECK (length(trim(name)) > 0),
    job_role text,
    years_experience integer CHECK (years_experience >= 0),
    education text,
    status text,
    signals jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);


-- ============================================================================
-- 5. TABLE: candidate_missions
-- ============================================================================
-- Tracks which curriculum days the candidate has completed/passed/failed.
CREATE TABLE IF NOT EXISTS candidate_missions (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    candidate_id text NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    day integer NOT NULL REFERENCES curriculum_days(day),
    title text NOT NULL,
    passed boolean NULL,
    skipped boolean DEFAULT false,
    attempts integer NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (candidate_id, day) -- Prevents duplicate missions per candidate/day
);


-- ============================================================================
-- 6. TABLE: interview_sessions
-- ============================================================================
-- Represents one complete end-to-end interview instance.
CREATE TABLE IF NOT EXISTS interview_sessions (
    session_id text PRIMARY KEY,
    candidate_id text NOT NULL REFERENCES candidates(id),
    status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
    planned_days jsonb,
    question_count integer DEFAULT 0 CHECK (question_count >= 0),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    completed_at timestamptz NULL
);


-- ============================================================================
-- 7. TABLE: interview_state
-- ============================================================================
-- CRITICAL TABLE: The persistent state and brain of the interview engine. 
-- Ensures the LLM is not the sole source of truth and allows resumption.
CREATE TABLE IF NOT EXISTS interview_state (
    session_id text PRIMARY KEY REFERENCES interview_sessions(session_id) ON DELETE CASCADE,
    current_direction text,
    current_depth text CHECK (current_depth IN ('unknown', 'weak', 'partial', 'strong', 'expert')),
    topics_assessed jsonb,
    strengths jsonb,
    weaknesses jsonb,
    claims_to_probe jsonb,
    curriculum_days_covered jsonb,
    last_decision jsonb,
    last_evaluation jsonb,
    questions_asked integer DEFAULT 0 CHECK (questions_asked >= 0),
    followups_used integer DEFAULT 0 CHECK (followups_used >= 0),
    difficulty_level integer DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    state_version integer DEFAULT 1,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);


-- ============================================================================
-- 8. TABLE: interview_turns
-- ============================================================================
-- Normalized conversation history for the interview. 
CREATE TABLE IF NOT EXISTS interview_turns (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_id text NOT NULL REFERENCES interview_sessions(session_id),
    turn_index integer NOT NULL CHECK (turn_index >= 0),
    role text NOT NULL CHECK (role IN ('agent', 'candidate')),
    content text NOT NULL,
    covers_day integer NULL REFERENCES curriculum_days(day),
    topic text NULL,
    question_type text NULL CHECK (question_type IN ('fundamental', 'conceptual', 'practical', 'debugging', 'architecture', 'tradeoff', 'scenario', 'followup', 'clarification')),
    created_at timestamptz DEFAULT now(),
    UNIQUE (session_id, turn_index)
);


-- ============================================================================
-- 9. TABLE: answer_evaluations
-- ============================================================================
-- Tracks the LLM evaluator's analysis of the candidate's last answer.
CREATE TABLE IF NOT EXISTS answer_evaluations (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    turn_id bigint NOT NULL REFERENCES interview_turns(id),
    session_id text NOT NULL REFERENCES interview_sessions(session_id),
    score numeric(5,2) CHECK (score >= 0 AND score <= 100),
    depth text CHECK (depth IN ('unknown', 'weak', 'partial', 'strong', 'expert')),
    correctness text CHECK (correctness IN ('weak', 'partial', 'correct', 'strong')),
    technical_accuracy numeric(5,2) CHECK (technical_accuracy >= 0 AND technical_accuracy <= 100),
    reasoning_score numeric(5,2) CHECK (reasoning_score >= 0 AND reasoning_score <= 100),
    communication_score numeric(5,2) CHECK (communication_score >= 0 AND communication_score <= 100),
    confidence numeric(5,2) CHECK (confidence >= 0 AND confidence <= 1),
    strengths jsonb,
    weaknesses jsonb,
    claims_detected jsonb,
    missing_concepts jsonb,
    recommended_action text CHECK (recommended_action IN ('go_deeper', 'clarify', 'probe', 'switch_topic', 'increase_difficulty', 'decrease_difficulty')),
    evaluation_reason text,
    created_at timestamptz DEFAULT now()
);


-- ============================================================================
-- 10. TABLE: interview_decisions
-- ============================================================================
-- An auditable trail for hackathon judges answering "Why was this asked?".
CREATE TABLE IF NOT EXISTS interview_decisions (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_id text NOT NULL REFERENCES interview_sessions(session_id),
    turn_id bigint NULL REFERENCES interview_turns(id),
    decision_type text NOT NULL,
    reason text NOT NULL,
    previous_depth text CHECK (previous_depth IN ('unknown', 'weak', 'partial', 'strong', 'expert') OR previous_depth IS NULL),
    target_depth text CHECK (target_depth IN ('unknown', 'weak', 'partial', 'strong', 'expert') OR target_depth IS NULL),
    previous_topic text,
    target_topic text,
    confidence numeric(5,2) CHECK (confidence >= 0 AND confidence <= 1),
    metadata jsonb,
    created_at timestamptz DEFAULT now()
);


-- ============================================================================
-- 11. TABLE: interview_feedback
-- ============================================================================
-- Structured final report generated when the interview is completed.
CREATE TABLE IF NOT EXISTS interview_feedback (
    session_id text PRIMARY KEY REFERENCES interview_sessions(session_id) ON DELETE CASCADE,
    summary text,
    overall_score numeric(5,2) CHECK (overall_score >= 0 AND overall_score <= 100),
    technical_score numeric(5,2) CHECK (technical_score >= 0 AND technical_score <= 100),
    reasoning_score numeric(5,2) CHECK (reasoning_score >= 0 AND reasoning_score <= 100),
    communication_score numeric(5,2) CHECK (communication_score >= 0 AND communication_score <= 100),
    strengths jsonb,
    gaps jsonb,
    next_steps jsonb,
    topic_scores jsonb,
    recommendation text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);


-- ============================================================================
-- 12. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_candidate_missions_candidate_id ON candidate_missions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_missions_day ON candidate_missions(day);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_candidate_id ON interview_sessions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON interview_sessions(status);

CREATE INDEX IF NOT EXISTS idx_interview_turns_session_id ON interview_turns(session_id);
CREATE INDEX IF NOT EXISTS idx_interview_turns_covers_day ON interview_turns(covers_day);
CREATE INDEX IF NOT EXISTS idx_interview_turns_topic ON interview_turns(topic);
CREATE INDEX IF NOT EXISTS idx_interview_turns_session_index ON interview_turns(session_id, turn_index);

CREATE INDEX IF NOT EXISTS idx_answer_evaluations_session_id ON answer_evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_answer_evaluations_turn_id ON answer_evaluations(turn_id);
CREATE INDEX IF NOT EXISTS idx_answer_evaluations_session_created ON answer_evaluations(session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_interview_state_session_id ON interview_state(session_id);

CREATE INDEX IF NOT EXISTS idx_interview_decisions_session_id ON interview_decisions(session_id);
CREATE INDEX IF NOT EXISTS idx_interview_decisions_turn_id ON interview_decisions(turn_id);
CREATE INDEX IF NOT EXISTS idx_interview_decisions_session_created ON interview_decisions(session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_interview_feedback_session_id ON interview_feedback(session_id);


-- ============================================================================
-- 13. TRIGGERS
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_update_candidates ON candidates;
CREATE TRIGGER trigger_update_candidates
BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_update_candidate_missions ON candidate_missions;
CREATE TRIGGER trigger_update_candidate_missions
BEFORE UPDATE ON candidate_missions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_update_interview_sessions ON interview_sessions;
CREATE TRIGGER trigger_update_interview_sessions
BEFORE UPDATE ON interview_sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_update_interview_state ON interview_state;
CREATE TRIGGER trigger_update_interview_state
BEFORE UPDATE ON interview_state FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_update_interview_feedback ON interview_feedback;
CREATE TRIGGER trigger_update_interview_feedback
BEFORE UPDATE ON interview_feedback FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================================
-- 14. ENABLE RLS
-- ============================================================================
ALTER TABLE curriculum_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 15. RLS POLICIES (Explicit Named Policies)
-- ============================================================================
-- Note: 'anon' is allowed all permissions as per requirements for unauthenticated hacking,
-- and 'service_role' acts as the privileged backend execution context.

-- curriculum_modules
CREATE POLICY anon_select_curriculum_modules ON curriculum_modules FOR SELECT TO anon USING (true);
CREATE POLICY anon_insert_curriculum_modules ON curriculum_modules FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_update_curriculum_modules ON curriculum_modules FOR UPDATE TO anon USING (true);
CREATE POLICY anon_delete_curriculum_modules ON curriculum_modules FOR DELETE TO anon USING (true);
CREATE POLICY sr_all_curriculum_modules ON curriculum_modules TO service_role USING (true);

-- curriculum_days
CREATE POLICY anon_select_curriculum_days ON curriculum_days FOR SELECT TO anon USING (true);
CREATE POLICY anon_insert_curriculum_days ON curriculum_days FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_update_curriculum_days ON curriculum_days FOR UPDATE TO anon USING (true);
CREATE POLICY anon_delete_curriculum_days ON curriculum_days FOR DELETE TO anon USING (true);
CREATE POLICY sr_all_curriculum_days ON curriculum_days TO service_role USING (true);

-- candidates
CREATE POLICY anon_select_candidates ON candidates FOR SELECT TO anon USING (true);
CREATE POLICY anon_insert_candidates ON candidates FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_update_candidates ON candidates FOR UPDATE TO anon USING (true);
CREATE POLICY anon_delete_candidates ON candidates FOR DELETE TO anon USING (true);
CREATE POLICY sr_all_candidates ON candidates TO service_role USING (true);

-- candidate_missions
CREATE POLICY anon_select_candidate_missions ON candidate_missions FOR SELECT TO anon USING (true);
CREATE POLICY anon_insert_candidate_missions ON candidate_missions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_update_candidate_missions ON candidate_missions FOR UPDATE TO anon USING (true);
CREATE POLICY anon_delete_candidate_missions ON candidate_missions FOR DELETE TO anon USING (true);
CREATE POLICY sr_all_candidate_missions ON candidate_missions TO service_role USING (true);

-- interview_sessions
CREATE POLICY anon_select_interview_sessions ON interview_sessions FOR SELECT TO anon USING (true);
CREATE POLICY anon_insert_interview_sessions ON interview_sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_update_interview_sessions ON interview_sessions FOR UPDATE TO anon USING (true);
CREATE POLICY anon_delete_interview_sessions ON interview_sessions FOR DELETE TO anon USING (true);
CREATE POLICY sr_all_interview_sessions ON interview_sessions TO service_role USING (true);

-- interview_state
CREATE POLICY anon_select_interview_state ON interview_state FOR SELECT TO anon USING (true);
CREATE POLICY anon_insert_interview_state ON interview_state FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_update_interview_state ON interview_state FOR UPDATE TO anon USING (true);
CREATE POLICY anon_delete_interview_state ON interview_state FOR DELETE TO anon USING (true);
CREATE POLICY sr_all_interview_state ON interview_state TO service_role USING (true);

-- interview_turns
CREATE POLICY anon_select_interview_turns ON interview_turns FOR SELECT TO anon USING (true);
CREATE POLICY anon_insert_interview_turns ON interview_turns FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_update_interview_turns ON interview_turns FOR UPDATE TO anon USING (true);
CREATE POLICY anon_delete_interview_turns ON interview_turns FOR DELETE TO anon USING (true);
CREATE POLICY sr_all_interview_turns ON interview_turns TO service_role USING (true);

-- answer_evaluations
CREATE POLICY anon_select_answer_evaluations ON answer_evaluations FOR SELECT TO anon USING (true);
CREATE POLICY anon_insert_answer_evaluations ON answer_evaluations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_update_answer_evaluations ON answer_evaluations FOR UPDATE TO anon USING (true);
CREATE POLICY anon_delete_answer_evaluations ON answer_evaluations FOR DELETE TO anon USING (true);
CREATE POLICY sr_all_answer_evaluations ON answer_evaluations TO service_role USING (true);

-- interview_decisions
CREATE POLICY anon_select_interview_decisions ON interview_decisions FOR SELECT TO anon USING (true);
CREATE POLICY anon_insert_interview_decisions ON interview_decisions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_update_interview_decisions ON interview_decisions FOR UPDATE TO anon USING (true);
CREATE POLICY anon_delete_interview_decisions ON interview_decisions FOR DELETE TO anon USING (true);
CREATE POLICY sr_all_interview_decisions ON interview_decisions TO service_role USING (true);

-- interview_feedback
CREATE POLICY anon_select_interview_feedback ON interview_feedback FOR SELECT TO anon USING (true);
CREATE POLICY anon_insert_interview_feedback ON interview_feedback FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY anon_update_interview_feedback ON interview_feedback FOR UPDATE TO anon USING (true);
CREATE POLICY anon_delete_interview_feedback ON interview_feedback FOR DELETE TO anon USING (true);
CREATE POLICY sr_all_interview_feedback ON interview_feedback TO service_role USING (true);


-- ============================================================================
-- 16. SEED / HELPER FUNCTIONS
-- ============================================================================

-- Function to safely ingest and upsert curriculum learning days.
CREATE OR REPLACE FUNCTION upsert_curriculum_day_from_json(payload jsonb)
RETURNS jsonb AS $$
DECLARE
    result record;
BEGIN
    IF payload->>'day' IS NULL OR payload->>'module_n' IS NULL OR payload->>'title' IS NULL THEN
        RAISE EXCEPTION 'Fields day, module_n, and title are strictly required.';
    END IF;

    INSERT INTO curriculum_days (day, module_n, title, type, tools, objectives)
    VALUES (
        (payload->>'day')::integer,
        (payload->>'module_n')::integer,
        payload->>'title',
        payload->>'type',
        payload->'tools',
        payload->'objectives'
    )
    ON CONFLICT (day) DO UPDATE SET
        module_n = EXCLUDED.module_n,
        title = EXCLUDED.title,
        type = EXCLUDED.type,
        tools = EXCLUDED.tools,
        objectives = EXCLUDED.objectives
    RETURNING * INTO result;

    RETURN to_jsonb(result);
END;
$$ LANGUAGE plpgsql;


-- Atomic function to upsert a candidate profile along with their learning missions.
CREATE OR REPLACE FUNCTION upsert_candidate_from_json(payload jsonb)
RETURNS jsonb AS $$
DECLARE
    mission jsonb;
    result_candidate record;
BEGIN
    IF payload->>'id' IS NULL THEN
        RAISE EXCEPTION 'Candidate ID is strictly required.';
    END IF;

    -- Upsert the main candidate profile
    INSERT INTO candidates (id, name, job_role, years_experience, education, status, signals)
    VALUES (
        payload->>'id',
        payload->>'name',
        payload->>'job_role',
        (payload->>'years_experience')::integer,
        payload->>'education',
        payload->>'status',
        payload->'signals'
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        job_role = EXCLUDED.job_role,
        years_experience = EXCLUDED.years_experience,
        education = EXCLUDED.education,
        status = EXCLUDED.status,
        signals = EXCLUDED.signals
    RETURNING * INTO result_candidate;

    -- Iterate and upsert the missions array atomically
    IF payload->'missions' IS NOT NULL AND jsonb_typeof(payload->'missions') = 'array' THEN
        FOR mission IN SELECT * FROM jsonb_array_elements(payload->'missions') LOOP
            INSERT INTO candidate_missions (candidate_id, day, title, passed, skipped, attempts)
            VALUES (
                payload->>'id',
                (mission->>'day')::integer,
                mission->>'title',
                (mission->>'passed')::boolean,
                COALESCE((mission->>'skipped')::boolean, false),
                (mission->>'attempts')::integer
            )
            ON CONFLICT (candidate_id, day) DO UPDATE SET
                title = EXCLUDED.title,
                passed = EXCLUDED.passed,
                skipped = EXCLUDED.skipped,
                attempts = EXCLUDED.attempts;
        END LOOP;
    END IF;

    RETURN to_jsonb(result_candidate);
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 17. INTERVIEW ENGINE LOGIC FUNCTIONS
-- ============================================================================

-- Safely initializes a fresh interview session and its corresponding brain state.
CREATE OR REPLACE FUNCTION create_interview_session(
    p_session_id text,
    p_candidate_id text,
    p_planned_days jsonb
)
RETURNS jsonb AS $$
DECLARE
    session_rec record;
    state_rec record;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM candidates WHERE id = p_candidate_id) THEN
        RAISE EXCEPTION 'Candidate % does not exist.', p_candidate_id;
    END IF;

    INSERT INTO interview_sessions (session_id, candidate_id, planned_days, status)
    VALUES (p_session_id, p_candidate_id, p_planned_days, 'in_progress')
    RETURNING * INTO session_rec;

    -- Bootstrapping the interview state variables
    INSERT INTO interview_state (
        session_id,
        questions_asked,
        followups_used,
        difficulty_level,
        current_direction,
        current_depth,
        topics_assessed,
        strengths,
        weaknesses,
        claims_to_probe,
        curriculum_days_covered
    )
    VALUES (
        p_session_id,
        0,
        0,
        1,
        'assess_fundamentals',
        'unknown',
        '[]'::jsonb,
        '[]'::jsonb,
        '[]'::jsonb,
        '[]'::jsonb,
        '[]'::jsonb
    )
    RETURNING * INTO state_rec;

    RETURN jsonb_build_object('session', to_jsonb(session_rec), 'state', to_jsonb(state_rec));
END;
$$ LANGUAGE plpgsql;


-- Records a conversation turn securely and bumps the state question_count.
CREATE OR REPLACE FUNCTION record_interview_turn(
    p_session_id text,
    p_role text,
    p_content text,
    p_covers_day integer DEFAULT NULL,
    p_topic text DEFAULT NULL,
    p_question_type text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
    next_index integer;
    turn_rec record;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM interview_sessions WHERE session_id = p_session_id) THEN
        RAISE EXCEPTION 'Session % does not exist.', p_session_id;
    END IF;

    -- Automatically append to the end of the history
    SELECT COALESCE(MAX(turn_index), -1) + 1 INTO next_index
    FROM interview_turns
    WHERE session_id = p_session_id;

    INSERT INTO interview_turns (session_id, turn_index, role, content, covers_day, topic, question_type)
    VALUES (p_session_id, next_index, p_role, p_content, p_covers_day, p_topic, p_question_type)
    RETURNING * INTO turn_rec;

    IF p_role = 'agent' THEN
        UPDATE interview_sessions SET question_count = question_count + 1 WHERE session_id = p_session_id;
        UPDATE interview_state SET questions_asked = questions_asked + 1 WHERE session_id = p_session_id;
    END IF;

    RETURN to_jsonb(turn_rec);
END;
$$ LANGUAGE plpgsql;


-- Crucial atomic transaction: Locks in the LLM's evaluation and the resulting
-- engine decision, and mutates the current running persistent state.
CREATE OR REPLACE FUNCTION save_answer_evaluation(
    p_turn_id bigint,
    p_session_id text,
    p_eval_data jsonb,
    p_decision_data jsonb
)
RETURNS void AS $$
BEGIN
    -- 1. Snapshot the evaluation output
    INSERT INTO answer_evaluations (
        turn_id, session_id, score, depth, correctness, technical_accuracy,
        reasoning_score, communication_score, confidence, strengths, weaknesses,
        claims_detected, missing_concepts, recommended_action, evaluation_reason
    ) VALUES (
        p_turn_id, p_session_id,
        (p_eval_data->>'score')::numeric,
        p_eval_data->>'depth',
        p_eval_data->>'correctness',
        (p_eval_data->>'technical_accuracy')::numeric,
        (p_eval_data->>'reasoning_score')::numeric,
        (p_eval_data->>'communication_score')::numeric,
        (p_eval_data->>'confidence')::numeric,
        p_eval_data->'strengths',
        p_eval_data->'weaknesses',
        p_eval_data->'claims_detected',
        p_eval_data->'missing_concepts',
        p_eval_data->>'recommended_action',
        p_eval_data->>'evaluation_reason'
    );

    -- 2. Snapshot the corresponding adaptive decision
    INSERT INTO interview_decisions (
        session_id, turn_id, decision_type, reason, previous_depth,
        target_depth, previous_topic, target_topic, confidence, metadata
    ) VALUES (
        p_session_id, p_turn_id,
        p_decision_data->>'decision_type',
        p_decision_data->>'reason',
        p_decision_data->>'previous_depth',
        p_decision_data->>'target_depth',
        p_decision_data->>'previous_topic',
        p_decision_data->>'target_topic',
        (p_decision_data->>'confidence')::numeric,
        p_decision_data->'metadata'
    );

    -- 3. Atomically overwrite the rolling state
    UPDATE interview_state SET
        current_direction = p_decision_data->>'target_topic',
        current_depth = p_decision_data->>'target_depth',
        last_decision = p_decision_data,
        last_evaluation = p_eval_data,
        strengths = CASE WHEN p_eval_data->'strengths' IS NOT NULL THEN (strengths || (p_eval_data->'strengths')) ELSE strengths END,
        weaknesses = CASE WHEN p_eval_data->'weaknesses' IS NOT NULL THEN (weaknesses || (p_eval_data->'weaknesses')) ELSE weaknesses END,
        followups_used = CASE WHEN p_decision_data->>'decision_type' LIKE '%followup%' THEN followups_used + 1 ELSE followups_used END
    WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql;
