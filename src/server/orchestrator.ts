import {
  Candidate,
  CurriculumDay,
  FinalFeedback,
  FollowUpAction,
  InterviewState,
  InterviewStrategy,
  Question,
  QuestionDifficulty,
  QuestionType,
  TopicAssessed,
  AnswerEvaluation
} from '../types/interview';
import { CURRICULUM_DATA } from '../data/curriculum';
import { generateContentJSON, generateContentText } from './geminiService';

export function createInitialStrategy(candidate: Candidate): InterviewStrategy {
  const missions = candidate.missions || [];
  const completedDays = missions.filter(m => m.passed).map(m => m.day);
  const skippedDays = missions.filter(m => m.skipped).map(m => m.day);

  // Default key curriculum days representing core modules
  const candidateTargetDays = Array.from(
    new Set([
      ...completedDays.slice(0, 5),
      7, // Embeddings
      10, // Retrieval & Matching
      12, // Prompt Engineering
      21, // Agents
      23, // MCP
      28  // Deployment
    ])
  ).sort((a, b) => a - b);

  let difficulty: QuestionDifficulty = 'medium';
  if (candidate.member.yearsExperience >= 8 || candidate.signals.missionsFirstTry >= 20) {
    difficulty = 'hard';
  } else if (candidate.member.yearsExperience < 2 || candidate.signals.missionsFirstTry < 8) {
    difficulty = 'easy';
  }

  return {
    targetDays: candidateTargetDays,
    priorityTopics: ["Embeddings", "RAG & Retrieval", "Prompting & Tools", "Agentic AI & MCP", "Deployment & Observability"],
    difficulty,
    style: "technical_reasoning",
    focusAreas: ["conceptual_understanding", "system_design", "tradeoffs", "production_debugging"]
  };
}

