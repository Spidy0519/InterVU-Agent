import React from 'react';
import { Candidate } from '../types/interview';
import { ArrowLeft, ShieldAlert, AlertTriangle, Play, Clock, Timer, HelpCircle } from 'lucide-react';

interface InterviewRulesProps {
  candidate: Candidate;
  onStartInterview: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const InterviewRules: React.FC<InterviewRulesProps> = ({
  candidate,
  onStartInterview,
  onBack,
  isLoading = false,
}) => {
  return (
    <div id="interview-rules-container" className="w-full max-w-5xl mx-auto flex flex-col justify-between space-y-4 py-1 sm:py-2">
      {/* Top Header: Navigation & Timing Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
        <button
          id="btn-back-to-candidates-rules"
          onClick={onBack}
          className="flex items-center space-x-1.5 text-slate-700 hover:text-slate-900 font-semibold text-xs py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 shadow-xs bg-white shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          <span>Back to Candidate Roster</span>
        </button>

        {/* Timing Overview Badges */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs flex items-center space-x-1.5">
            <Timer className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="text-slate-500 font-medium">Per Question:</span>
            <span className="text-slate-900 font-bold">5 Mins</span>
          </div>

          <div className="bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs flex items-center space-x-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="text-slate-500 font-medium">Total:</span>
            <span className="text-slate-900 font-bold">8 Questions</span>
          </div>

          <div className="bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-slate-500 font-medium">Session Duration:</span>
            <span className="text-slate-900 font-bold">40 Mins</span>
          </div>
        </div>
      </div>

      {/* Candidate Details Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1 border-b border-slate-100">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            {candidate.member.name.charAt(0)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {candidate.member.name}
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Candidate ID: <code className="font-mono text-slate-700">{candidate.member.id}</code> • {candidate.member.yearsExperience} yrs experience
            </p>
          </div>
        </div>
      </div>

      {/* Rules & Regulations Section */}
      <div className="space-y-3 py-1">
        <div className="flex items-center space-x-2 font-bold text-slate-900 text-base border-b border-slate-200/80 pb-2">
          <ShieldAlert className="w-5 h-5 text-sky-600 shrink-0" />
          <span>Rules & Regulations</span>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs sm:text-sm text-slate-700">
          <li className="flex items-start space-x-2">
            <span className="text-sky-500 font-bold select-none">•</span>
            <span><strong>5 Mins/Question:</strong> You have a 5-minute timer per question.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-sky-500 font-bold select-none">•</span>
            <span><strong>40 Mins Total:</strong> Complete all 8 questions within 40 minutes total.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-sky-500 font-bold select-none">•</span>
            <span>Stay on the interview page throughout the session.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-sky-500 font-bold select-none">•</span>
            <span>Do not leave or close the interview window.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-sky-500 font-bold select-none">•</span>
            <span>Do not switch tabs or external applications.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-sky-500 font-bold select-none">•</span>
            <span>Do not use external AI assistants or search engines.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-sky-500 font-bold select-none">•</span>
            <span>Do not copy or paste answers from external sources.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-sky-500 font-bold select-none">•</span>
            <span>Answer each question independently & honestly.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-sky-500 font-bold select-none">•</span>
            <span>Do not refresh the browser page during interview.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-sky-500 font-bold select-none">•</span>
            <span>Submit response before the 5-minute timer expires.</span>
          </li>
        </ul>
      </div>

      {/* Warning Section */}
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3 sm:p-3.5 text-amber-900 flex items-start space-x-3 text-xs sm:text-sm shadow-xs">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-snug">
          <strong className="font-bold text-amber-950 mr-1">Important Notice:</strong>
          <span>
            Please stay on this interview page. Switching tabs, leaving the page, or using external assistance is strictly prohibited during the interview.
          </span>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-3 flex items-center justify-between border-t border-slate-200/80">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors bg-white cursor-pointer shadow-xs"
        >
          Cancel
        </button>
        <button
          id="btn-confirm-start-interview"
          type="button"
          onClick={onStartInterview}
          disabled={isLoading}
          className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <span>Initializing Interview...</span>
          ) : (
            <>
              <span>Start Interview</span>
              <Play className="w-4 h-4 fill-current shrink-0" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};


