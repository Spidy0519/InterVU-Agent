export interface Member {
  id: string;
  name: string;
  email?: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
}

export interface Mission {
  day: number;
  title: string;
  passed?: boolean;
  attempts?: number;
  skipped?: boolean;
}

export interface Signals {
  commitDays: number;
  missionsCompleted: number;
  missionsFirstTry: number;
}

export interface Candidate {
  member: Member;
  missions: Mission[];
  signals: Signals;
}

export interface CurriculumDay {
  day: number;
  title: string;
  type: string;
  tools: string[];
  objectives: string[];
}

export interface CurriculumModule {
  n: number;
  title: string;
  days: number[];
}

export interface CurriculumCohort {
  cohort: string;
  modules: CurriculumModule[];
  days: CurriculumDay[];
}

export type QuestionType =
  | 'conceptual'
  | 'reasoning'
  | 'architecture'
  | 'tradeoff'
  | 'debugging'
  | 'scenario'
  | 'deep_dive'
  | 'challenge';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type FollowUpAction =
  | 'DEEPEN'
  | 'CLARIFY'
  | 'CHALLENGE'
  | 'SWITCH_TOPIC'
  | 'REVISIT_WEAKNESS'
  | 'INCREASE_DIFFICULTY'
  | 'DECREASE_DIFFICULTY'
  | 'SCENARIO'
  | 'DEBUG'
  | 'FINISH';

export interface Question {
  id: string;
  curriculumDay: number;
  topic: string;
  objective: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  text: string;
  askedAt: string;
}

export interface AnswerEvaluation {
  questionId: string;
  candidateAnswer: string;
  correctness: number; // 0 to 1
  completeness: number; // 0 to 1
  technicalDepth: number; // 0 to 1
  reasoning: number; // 0 to 1
  confidence: number; // 0 to 1
  strengths: string[];
  weaknesses: string[];
  missingConcepts: string[];
  claimsToProbe: string[];
  recommendedAction: FollowUpAction;
  evaluatorNotes: string;
}

export interface TopicAssessed {
  topic: string;
  day: number;
  score: number; // 0 to 100
  confidence: number;
  depth: 'shallow' | 'moderate' | 'strong' | 'expert';
  notes: string;
}

export interface InterviewStrategy {
  targetDays: number[];
  priorityTopics: string[];
  difficulty: QuestionDifficulty;
  style: string;
  focusAreas: string[];
}

export interface InterviewState {
  sessionId: string;
  candidate: Candidate;
  status: 'in_progress' | 'completed';
  questionCount: number;
  minimumQuestions: number;
  coveredDays: number[];
  topicsAssessed: TopicAssessed[];
  strengths: string[];
  weaknesses: string[];
  claimsToProbe: string[];
  difficulty: QuestionDifficulty;
  lastQuestionType?: QuestionType;
  nextQuestionGoal?: string;
  conversationSummary: string;
  strategy: InterviewStrategy;
  history: Array<{
    question: Question;
    answer?: string;
    evaluation?: AnswerEvaluation;
  }>;
  startedAt: string;
  updatedAt: string;
  finalFeedback?: FinalFeedback;
}

export interface FinalFeedback {
  summary: string;
  overallScore: number;
  technicalLevel: string;
  strengths: string[];
  gaps: string[];
  next: string[];
  dimensions: {
    conceptualUnderstanding: number;
    technicalDepth: number;
    systemDesign: number;
    reasoning: number;
    productionAwareness: number;
  };
  topicScores: TopicAssessed[];
  confidence: number;
}

// API Payloads
export interface InterviewStartRequest {
  sessionId: string;
  candidate: Candidate;
}

export interface InterviewTurnRequest {
  sessionId: string;
  message: string;
}

export type InterviewApiRequest = InterviewStartRequest | InterviewTurnRequest;

export interface InterviewApiResponse {
  reply: string;
  done: boolean;
  feedback?: {
    summary: string;
    strengths: string[];
    gaps: string[];
    next: string[];
  };
  // Extended fields for rich app UI visualization
  sessionId?: string;
  stateSummary?: {
    questionCount: number;
    coveredDays: number[];
    currentTopic?: string;
    currentDay?: number;
    difficulty: QuestionDifficulty;
    nextGoal?: string;
  };
}