export async function initializeInterview(
  sessionId: string,
  candidate: Candidate
): Promise<{ state: InterviewState; initialReply: string }> {
  const strategy = createInitialStrategy(candidate);
  const firstDayNum = strategy.targetDays[0] || 7;
  const firstDay = CURRICULUM_DATA.days.find(d => d.day === firstDayNum) || CURRICULUM_DATA.days[6];

  const firstQuestionPrompt = `
You are an experienced, empathetic, and sharp AI Engineering Technical Interviewer for an enterprise AI cohort.
Candidate: ${candidate.member.name} (${candidate.member.jobRole}, ${candidate.member.yearsExperience} yrs exp, ${candidate.member.education}).
Cohort progress: ${candidate.signals.missionsCompleted}/31 missions completed (${candidate.signals.missionsFirstTry} on first try).

Generate the FIRST technical question for Day ${firstDay.day}: "${firstDay.title}".
Learning Objectives: ${firstDay.objectives.join(", ")}.
Tools: ${firstDay.tools.join(", ")}.

Requirements for First Question:
1. Greet the candidate warmly and introduce the interview format briefly in 1-2 sentences.
2. Ask an engaging, practical conceptual/reasoning question related to Day ${firstDay.day} (${firstDay.title}).
3. Ensure the tone is professional, technical, and supportive.

Return JSON matching:
{
  "greeting": "Welcome message string",
  "questionText": "The actual question string",
  "topic": "${firstDay.title}",
  "questionType": "conceptual",
  "difficulty": "${strategy.difficulty}"
}
`;

  const fallbackFirst = {
    greeting: `Welcome ${candidate.member.name}. I'm your AI technical interviewer for today's session. We'll explore your understanding across core AI engineering concepts.`,
    questionText: `To kick off, let's discuss text embeddings and vector search from Day ${firstDay.day}. How do vector embeddings represent semantic meaning compared to traditional keyword indexing, and what are the key trade-offs when choosing vector dimensions?`,
    topic: firstDay.title,
    questionType: "conceptual" as QuestionType,
    difficulty: strategy.difficulty
  };

  const generated = await generateContentJSON(
    firstQuestionPrompt,
    "You are an expert AI engineering interviewer.",
    fallbackFirst
  );

  const initialQuestion: Question = {
    id: `q_1`,
    curriculumDay: firstDay.day,
    topic: generated.topic || firstDay.title,
    objective: firstDay.objectives[0] || "Understand core concepts",
    type: (generated.questionType as QuestionType) || "conceptual",
    difficulty: (generated.difficulty as QuestionDifficulty) || strategy.difficulty,
    text: generated.questionText || fallbackFirst.questionText,
    askedAt: new Date().toISOString()
  };

  const state: InterviewState = {
    sessionId,
    candidate,
    status: 'in_progress',
    questionCount: 1,
    minimumQuestions: 8,
    coveredDays: [firstDay.day],
    topicsAssessed: [],
    strengths: [],
    weaknesses: [],
    claimsToProbe: [
      `Candidate role: ${candidate.member.jobRole}`,
      `Completed ${candidate.signals.missionsCompleted} missions`
    ],
    difficulty: strategy.difficulty,
    lastQuestionType: initialQuestion.type,
    nextQuestionGoal: `Assess baseline understanding on Day ${firstDay.day}`,
    conversationSummary: `Interview started with ${candidate.member.name}. First question asked on Day ${firstDay.day}: ${firstDay.title}.`,
    strategy,
    history: [{ question: initialQuestion }],
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const initialReply = `${generated.greeting}\n\n${initialQuestion.text}`;

  return { state, initialReply };
}

export async function processTurn(
  state: InterviewState,
  candidateAnswer: string
): Promise<{ state: InterviewState; reply: string; done: boolean; feedback?: { summary: string; strengths: string[]; gaps: string[]; next: string[] } }> {
  const currentTurnIndex = state.history.length - 1;
  const currentQuestion = state.history[currentTurnIndex].question;

  // 1. Evaluate Candidate Answer using Gemini
  const evalPrompt = `
You are an expert AI Evaluator analyzing a candidate's answer during a technical interview.

Candidate: ${state.candidate.member.name} (${state.candidate.member.jobRole})
Curriculum Day: Day ${currentQuestion.curriculumDay} - ${currentQuestion.topic}
Question Asked: "${currentQuestion.text}"
Question Type: ${currentQuestion.type}
Difficulty: ${currentQuestion.difficulty}

Candidate's Answer:
"${candidateAnswer}"

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
- recommendedAction: DEEPEN | CLARIFY | CHALLENGE | SWITCH_TOPIC | REVISIT_WEAKNESS | INCREASE_DIFFICULTY | DECREASE_DIFFICULTY | SCENARIO | DEBUG
- evaluatorNotes: concise 1-2 sentence note

Return valid JSON with these exact fields.
`;

  const fallbackEval: AnswerEvaluation = {
    questionId: currentQuestion.id,
    candidateAnswer,
    correctness: 0.7,
    completeness: 0.7,
    technicalDepth: 0.65,
    reasoning: 0.7,
    confidence: 0.75,
    strengths: ["Demonstrated foundational understanding"],
    weaknesses: candidateAnswer.length < 50 ? ["Answer was brief, missing implementation details"] : [],
    missingConcepts: [],
    claimsToProbe: [],
    recommendedAction: candidateAnswer.length < 50 ? "CLARIFY" : "DEEPEN",
    evaluatorNotes: "Candidate provided a direct response."
  };

  const evaluation = await generateContentJSON<AnswerEvaluation>(
    evalPrompt,
    "You are a strict, fair technical interviewer evaluator.",
    fallbackEval
  );

  // Record evaluation into state history
  state.history[currentTurnIndex].answer = candidateAnswer;
  state.history[currentTurnIndex].evaluation = evaluation;

  // Update State Metrics & Observations
  if (evaluation.strengths.length > 0) {
    state.strengths = Array.from(new Set([...state.strengths, ...evaluation.strengths])).slice(-8);
  }
  if (evaluation.weaknesses.length > 0) {
    state.weaknesses = Array.from(new Set([...state.weaknesses, ...evaluation.weaknesses])).slice(-8);
  }
  if (evaluation.claimsToProbe.length > 0) {
    state.claimsToProbe = Array.from(new Set([...state.claimsToProbe, ...evaluation.claimsToProbe])).slice(-8);
  }

  // Update Topic Score
  const avgScore = Math.round(
    ((evaluation.correctness + evaluation.completeness + evaluation.technicalDepth + evaluation.reasoning) / 4) * 100
  );
  const existingTopicIndex = state.topicsAssessed.findIndex(t => t.day === currentQuestion.curriculumDay);
  let depthRating: 'shallow' | 'moderate' | 'strong' | 'expert' = 'moderate';
  if (evaluation.technicalDepth >= 0.85) depthRating = 'expert';
  else if (evaluation.technicalDepth >= 0.7) depthRating = 'strong';
  else if (evaluation.technicalDepth <= 0.4) depthRating = 'shallow';

  const updatedTopic: TopicAssessed = {
    topic: currentQuestion.topic,
    day: currentQuestion.curriculumDay,
    score: avgScore,
    confidence: Math.round(evaluation.confidence * 100) / 100,
    depth: depthRating,
    notes: evaluation.evaluatorNotes || "Assessed via interactive turn."
  };

  if (existingTopicIndex >= 0) {
    state.topicsAssessed[existingTopicIndex] = updatedTopic;
  } else {
    state.topicsAssessed.push(updatedTopic);
  }

  // Determine whether to complete interview or proceed
  const isMinQuestionsMet = state.questionCount >= state.minimumQuestions || state.history.length >= 8;

  // Complete interview after 8 questions are submitted
  if (isMinQuestionsMet) {
    state.status = 'completed';
    const finalFeedback = await compileFinalFeedback(state);
    state.finalFeedback = finalFeedback;

    return {
      state,
      reply: "Thank you! We have covered all necessary areas for your AI technical assessment. I have compiled your detailed evaluation report below.",
      done: true,
      feedback: {
        summary: finalFeedback.summary,
        strengths: finalFeedback.strengths,
        gaps: finalFeedback.gaps,
        next: finalFeedback.next
      }
    };
  }

  // Otherwise, select Next Curriculum Topic and Question
  let nextDayNum: number = currentQuestion.curriculumDay;
  let nextType: QuestionType = "reasoning";
  let nextDifficulty: QuestionDifficulty = state.difficulty;

  // Decide if we switch topic or probe deeper on current topic
  const isMinDaysMet = state.coveredDays.length >= 4;
  const shouldSwitchTopic =
    evaluation.recommendedAction === 'SWITCH_TOPIC' ||
    (existingTopicIndex >= 0 && state.questionCount % 2 === 0 && !isMinDaysMet) ||
    evaluation.recommendedAction === 'REVISIT_WEAKNESS';

  if (shouldSwitchTopic) {
    // Pick an uncovered day from candidate's curriculum
    const remainingDays = CURRICULUM_DATA.days.filter(d => !state.coveredDays.includes(d.day));
    if (remainingDays.length > 0) {
      nextDayNum = remainingDays[0].day;
    } else {
      // Pick another day from target days
      nextDayNum = (currentQuestion.curriculumDay % 31) + 1;
    }
  }

  if (!state.coveredDays.includes(nextDayNum)) {
    state.coveredDays.push(nextDayNum);
  }

  // Adjust difficulty based on recommendation
  if (evaluation.recommendedAction === 'INCREASE_DIFFICULTY' || evaluation.technicalDepth > 0.85) {
    nextDifficulty = 'hard';
  } else if (evaluation.recommendedAction === 'DECREASE_DIFFICULTY' || evaluation.technicalDepth < 0.4) {
    nextDifficulty = 'easy';
  }

  // Adjust question type
  if (evaluation.recommendedAction === 'CHALLENGE') nextType = 'challenge';
  else if (evaluation.recommendedAction === 'SCENARIO') nextType = 'scenario';
  else if (evaluation.recommendedAction === 'DEBUG') nextType = 'debugging';
  else if (evaluation.recommendedAction === 'CLARIFY') nextType = 'reasoning';
  else if (evaluation.recommendedAction === 'DEEPEN') nextType = 'tradeoff';
  else nextType = 'architecture';

  const nextCurriculumDay = CURRICULUM_DATA.days.find(d => d.day === nextDayNum) || CURRICULUM_DATA.days[0];

  // Generate Next Follow-up Question
  const nextQuestionPrompt = `
You are an adaptive AI Technical Interviewer conducting a multi-turn candidate interview.

Context:
Candidate: ${state.candidate.member.name} (${state.candidate.member.jobRole})
Previous Topic: Day ${currentQuestion.curriculumDay} - ${currentQuestion.topic}
Previous Question: "${currentQuestion.text}"
Candidate's Answer: "${candidateAnswer}"
Answer Analysis:
- Correctness: ${evaluation.correctness}
- Depth: ${evaluation.technicalDepth}
- Evaluator Action: ${evaluation.recommendedAction}
- Missing Concepts: ${evaluation.missingConcepts.join(", ")}
- Strengths: ${evaluation.strengths.join(", ")}

Next Goal: Ask the next question on Day ${nextCurriculumDay.day} ("${nextCurriculumDay.title}")
Type: ${nextType}
Difficulty: ${nextDifficulty}
Curriculum Objectives for Day ${nextCurriculumDay.day}: ${nextCurriculumDay.objectives.join("; ")}
Tools: ${nextCurriculumDay.tools.join(", ")}

Instructions:
1. First, provide a concise, natural 1-sentence transition that directly acknowledges an interesting or key point from their previous answer (e.g. "Good point regarding vector dimensions. Now let's build on that..." or "You highlighted hybrid retrieval, but let's examine what happens when...").
2. Ask a sharp, highly technical question specifically tailored to Day ${nextCurriculumDay.day} ("${nextCurriculumDay.title}").
3. Make sure the question tests real technical judgment, trade-offs, architecture, or debugging rather than generic textbook trivia.

Return JSON matching:
{
  "transition": "Transition phrase referencing their answer",
  "questionText": "The exact next question string",
  "topic": "${nextCurriculumDay.title}",
  "questionType": "${nextType}",
  "difficulty": "${nextDifficulty}"
}
`;

  const fallbackNext = {
    transition: `Thanks for explaining that aspect. Moving into Day ${nextCurriculumDay.day}: ${nextCurriculumDay.title}.`,
    questionText: `In the context of ${nextCurriculumDay.title}, how would you approach designing a production solution that balances performance, accuracy, and system complexity?`,
    topic: nextCurriculumDay.title,
    questionType: nextType,
    difficulty: nextDifficulty
  };

  const nextGen = await generateContentJSON(
    nextQuestionPrompt,
    "You are a top-tier technical interviewer generating adaptive follow-up questions.",
    fallbackNext
  );

  state.questionCount += 1;
  state.difficulty = nextDifficulty;
  state.lastQuestionType = nextType;
  state.nextQuestionGoal = `Assess ${nextCurriculumDay.title} with focus on ${nextType}`;
  state.updatedAt = new Date().toISOString();

  const newQuestionObj: Question = {
    id: `q_${state.questionCount}`,
    curriculumDay: nextCurriculumDay.day,
    topic: nextGen.topic || nextCurriculumDay.title,
    objective: nextCurriculumDay.objectives[0] || "Deepen understanding",
    type: nextType,
    difficulty: nextDifficulty,
    text: nextGen.questionText || fallbackNext.questionText,
    askedAt: new Date().toISOString()
  };

  state.history.push({ question: newQuestionObj });

  const reply = `${nextGen.transition}\n\n${newQuestionObj.text}`;

  return {
    state,
    reply,
    done: false
  };
}

export async function compileFinalFeedback(state: InterviewState): Promise<FinalFeedback> {
  const historySummary = state.history
    .map(h => `Q (Day ${h.question.curriculumDay} - ${h.question.topic}): ${h.question.text}\nA: ${h.answer || 'No answer'}\nScore: ${h.evaluation ? Math.round(h.evaluation.correctness * 100) : 'N/A'}`)
    .join("\n---\n");

  const prompt = `
You are the Lead Evaluator for technical assessments.
Synthesize the final evaluation report for candidate ${state.candidate.member.name} (${state.candidate.member.jobRole}).

Interview Transcript & Evaluations:
${historySummary}

Candidate Signals:
- Completed Missions: ${state.candidate.signals.missionsCompleted}
- Covered Curriculum Days in Interview: ${state.coveredDays.join(", ")}
- Identified Strengths: ${state.strengths.join("; ")}
- Identified Weaknesses: ${state.weaknesses.join("; ")}

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
`;

  const fallbackFeedback: FinalFeedback = {
    summary: `${state.candidate.member.name} demonstrated solid understanding across multiple AI engineering domains including ${state.coveredDays.map(d => `Day ${d}`).join(", ")}.`,
    overallScore: 82,
    technicalLevel: "Strong AI Engineering Candidate",
    strengths: state.strengths.length > 0 ? state.strengths : ["Understands fundamental RAG concepts", "Articulates tool usage clearly"],
    gaps: state.weaknesses.length > 0 ? state.weaknesses : ["Could deepen trade-off analysis under extreme scale constraints"],
    next: [
      "Practice fine-tuning datasets and LoRA hyperparameter selection (Days 14-15)",
      "Review multi-agent routing failure modes and MCP server error bounds (Days 22-24)",
      "Build production observability dashboards with Prometheus/Grafana (Day 29)"
    ],
    dimensions: {
      conceptualUnderstanding: 85,
      technicalDepth: 80,
      systemDesign: 82,
      reasoning: 84,
      productionAwareness: 78
    },
    topicScores: state.topicsAssessed,
    confidence: 0.88
  };

  const generated = await generateContentJSON<FinalFeedback>(
    prompt,
    "You are a senior AI technical interviewer compiling final candidate feedback.",
    fallbackFeedback
  );

  return {
    ...generated,
    topicScores: state.topicsAssessed
  };
}
