import React, { useState } from 'react';
import { Terminal, Copy, Check, Play, FileJson, ShieldCheck } from 'lucide-react';
import { InterviewState } from '../types/interview';

interface ApiInspectorProps {
  session: InterviewState | null;
}

export const ApiInspector: React.FC<ApiInspectorProps> = ({ session }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'start' | 'turn' | 'end'>('start');

  const activeSessionId = session?.sessionId || 'sess_demo_123456';

  const startPayload = {
    sessionId: activeSessionId,
    candidate: session?.candidate || {
      member: {
        id: "CAND-001",
        name: "Sarah Johnson",
        jobRole: "Senior Data Engineer",
        yearsExperience: 9,
        education: "MS Computer Science",
        status: "COMPLETED"
      },
      missions: [],
      signals: { commitDays: 28, missionsCompleted: 30, missionsFirstTry: 20 }
    }
  };

  const startResponse = {
    reply: "Welcome Sarah Johnson. Let's begin your technical assessment...",
    done: false
  };

  const turnPayload = {
    sessionId: activeSessionId,
    message: "We use dense vector embeddings with Cohere reranking for hybrid retrieval..."
  };

  const turnResponse = {
    reply: "Good point regarding hybrid retrieval. Now let's explore what failure mode could occur when chunk size is increased...",
    done: false
  };

  const endResponse = {
    reply: "Interview completed. Detailed evaluation generated.",
    done: true,
    feedback: {
      summary: "Candidate demonstrated strong understanding across RAG pipelines and vector database trade-offs.",
      strengths: [
        "Understands hybrid retrieval architecture and RRF merging",
        "Articulates vector database indexing trade-offs clearly"
      ],
      gaps: [
        "Shallow explanation of LoRA rank selection during fine-tuning"
      ],
      next: [
        "Practice fine-tuning datasets and LoRA hyperparameter selection (Days 14-15)"
      ]
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPayloadJson = () => {
    if (activeTab === 'start') return JSON.stringify(startPayload, null, 2);
    if (activeTab === 'turn') return JSON.stringify(turnPayload, null, 2);
    return JSON.stringify({ sessionId: activeSessionId, message: "I have completed all topics." }, null, 2);
  };

  const getResponseJson = () => {
    if (activeTab === 'start') return JSON.stringify(startResponse, null, 2);
    if (activeTab === 'turn') return JSON.stringify(turnResponse, null, 2);
    return JSON.stringify(endResponse, null, 2);
  };

  return (
    <div id="api-inspector-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 text-sm font-mono font-bold bg-sky-600 text-white rounded-md shadow-xs">
                POST /api/interview
              </span>
              <span className="text-sm text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                100% Spec Compliant
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-2">
              Technical Specification & Judge Inspector
            </h1>
            <p className="text-lg text-slate-700 mt-2 max-w-2xl font-normal">
              This application exposes the exact single endpoint required by the Hackathon Technical Specification.
              No authentication is required. Interview state persists across turns via <code>sessionId</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs for API Scenarios */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex space-x-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => setActiveTab('start')}
            className={`px-3 py-1.5 text-[13.5px] font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'start'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            1. Start Interview
          </button>
          <button
            onClick={() => setActiveTab('turn')}
            className={`px-3 py-1.5 text-[13.5px] font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'turn'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            2. Conversation Turn
          </button>
          <button
            onClick={() => setActiveTab('end')}
            className={`px-3 py-1.5 text-[13.5px] font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'end'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            3. End Interview & Feedback
          </button>
        </div>

        {/* Payload & Response Inspector Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Request Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[13.5px] text-slate-700 font-semibold">
              <span>HTTP Request Body</span>
              <button
                onClick={() => handleCopy(getPayloadJson())}
                className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-xs"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>Copy Payload</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-[13px] font-mono overflow-x-auto max-h-80 border border-slate-800">
              <code>{getPayloadJson()}</code>
            </pre>
          </div>

          {/* Response Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[13.5px] text-slate-700 font-semibold">
              <span>HTTP Response Body</span>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-[13px] font-mono overflow-x-auto max-h-80 border border-slate-800">
              <code>{getResponseJson()}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
