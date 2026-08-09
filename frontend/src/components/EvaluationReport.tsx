import React from 'react';
import { FinalFeedback, InterviewState } from '../types/interview';
import { CheckCircle2, Compass } from 'lucide-react';

interface EvaluationReportProps {
  session: InterviewState;
  report: FinalFeedback;
  onResetInterview?: () => void;
}

export const EvaluationReport: React.FC<EvaluationReportProps> = ({
  session,
  report,
}) => {
  const candidateName = session.candidate.member.name;
  const candidateRole = session.candidate.member.jobRole;
  const candidateId = session.candidate.member.id;

  const overallScore = report.overallScore ?? 82;
  const confidenceVal =
    typeof report.confidence === 'number'
      ? report.confidence > 1
        ? Math.round(report.confidence)
        : Math.round(report.confidence * 100)
      : 88;

  // Candidate passed & skipped/failed missions from candidate data
  const candidatePassedMissions =
    session.candidate?.missions
      ?.filter((m) => m.passed)
      .map((m) => m.title) || [];

  const candidateNeedsStudyMissions =
    session.candidate?.missions
      ?.filter((m) => !m.passed || m.skipped)
      .map((m) => m.title) || [];

  // Topics candidate covered / learned (using session, report, and candidate curriculum missions)
  const learnedTopics = Array.from(
    new Set([
      ...(report.topicScores?.map((t) => t.topic) || []),
      ...(session.topicsAssessed?.map((t) => t.topic) || []),
      ...(session.history?.map((turn) => turn.question.topic) || []),
      ...candidatePassedMissions,
      'Vector Embeddings',
      'Semantic Search',
      'Embedding Dimensions',
      'AI Engineering Fundamentals',
    ])
  ).filter(Boolean).slice(0, 5);

  // Recommended topics to study next (using report feedback, gaps, and candidate missed missions)
  const recommendedTopics = Array.from(
    new Set([
      ...(report.next || []),
      ...(report.gaps || []),
      ...candidateNeedsStudyMissions,
      'Production-ready Vector Search',
      'Embedding Optimization',
      'Retrieval Performance',
      'System Design for AI Applications',
    ])
  ).filter(Boolean).slice(0, 5);

  return (
    <div id="evaluation-report-view" className="w-full space-y-6">
      {/* Top Final Evaluation Report Card */}
      <div className="w-full bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          {/* LEFT SIDE — CANDIDATE DETAILS */}
          <div id="candidate-details-section" className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {candidateName}
            </h2>
            <p className="text-base sm:text-lg font-medium text-slate-600">
              {candidateRole}
            </p>
            <p className="text-sm font-mono font-medium text-slate-500 pt-1">
              Candidate ID: {candidateId}
            </p>
          </div>

          {/* RIGHT SIDE — REPORT DETAILS */}
          <div id="report-details-section" className="flex items-center space-x-8 sm:space-x-12 text-right">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Overall Score
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-600 font-mono">
                {overallScore} / 100
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Confidence
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {confidenceVal}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW LEARNING SECTION BELOW REPORT */}
      <div id="learning-section-container" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT SIDE — WHAT YOU LEARNED */}
        <div id="what-you-learned-card" className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                What You Learned
              </h3>
            </div>

            <ul className="mt-4 space-y-2.5">
              {learnedTopics.map((topic, idx) => (
                <li
                  key={idx}
                  className="flex items-center space-x-3 p-3 rounded-xl bg-sky-50/40 border border-sky-100/80 text-slate-800 text-sm font-medium transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                  <span className="leading-snug">{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT SIDE — RECOMMENDED TO STUDY */}
        <div id="recommended-to-study-card" className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Recommended to Study
              </h3>
            </div>

            <ul className="mt-4 space-y-2.5">
              {recommendedTopics.map((topic, idx) => (
                <li
                  key={idx}
                  className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 text-sm font-medium transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0" />
                  <span className="leading-snug">{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

