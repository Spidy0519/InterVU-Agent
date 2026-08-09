import React, { useState, useRef, useEffect } from 'react';
import { InterviewState } from '../types/interview';
import {
  Send,
  HelpCircle,
  ArrowLeft,
  Brain,
  RotateCcw,
  Award,
  Clock,
  Timer,
  AlertTriangle,
  Bot,
  User,
  CheckCheck
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

        </div>

        <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto bg-white">
          {session.history.map((turn, index) => (
            <div key={turn.question.id || index} id={`transcript-turn-${index}`} className="space-y-6">
              {/* Interviewer Question Box */}
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex-1 max-w-[85%] bg-[#F8F9FF] p-4 rounded-2xl rounded-tl-sm border border-indigo-50/60 shadow-xs space-y-2">
                  <div className="flex items-center space-x-2 text-[12px] mb-1">
                    <span className="font-bold text-slate-900">AI Interviewer</span>
                    <span className="text-slate-400">10:15 AM</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-[10px]">
                      Day {turn.question.curriculumDay}: {turn.question.topic}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                      {turn.question.type}
                    </span>
                    <span className="ml-auto text-indigo-700 font-bold text-[10px] bg-white px-2 py-0.5 rounded-full border border-indigo-50 shadow-xs">
                      Q{index + 1} of 8
                    </span>
                  </div>
                  <p className="text-[14px] text-slate-900 leading-relaxed font-medium whitespace-pre-line">
                    {turn.question.text}
                  </p>
                </div>
              </div>

              {/* Candidate Response Box */}
              {turn.answer && (
                <div className="flex items-start space-x-3 justify-end mt-4">
                  <div className="flex-1 max-w-[85%] bg-[#F0F6FF] p-4 rounded-2xl rounded-tr-sm border border-sky-100/60 shadow-xs space-y-1">
                    <div className="flex items-center justify-end space-x-2 text-[11px] mb-1">
                       <span className="text-slate-400">10:16 AM</span>
                    </div>
                    <p className="text-[14px] text-slate-800 leading-relaxed whitespace-pre-line text-left font-medium">
                      {turn.answer}
                    </p>
                    <div className="flex items-center justify-end text-[10px] text-slate-400 mt-2 space-x-1">
                      <span>Delivered</span>
                      <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#3B82F6] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-0.5">
                    <User className="w-5 h-5" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Thinking / Processing Spinner Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-3 mt-4">
               <div className="w-9 h-9 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2 text-[12px] mb-1">
                    <span className="font-bold text-slate-900">AI Interviewer</span>
                    <span className="text-slate-400">10:16 AM</span>
                  </div>
                  <div className="bg-[#F8F9FF] px-4 py-3.5 rounded-2xl rounded-tl-sm border border-indigo-50/60 inline-flex items-center space-x-1.5 shadow-xs">
                    <div className="w-1.5 h-1.5 bg-[#4F46E5]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#4F46E5]/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#4F46E5]/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Answer Input Controls */}
      {session.status === 'in_progress' && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-200 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div id="answer-input-container" className="bg-slate-50 rounded-xl p-2 border border-slate-200">
              <form onSubmit={handleSubmit} className="space-y-0">
                <textarea
                  id="candidate-answer-textarea"
                  rows={2}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder="Type your answer here..."
                  className="w-full p-2 text-[14px] bg-transparent border-0 focus:ring-0 resize-none min-h-[50px] text-slate-900 placeholder:text-slate-400 outline-hidden"
                />

                <div className="flex items-center justify-end pt-2">
                  <div className="flex items-center space-x-3">
                     <div className="flex items-center space-x-2">
                       {isQuestionTimeExpired && (
                         <button
                           type="button"
                           onClick={handleAutoSubmit}
                           className="mr-2 px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                         >
                           Auto-Submit
                         </button>
                       )}
                       <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                       <button
                        id="btn-submit-response"
                        type="submit"
                        disabled={!answerText.trim() || isLoading}
                        className="px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all shadow-xs cursor-pointer"
                      >
                        <span>Submit Response</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                     </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

