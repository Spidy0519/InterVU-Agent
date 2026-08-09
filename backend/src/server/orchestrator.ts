import { Candidate, FinalFeedback, AnswerEvaluation, QuestionDifficulty, QuestionType } from '../types/interview';
import fs from "fs";
import path from "path";
import { generateContentJSON } from './geminiService';
import { supabase } from '../../supabaseClient';

const CURRICULUM_DATA = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "../../../data/curriculum.json"), "utf8"));

export function createInitialStrategy(candidate: Candidate) {
  const missions = candidate.missions || [];
  const completedDays = missions.filter(m => m.passed).map(m => m.day);
  
  const candidateTargetDays = Array.from(
    new Set([
      ...completedDays.slice(0, 5),
      7, 10, 12, 21, 23, 28
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

export async function initializeInterview(sessionId: string, candidate: Candidate) {
  const strategy = createInitialStrategy(candidate);
  const firstDayNum = strategy.targetDays[0] || 7;
  const firstDay = CURRICULUM_DATA.days.find((d: any) => d.day === firstDayNum) || CURRICULUM_DATA.days[6];

  // 1. Initialize session in Supabase
  const { error: initErr } = await supabase.rpc('create_interview_session', {
    p_session_id: sessionId,
    p_candidate_id: candidate.member.id,
    p_planned_days: strategy.targetDays
  });
  if (initErr) throw new Error(`Failed to initialize session in DB: ${initErr.message}`);

  // 2. Generate First Question
  const firstQuestionPrompt = `
You are an experienced, empathetic, and sharp AI Engineering Technical Interviewer for an enterprise AI cohort.
Candidate: ${candidate.member.name} (${candidate.member.jobRole}, ${candidate.member.yearsExperience} yrs exp, ${candidate.member.education}).
Cohort progress: ${candidate.signals.missionsCompleted}/31 missions completed.

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

  const generated = await generateContentJSON(firstQuestionPrompt, "You are an expert AI engineering interviewer.", fallbackFirst);
  const initialReply = `${generated.greeting}\n\n${generated.questionText}`;

  // 3. Record the agent's turn in Supabase
  const { error: turnErr } = await supabase.rpc('record_interview_turn', {
    p_session_id: sessionId,
    p_role: 'agent',
    p_content: initialReply,
    p_covers_day: firstDay.day,
    p_topic: generated.topic || firstDay.title,
    p_question_type: generated.questionType || 'conceptual'
  });
  if (turnErr) throw new Error(`Failed to record initial turn: ${turnErr.message}`);

  // 4. Fetch updated state
  const { data: stateData } = await supabase.from('interview_state').select('*').eq('session_id', sessionId).single();

  return { 
    stateSummary: {
      questionCount: stateData.questions_asked,
      coveredDays: stateData.curriculum_days_covered || [],
      difficulty: stateData.difficulty_level || 1,
      nextGoal: stateData.current_direction || 'assess_fundamentals'
    },
    initialReply 
  };
}

export async function processTurn(sessionId: string, candidateAnswer: string) {
  // 1. Record Candidate's Answer in DB
  const { data: candTurnData, error: candTurnErr } = await supabase.rpc('record_interview_turn', {
    p_session_id: sessionId,
    p_role: 'candidate',
    p_content: candidateAnswer
  });
  if (candTurnErr) throw new Error(`Failed to record candidate turn: ${candTurnErr.message}`);

  console.log("candTurnData returned from RPC:", candTurnData);

  // 2. Fetch full session context for Gemini evaluation
  const { data: sessionData, error: sessionErr } = await supabase
    .from('interview_sessions')
    .select('*, candidates(*), interview_state(*), interview_turns(*)')
    .eq('session_id', sessionId)
    .single();
    
  if (sessionErr || !sessionData) throw new Error("Session not found in DB");

  const state = Array.isArray(sessionData.interview_state) 
    ? sessionData.interview_state[0] 
    : sessionData.interview_state;
  const candidate = sessionData.candidates;
  
  // Sort turns chronologically
  const turns = sessionData.interview_turns.sort((a: any, b: any) => a.turn_index - b.turn_index);
  
  // Find the last agent question (it should be the second to last turn)
  const revTurns = [...turns].reverse();
  const lastAgentTurn = revTurns.find((t: any) => t.role === 'agent');
  
  const currentQuestionText = lastAgentTurn ? lastAgentTurn.content : "Unknown Question";
  const currentCurriculumDay = lastAgentTurn ? lastAgentTurn.covers_day : 7;
  const currentTopic = lastAgentTurn ? lastAgentTurn.topic : "Unknown Topic";
  const currentType = lastAgentTurn ? lastAgentTurn.question_type : "conceptual";

  // 3. Evaluate Candidate Answer using Gemini
  const evalPrompt = `
You are an expert AI Evaluator analyzing a candidate's answer during a technical interview.

Candidate: ${candidate.name} (${candidate.job_role})
Curriculum Day: Day ${currentCurriculumDay} - ${currentTopic}
Question Asked: "${currentQuestionText}"
Question Type: ${currentType}

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
- recommendedAction: go_deeper | clarify | probe | switch_topic | increase_difficulty | decrease_difficulty
- evaluatorNotes: concise 1-2 sentence note

Return valid JSON with these exact fields mapped properly to the schema.
`;

  const isShort = candidateAnswer.length < 20;
  
  const fallbackEval = {
    correctness: isShort ? 0.0 : 0.4,
    completeness: isShort ? 0.0 : 0.4,
    technicalDepth: isShort ? 0.0 : 0.3,
    reasoning: isShort ? 0.0 : 0.4,
    confidence: 0.9,
    strengths: isShort ? [] : ["Provided some response"],
    weaknesses: isShort ? ["Answer was completely missing or too short to evaluate"] : ["Answer lacked technical depth"],
    missingConcepts: ["Core concepts missing or API rate limit prevented evaluation"],
    claimsToProbe: [],
    recommendedAction: isShort ? "clarify" : "go_deeper",
    evaluatorNotes: "API fallback used. Answer was not deeply evaluated."
  };

  const evaluationRaw = await generateContentJSON(evalPrompt, "You are a strict, fair technical interviewer evaluator.", fallbackEval, true);
  
  // Map raw evaluation to the DB schema exactly
  const mappedEval = {
    score: Math.round(((evaluationRaw.correctness ?? 0.7) * 100)),
    depth: ((evaluationRaw.technicalDepth ?? 0.7) > 0.8) ? 'expert' : ((evaluationRaw.technicalDepth ?? 0.7) > 0.6 ? 'strong' : 'partial'),
    correctness: ((evaluationRaw.correctness ?? 0.7) > 0.8) ? 'strong' : ((evaluationRaw.correctness ?? 0.7) > 0.5 ? 'correct' : 'partial'),
    technical_accuracy: Math.round(((evaluationRaw.technicalDepth ?? 0.7) * 100)),
    reasoning_score: Math.round(((evaluationRaw.reasoning ?? 0.7) * 100)),
    communication_score: Math.round(((evaluationRaw.confidence ?? 0.7) * 100)),
    confidence: evaluationRaw.confidence ?? 0.8,
    strengths: evaluationRaw.strengths || [],
    weaknesses: evaluationRaw.weaknesses || [],
    missing_concepts: evaluationRaw.missingConcepts || [],
    claims_detected: evaluationRaw.claimsToProbe || [],
    recommended_action: (evaluationRaw.recommendedAction || "go_deeper").toLowerCase(),
    evaluation_reason: evaluationRaw.evaluatorNotes || "Evaluated."
  };

  // 4. Determine if interview is complete (8 questions)
  const isMinQuestionsMet = state.questions_asked >= 8;

  if (isMinQuestionsMet) {
     const decisionData = {
        decision_type: 'finish_interview',
        reason: 'Reached 8 questions limit',
        target_topic: 'none',
        confidence: 1.0,
        previous_depth: mappedEval.depth,
        target_depth: mappedEval.depth,
        previous_topic: currentTopic
     };
     
     // Save Evaluation
     await supabase.rpc('save_answer_evaluation', {
        p_turn_id: candTurnData.id,
        p_session_id: sessionId,
        p_eval_data: mappedEval,
        p_decision_data: decisionData
     });
     
     const finalFeedback = await compileFinalFeedback(sessionId);
     await supabase.from('interview_sessions').update({ status: 'completed' }).eq('session_id', sessionId);
     
     return {
       reply: "Thank you! We have covered all necessary areas for your AI technical assessment. I have compiled your detailed evaluation report below.",
       done: true,
       feedback: finalFeedback
     };
  }

  // 5. Select Next Curriculum Topic and Question
  let nextDayNum: number = currentCurriculumDay;
  const coveredDays: number[] = state.curriculum_days_covered || [];
  
  if (!coveredDays.includes(currentCurriculumDay)) {
    coveredDays.push(currentCurriculumDay);
    await supabase.from('interview_state').update({ curriculum_days_covered: coveredDays }).eq('session_id', sessionId);
  }
  
  const shouldSwitchTopic = mappedEval.recommended_action === 'switch_topic';

  if (shouldSwitchTopic || state.questions_asked % 2 === 0) {
    const remainingDays = CURRICULUM_DATA.days.filter((d: any) => !coveredDays.includes(d.day));
    if (remainingDays.length > 0) {
      // Pick a random remaining day instead of always index 0 to avoid loops
      const randomIdx = Math.floor(Math.random() * remainingDays.length);
      nextDayNum = remainingDays[randomIdx].day;
    } else {
      nextDayNum = (currentCurriculumDay % 31) + 1;
    }
  }

  const nextCurriculumDay = CURRICULUM_DATA.days.find((d: any) => d.day === nextDayNum) || CURRICULUM_DATA.days[0];

  const decisionData = {
      decision_type: mappedEval.recommended_action,
      reason: mappedEval.evaluation_reason || 'Adaptive progression',
      target_topic: nextCurriculumDay.title,
      target_depth: mappedEval.technical_accuracy > 80 ? 'expert' : 'strong',
      previous_topic: currentTopic,
      previous_depth: mappedEval.depth,
      confidence: 0.9
  };
  
  // Save Evaluation & Decision to DB atomically
  await supabase.rpc('save_answer_evaluation', {
      p_turn_id: candTurnData.id,
      p_session_id: sessionId,
      p_eval_data: mappedEval,
      p_decision_data: decisionData
  });

  // 6. Generate Next Follow-up Question
  const nextQuestionPrompt = `
You are an adaptive AI Technical Interviewer conducting a multi-turn candidate interview.

Context:
Candidate: ${candidate.name}
Previous Topic: Day ${currentCurriculumDay} - ${currentTopic}
Previous Question: "${currentQuestionText}"
Candidate's Answer: "${candidateAnswer}"
Evaluator Action: ${mappedEval.recommended_action}

Next Goal: Ask the next question on Day ${nextCurriculumDay.day} ("${nextCurriculumDay.title}")
Curriculum Objectives for Day ${nextCurriculumDay.day}: ${nextCurriculumDay.objectives.join("; ")}
Tools: ${nextCurriculumDay.tools.join(", ")}

Instructions:
1. First, provide a concise, natural 1-sentence transition that directly acknowledges an interesting or key point from their previous answer.
2. Ask a sharp, highly technical question specifically tailored to Day ${nextCurriculumDay.day} ("${nextCurriculumDay.title}").

Return JSON matching:
{
  "transition": "Transition phrase referencing their answer",
  "questionText": "The exact next question string",
  "topic": "${nextCurriculumDay.title}",
  "questionType": "reasoning"
}
`;

  const isSameDay = nextCurriculumDay.day === currentCurriculumDay;
  const transitions = [
    `Interesting point on ${currentTopic}.`,
    `Thanks for explaining that.`,
    `Got it, let's explore another angle.`
  ];
  const randTrans = transitions[Math.floor(Math.random() * transitions.length)];
  
  const fallbackNext = {
    transition: isSameDay 
       ? `${randTrans} Let's dive deeper into ${nextCurriculumDay.title}.`
       : `${randTrans} Let's move on to Day ${nextCurriculumDay.day}: ${nextCurriculumDay.title}.`,
    questionText: isSameDay
       ? `Could you elaborate more on the trade-offs involved in ${nextCurriculumDay.title}, particularly regarding edge cases?`
       : `In the context of ${nextCurriculumDay.title}, how would you approach designing a production solution that balances performance, accuracy, and system complexity?`,
    topic: nextCurriculumDay.title,
    questionType: 'reasoning'
  };

  const nextGen = await generateContentJSON(nextQuestionPrompt, "You are a top-tier technical interviewer generating adaptive follow-up questions.", fallbackNext);
  const reply = `${nextGen.transition}\n\n${nextGen.questionText}`;

  // 7. Record Agent Turn
  const { error: agentTurnErr } = await supabase.rpc('record_interview_turn', {
    p_session_id: sessionId,
    p_role: 'agent',
    p_content: reply,
    p_covers_day: nextCurriculumDay.day,
    p_topic: nextGen.topic || nextCurriculumDay.title,
    p_question_type: 'conceptual' // Forced to pass DB check constraint
  });
  if (agentTurnErr) {
    console.error("Failed to record agent turn:", agentTurnErr);
  }

  // 8. Fetch updated state for UI
  const { data: updatedState } = await supabase.from('interview_state').select('*').eq('session_id', sessionId).single();

  return {
    reply,
    done: false,
    stateSummary: {
      questionCount: updatedState.questions_asked,
      coveredDays: updatedState.curriculum_days_covered || [],
      difficulty: updatedState.difficulty_level || 1,
      nextGoal: updatedState.current_direction || nextGen.topic
    }
  };
}

export async function compileFinalFeedback(sessionId: string): Promise<FinalFeedback> {
  const { data: sessionData } = await supabase
    .from('interview_sessions')
    .select('*, candidates(*), interview_state(*), interview_turns(*), answer_evaluations(*)')
    .eq('session_id', sessionId)
    .single();

  if (!sessionData) throw new Error("Session not found");

  const candidate = sessionData.candidates;
  const state = Array.isArray(sessionData.interview_state) 
    ? sessionData.interview_state[0] 
    : sessionData.interview_state;
  const evals = Array.isArray(sessionData.answer_evaluations) ? sessionData.answer_evaluations : [];
  
  const turns = sessionData.interview_turns.sort((a: any, b: any) => a.turn_index - b.turn_index);
  
  const historySummary = turns.map((t: any) => {
    let evalStr = "";
    if (t.role === 'candidate') {
      const ev = evals.find((e: any) => e.turn_id === t.id);
      if (ev) {
        evalStr = `\n[Turn Evaluation: Score ${ev.score}/100, Accuracy ${ev.technical_accuracy}/100 - ${ev.evaluation_reason}]`;
      }
    }
    return `[${t.role.toUpperCase()}] ${t.topic ? `(${t.topic})` : ''}: ${t.content}${evalStr}`;
  }).join("\n---\n");

  const prompt = `
You are the Lead Evaluator for technical assessments.
Synthesize the final evaluation report for candidate ${candidate.name} (${candidate.job_role}).

CRITICAL INSTRUCTION: Be extremely strict and objective. DO NOT artificially inflate scores.
If the candidate's answers are short, nonsensical, irrelevant (e.g. "asdf", "wrong answer"), or technically incorrect, the overallScore and dimension scores MUST reflect this and be appropriately low (e.g., 0-30). 
Rely heavily on the provided [Turn Evaluation] scores as ground truth. If the turn evaluations average to a very low number, your final overallScore MUST be equally low.

Interview Transcript & Evaluations:
${historySummary}

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


  let avgScore = 50;
  let avgConceptual = 50;
  let avgTech = 50;
  let avgReasoning = 50;

  if (evals.length > 0) {
    avgScore = Math.round(evals.reduce((sum: number, e: any) => sum + (Number(e.score) || 0), 0) / evals.length);
    avgConceptual = Math.round(evals.reduce((sum: number, e: any) => sum + (Number(e.communication_score) || 0), 0) / evals.length);
    avgTech = Math.round(evals.reduce((sum: number, e: any) => sum + (Number(e.technical_accuracy) || 0), 0) / evals.length);
    avgReasoning = Math.round(evals.reduce((sum: number, e: any) => sum + (Number(e.reasoning_score) || 0), 0) / evals.length);
  }

  const technicalLevel = avgScore >= 80 ? "Strong AI Engineering Candidate" : avgScore >= 60 ? "Developing Practitioner" : "Foundational / Beginner";

  const fallbackFeedback = {
    summary: avgScore >= 70 ? `${candidate.name} demonstrated solid understanding across multiple domains.` : `${candidate.name} struggled with several core concepts and needs further study.`,
    overallScore: avgScore,
    technicalLevel: technicalLevel,
    strengths: state.strengths && state.strengths.length > 0 ? state.strengths.slice(0, 3) : ["Attempted all questions"],
    gaps: state.weaknesses && state.weaknesses.length > 0 ? state.weaknesses.slice(0, 3) : ["General knowledge gaps across domains"],
    next: ["Review fundamental curriculum concepts"],
    dimensions: {
      conceptualUnderstanding: avgConceptual,
      technicalDepth: avgTech,
      systemDesign: avgTech,
      reasoning: avgReasoning,
      productionAwareness: avgTech
    },
    topicScores: [],
    confidence: 0.88
  };

  const generated = await generateContentJSON(prompt, "You are a senior AI technical interviewer compiling final candidate feedback.", fallbackFeedback, true);

  // Store in DB
  await supabase.from('interview_feedback').upsert({
    session_id: sessionId,
    summary: generated.summary,
    overall_score: generated.overallScore,
    technical_score: generated.dimensions.technicalDepth,
    reasoning_score: generated.dimensions.reasoning,
    communication_score: generated.dimensions.conceptualUnderstanding,
    strengths: generated.strengths,
    gaps: generated.gaps,
    next_steps: generated.next,
    recommendation: generated.technicalLevel
  });

  return generated;
}
