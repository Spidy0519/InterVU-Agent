import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { CandidateSelector } from './components/CandidateSelector';
import { InterviewRules } from './components/InterviewRules';
import { InterviewSession } from './components/InterviewSession';
import { EvaluationReport } from './components/EvaluationReport';
import { CurriculumMap } from './components/CurriculumMap';
import { ApiInspector } from './components/ApiInspector';
import { Candidate, InterviewState } from './types/interview';
import { generateSessionId } from './lib/utils';
import CANDIDATES_DATA_RAW from '../../data/candidates.json';

const CANDIDATES_DATA = CANDIDATES_DATA_RAW.candidates as Candidate[];

export default function App() {
  const [candidates] = useState<Candidate[]>(CANDIDATES_DATA);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(CANDIDATES_DATA[0] || null);
  const [activeTab, setActiveTabState] = useState<'candidates' | 'rules' | 'interview' | 'report' | 'curriculum' | 'api'>('candidates');
  const [previousTab, setPreviousTab] = useState<'candidates' | 'rules' | 'interview' | 'report' | 'curriculum' | 'api'>('candidates');

  const setActiveTab = (tab: 'candidates' | 'rules' | 'interview' | 'report' | 'curriculum' | 'api') => {
    setActiveTabState((prev) => {
      if (prev !== tab) {
        setPreviousTab(prev);
      }
      return tab;
    });
  };

  const [session, setSession] = useState<InterviewState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);



  // Handle starting a new interview session for a candidate
  const handleStartInterview = async (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsLoading(true);
    setErrorMessage(null);

    const newSessionId = generateSessionId();

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: newSessionId,
          candidate,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      await response.json();

      // Fetch full initialized session object from backend
      const sessionRes = await fetch(`/api/session/${newSessionId}`);
      if (sessionRes.ok) {
        const fullSession = await sessionRes.json();
        setSession(fullSession);
      }

      // Enter full screen for proctored-like experience
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn(`Could not enable fullscreen mode: ${err.message}`);
        });
      }

      setActiveTab('interview');
    } catch (err: any) {
      console.error('Failed to start interview session:', err);
      setErrorMessage(err?.message || 'Failed to initialize interview');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submitting a candidate's answer
  const handleSendMessage = async (message: string) => {
    if (!session) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Turn failed with status ${response.status}`);
      }

      const data = await response.json();

      // Refresh full session state
      const sessionRes = await fetch(`/api/session/${session.sessionId}`);
      if (sessionRes.ok) {
        const updatedSession = await sessionRes.json();
        setSession(updatedSession);

        if (data.done && updatedSession.finalFeedback) {
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch((err) => console.warn(err));
          }
          setActiveTab('report');
        }
      }
    } catch (err: any) {
      console.error('Error submitting answer:', err);
      setErrorMessage(err?.message || 'Failed to submit response');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle force finishing the interview session
  const handleFinishInterview = async () => {
    if (!session) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/interview/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete interview session');
      }

      const data = await response.json();
      if (data.session) {
        setSession(data.session);
      }
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch((err) => console.warn(err));
      }
      setActiveTab('report');
    } catch (err: any) {
      console.error('Error finishing interview:', err);
      setErrorMessage(err?.message || 'Failed to generate final report');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset/Restart interview
  const handleResetInterview = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch((err) => console.warn(err));
    }
    setSession(null);
    setActiveTab('candidates');
  };

  return (
    <div id="app-root-container" className="m-0 p-0 min-h-screen w-full bg-slate-50 text-slate-900 font-sans antialiased flex flex-col selection:bg-sky-100">
      {/* Top Navbar & Sliding Drawer */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCandidate={selectedCandidate}
        hasActiveSession={!!session && session.status === 'in_progress'}
        hasCompletedReport={!!session && !!session.finalFeedback}
        previousTab={previousTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <main id="app-main-content" className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
          {/* Global Error Alert Banner */}
          {errorMessage && (
            <div id="app-error-banner" className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[13.5px] flex items-center justify-between">
              <div>
                <strong>Error:</strong> {errorMessage}
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-600 font-semibold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Views Routing */}
          {activeTab === 'candidates' && (
            <CandidateSelector
              candidates={candidates}
              onSelectCandidate={(candidate) => {
                setSelectedCandidate(candidate);
                setActiveTab('rules');
              }}
              selectedCandidateId={selectedCandidate?.member.id}
            />
          )}

          {activeTab === 'rules' && (
            <>
              {selectedCandidate ? (
                <InterviewRules
                  candidate={selectedCandidate}
                  onStartInterview={() => handleStartInterview(selectedCandidate)}
                  onBack={() => setActiveTab('candidates')}
                  isLoading={isLoading}
                />
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                  <h3 className="text-[20px] font-semibold text-slate-900">
                    No Candidate Selected
                  </h3>
                  <p className="text-[13.5px] text-slate-500 max-w-md mx-auto">
                    Please select a candidate profile from the roster to review interview rules.
                  </p>
                  <button
                    onClick={() => setActiveTab('candidates')}
                    className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 transition-colors shadow-xs"
                  >
                    Go to Candidate Roster
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'interview' && (
            <>
              {session ? (
                <InterviewSession
                  session={session}
                  onSendMessage={handleSendMessage}
                  onFinishInterview={handleFinishInterview}
                  onResetInterview={handleResetInterview}
                  onBackToCandidates={() => setActiveTab('candidates')}
                  isLoading={isLoading}
                />
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                  <h3 className="text-[20px] font-semibold text-slate-900">
                    No Active Interview Session
                  </h3>
                  <p className="text-[13.5px] text-slate-500 max-w-md mx-auto">
                    Please select a candidate profile from the roster to start a multi-turn adaptive AI interview.
                  </p>
                  <button
                    onClick={() => setActiveTab('candidates')}
                    className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 transition-colors shadow-xs"
                  >
                    Go to Candidate Roster
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'report' && (
            <>
              {session && session.finalFeedback ? (
                <EvaluationReport
                  session={session}
                  report={session.finalFeedback}
                  onResetInterview={handleResetInterview}
                />
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                  <h3 className="text-[20px] font-semibold text-slate-900">
                    No Report Available Yet
                  </h3>
                  <p className="text-[13.5px] text-slate-500 max-w-md mx-auto">
                    Complete or finish an interview session to generate the final candidate evaluation report.
                  </p>
                  <button
                    onClick={() => setActiveTab('candidates')}
                    className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 transition-colors shadow-xs"
                  >
                    Select Candidate & Start
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'curriculum' && <CurriculumMap session={session} />}

          {activeTab === 'api' && <ApiInspector session={session} />}
        </main>

        {/* Footer */}
        <footer id="app-footer" className="mt-auto border-t border-slate-200 bg-white py-4 text-[13px] text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          </div>
        </footer>
      </div>
    </div>
  );
}
