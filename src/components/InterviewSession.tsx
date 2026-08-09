import React, { useState, useRef, useEffect } from 'react';
import { Candidate, InterviewState, QuestionDifficulty, QuestionType } from '../types/interview';
import {
  Send,
  HelpCircle,
  ArrowLeft,
  Brain,
  RotateCcw,
  Award,
  Clock,
  Timer,
  AlertTriangle
} from 'lucide-react';

interface InterviewSessionProps {
  session: InterviewState;
  onSendMessage: (message: string) => Promise<void>;
  onFinishInterview: () => Promise<void>;
  onResetInterview: () => void;
  onBackToCandidates?: () => void;
  isLoading: boolean;
}

const QUESTION_LIMIT_SECS = 5 * 60; // 5 minutes per question
const TOTAL_LIMIT_SECS = 40 * 60; // 40 minutes total session
const TOTAL_QUESTIONS_COUNT = 8; // 8 questions total

export const InterviewSession: React.FC<InterviewSessionProps> = ({
  session,
  onSendMessage,
  onFinishInterview,
  onResetInterview,
  onBackToCandidates,
  isLoading,
}) => {
  const [answerText, setAnswerText] = useState('');
  const [thinkingMessage, setThinkingMessage] = useState('Evaluating candidate response & updating interview strategy...');
  const [questionTimeLeft, setQuestionTimeLeft] = useState(QUESTION_LIMIT_SECS);
  const [totalTimeLeft, setTotalTimeLeft] = useState(TOTAL_LIMIT_SECS);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Reset question timer back to 05:00 whenever moving to a new question
  useEffect(() => {
    setQuestionTimeLeft(QUESTION_LIMIT_SECS);
  }, [session.history.length, session.questionCount]);

  // Timer countdown tick
  useEffect(() => {
    if (session.status !== 'in_progress' || isLoading) return;

    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setTotalTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [session.status, isLoading]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (session.status !== 'in_progress') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'An interview is in progress. Are you sure you want to leave?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [session.status]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.history, isLoading]);

  useEffect(() => {
    if (isLoading) {
      const messages = [
        "Analyzing technical reasoning & depth...",
        "Checking claims against curriculum objectives...",
        "Evaluating trade-off understanding...",
        "Determining adaptive follow-up route...",
        "Formulating targeted follow-up question..."
      ];
      let idx = 0;
      const interval = setInterval(() => {
        idx = (idx + 1) % messages.length;
        setThinkingMessage(messages[idx]);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() || isLoading) return;
    const text = answerText.trim();
    setAnswerText('');
    onSendMessage(text);
  };

  const handleAutoSubmit = () => {
    const text = answerText.trim() || '[Candidate response recorded at 5-minute timeout]';
    setAnswerText('');
    onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const minQuestions = session.minimumQuestions || TOTAL_QUESTIONS_COUNT;
  const isEligibleToFinish = session.questionCount >= minQuestions && session.coveredDays.length >= 4;
  const hasSubmittedAnswer = session.history.some(turn => Boolean(turn.answer && turn.answer.trim()));
  const isFinalAnswerSubmitted = session.status === 'completed' || session.history.filter(turn => Boolean(turn.answer && turn.answer.trim())).length >= TOTAL_QUESTIONS_COUNT;

  const currentQuestionIndex = session.history.length - 1;
  const currentTurn = session.history[currentQuestionIndex];

  // Timing Progress Percentages
  const questionElapsedPercent = Math.min(100, Math.max(0, ((QUESTION_LIMIT_SECS - questionTimeLeft) / QUESTION_LIMIT_SECS) * 100));
  const totalElapsedPercent = Math.min(100, Math.max(0, ((TOTAL_LIMIT_SECS - totalTimeLeft) / TOTAL_LIMIT_SECS) * 100));

  // Timer Status Colors
  const isQuestionTimeLow = questionTimeLeft <= 60; // < 1 min
  const isQuestionTimeExpired = questionTimeLeft === 0;
  const isTotalTimeExpired = totalTimeLeft === 0;

  return (
    <div id="interview-session-container" className="space-y-4">
      {/* Top Header Row: Back + Candidate Info on Left, Small Compact Timer on Top Right */}
      <div id="session-progress-card" className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-200/80">
        {/* Left Section: Back Button + Candidate Info */}
        <div className="flex items-center space-x-2.5">
          <button
            id="btn-back-to-candidates-session"
            onClick={onBackToCandidates || onResetInterview}
            className="flex items-center space-x-1 text-slate-800 hover:text-slate-900 font-semibold text-xs py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 shadow-xs bg-white shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {session.candidate.member.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                {session.candidate.member.name}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                Role: <span className="font-semibold text-slate-700">{session.candidate.member.jobRole}</span> • ID: <code className="font-mono text-slate-700">{session.sessionId}</code>
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Compact Header Stats (Questions 1/8 -> Total Time -> Question Time) */}
        <div className="flex items-center space-x-3">
          {/* Side-by-Side Compact Stats & Timers Bar */}
          <div
            id="compact-header-stats"
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm shadow-2xs font-sans font-medium"
          >
            {/* 1. Questions Counter */}
            <div className="flex items-center space-x-1.5 text-slate-700" title="Question Progress (1 of 8)">
              <HelpCircle className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="text-slate-500 font-semibold text-[11px] sm:text-xs">Questions</span>
              <span className="font-mono font-bold text-slate-900">{Math.min(session.questionCount, TOTAL_QUESTIONS_COUNT)} / {TOTAL_QUESTIONS_COUNT}</span>
            </div>

            {/* Vertical Divider */}
            <div className="h-3.5 w-px bg-slate-200 shrink-0" />

            {/* 2. Total Session Timer */}
            <div className="flex items-center space-x-1.5 text-slate-700" title="Total Session Timer (40 mins max)">
              <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="text-slate-500 font-semibold text-[11px] sm:text-xs">Total Time</span>
              <span className="font-mono font-bold text-slate-900">{formatTime(totalTimeLeft)}</span>
            </div>

            {/* Vertical Divider */}
            <div className="h-3.5 w-px bg-slate-200 shrink-0" />

            {/* 3. Question Timer */}
            <div
              className={`flex items-center space-x-1.5 ${
                isQuestionTimeExpired
                  ? 'text-rose-700 font-bold'
                  : isQuestionTimeLow
                  ? 'text-amber-700 font-bold'
                  : 'text-slate-700'
              }`}
              title="Current Question Timer (5 mins per question)"
            >
              <Timer className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="text-slate-500 font-semibold text-[11px] sm:text-xs">Question Time</span>
              <span className="font-mono font-bold text-slate-900">{formatTime(questionTimeLeft)}</span>
            </div>
          </div>

          {hasSubmittedAnswer && (
            <div className="flex items-center space-x-1.5">
              {isFinalAnswerSubmitted && (
                <button
                  id="btn-finish-interview"
                  onClick={onFinishInterview}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer ${
                    isEligibleToFinish
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                  title={isEligibleToFinish ? 'Complete interview & generate report' : 'Generate final evaluation report now'}
                >
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {isEligibleToFinish ? 'Complete & Generate Report' : 'End & Generate Report'}
                  </span>
                </button>
              )}

              <button
                id="btn-reset-session"
                onClick={onResetInterview}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                title="Restart Interview"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Warning Banners for Time Limits */}
      {isQuestionTimeExpired && session.status === 'in_progress' && (
        <div id="question-timeout-banner" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <strong className="font-bold text-rose-950">5-Minute Time Limit Expired for this question!</strong>
              <p className="text-rose-800 text-[11px]">Please submit your response to move forward.</p>
            </div>
          </div>
          <button
            onClick={handleAutoSubmit}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
          >
            Auto-Submit
          </button>
        </div>
      )}

      {isTotalTimeExpired && session.status === 'in_progress' && (
        <div id="total-timeout-banner" className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm shadow-xs">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <strong className="font-bold text-amber-950">Total 40-Minute Interview Time Limit Reached!</strong>
              <p className="text-amber-800 text-xs">You have reached the maximum allocated interview time across all 8 questions. You can finish now to compile your report.</p>
            </div>
          </div>
          <button
            onClick={onFinishInterview}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
          >
            Finish & View Report
          </button>
        </div>
      )}

      {/* Main Conversation Feed */}
      <div id="interview-transcript-feed" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center space-x-2 font-medium text-slate-800">
            <Brain className="w-4 h-4 text-sky-600" />
            <span>Interactive Technical Interview Transcript</span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <span>Adaptive Sequence</span>
            <span>•</span>
            <span className="text-sky-700 font-bold">Question {session.questionCount} of 8</span>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto bg-slate-50/30">
          {currentTurn && (
            <div key={currentTurn.question.id || currentQuestionIndex} id={`transcript-turn-${currentQuestionIndex}`} className="space-y-4">
              {/* Interviewer Question Box */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-xs">
                  AI
                </div>
                <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[13px]">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900">
                        AI Interviewer
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-medium">
                        Day {currentTurn.question.curriculumDay}: {currentTurn.question.topic}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {currentTurn.question.type}
                      </span>
                    </div>
                    <span className="text-sky-700 font-bold text-xs bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                      Q{currentQuestionIndex + 1} of 8
                    </span>
                  </div>

                  <p className="text-[17px] text-slate-900 leading-relaxed font-medium whitespace-pre-line">
                    {currentTurn.question.text}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Thinking / Processing Spinner Indicator */}
          {isLoading && (
            <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-sky-200 shadow-xs animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <p className="text-[13.5px] font-semibold text-slate-900">
                  AI Interviewer is reasoning...
                </p>
                <p className="text-[13px] text-slate-500 mt-0.5">
                  {thinkingMessage}
                </p>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Answer Input Controls */}
      {session.status === 'in_progress' && (
        <div id="answer-input-container" className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center justify-end text-xs text-slate-500 font-medium">
              <span className={`font-mono font-bold ${isQuestionTimeLow ? 'text-amber-600' : 'text-slate-600'}`}>
                Time Left for Question {session.questionCount}: {formatTime(questionTimeLeft)}
              </span>
            </div>

            <textarea
              id="candidate-answer-textarea"
              rows={4}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Enter Answer"
              className="w-full p-3.5 text-[15px] bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 placeholder:text-slate-400 resize-y min-h-[100px]"
            />

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-400 hidden sm:inline">
                Question {session.questionCount} of 8 • 5 mins allocated
              </span>

              <div className="flex items-center space-x-2">
                {isQuestionTimeExpired && (
                  <button
                    type="button"
                    onClick={handleAutoSubmit}
                    className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Auto-Submit
                  </button>
                )}

                <button
                  id="btn-submit-response"
                  type="submit"
                  disabled={!answerText.trim() || isLoading}
                  className="px-5 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all shadow-xs cursor-pointer"
                >
                  <span>Submit Response</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

