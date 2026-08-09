import React, { useState } from 'react';
import { Menu, X, Users, MessageSquare, Award, BookOpen, ArrowLeft } from 'lucide-react';
import { Candidate } from '../types/interview';

interface NavbarProps {
  activeTab: 'candidates' | 'rules' | 'interview' | 'report' | 'curriculum' | 'api';
  setActiveTab: (tab: 'candidates' | 'rules' | 'interview' | 'report' | 'curriculum' | 'api') => void;
  selectedCandidate: Candidate | null;
  hasActiveSession: boolean;
  hasCompletedReport: boolean;
  previousTab?: 'candidates' | 'rules' | 'interview' | 'report' | 'curriculum' | 'api';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedCandidate,
  hasActiveSession,
  hasCompletedReport,
  previousTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleTabClick = (tab: 'candidates' | 'rules' | 'interview' | 'report' | 'curriculum' | 'api') => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  return (
    <>
      {/* Sticky Top Header */}
      <header id="navbar-header" className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Hamburger Button + AI Branding */}
            <div className="flex items-center space-x-3">
              <button
                id="hamburger-menu-btn"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-slate-300 cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <div
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => handleTabClick('candidates')}
              >
                <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                  AI
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-lg sm:text-[20px] tracking-tight">
                      Interview Agent
                    </span>
                    {selectedCandidate && (activeTab === 'interview' || activeTab === 'rules') && (
                      <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{selectedCandidate.member.name}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Back button if in curriculum or rules view */}
            {(activeTab === 'curriculum' || activeTab === 'rules') && (
              <button
                id="btn-navbar-back"
                onClick={() => setActiveTab(previousTab && previousTab !== activeTab ? previousTab : 'candidates')}
                className="flex items-center space-x-1.5 text-slate-700 hover:text-slate-900 font-semibold text-xs sm:text-sm py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 shadow-xs bg-white shrink-0"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>Back</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Vertical Left Sidebar Drawer */}
      <aside
        id="sidebar-drawer"
        className={`fixed top-0 left-0 z-50 h-full w-80 bg-white shadow-2xl border-r border-slate-200 p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Header & Close Inside Drawer */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => handleTabClick('candidates')}
            >
              <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                AI
              </div>
              <span className="font-bold text-slate-900 text-[20px] tracking-tight">
                Interview Agent
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="h-px bg-slate-200/80" />

          {/* Vertical Navigation Menu */}
          <nav id="sidebar-navigation" className="flex flex-col space-y-2">
            <button
              id="tab-btn-candidates"
              onClick={() => handleTabClick('candidates')}
              className={`flex items-center space-x-3 px-4 py-3 text-base sm:text-lg font-semibold rounded-xl transition-colors text-left w-full ${
                activeTab === 'candidates'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-sky-700'
              }`}
            >
              <Users className={`w-5 h-5 shrink-0 ${activeTab === 'candidates' ? 'text-sky-600' : ''}`} />
              <span>Candidates</span>
            </button>

            <button
              id="tab-btn-interview"
              onClick={() => handleTabClick('interview')}
              className={`flex items-center justify-between px-4 py-3 text-base sm:text-lg font-semibold rounded-xl transition-colors text-left w-full ${
                activeTab === 'interview'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-sky-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className={`w-5 h-5 shrink-0 ${activeTab === 'interview' ? 'text-sky-600' : ''}`} />
                <span>Interview</span>
              </div>
              {hasActiveSession && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            {hasCompletedReport && (
              <button
                id="tab-btn-report"
                onClick={() => handleTabClick('report')}
                className={`flex items-center space-x-3 px-4 py-3 text-base sm:text-lg font-semibold rounded-xl transition-colors text-left w-full ${
                  activeTab === 'report'
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-sky-700'
                }`}
              >
                <Award className={`w-5 h-5 shrink-0 ${activeTab === 'report' ? 'text-sky-600' : ''}`} />
                <span>Report</span>
              </button>
            )}

            <button
              id="tab-btn-curriculum"
              onClick={() => handleTabClick('curriculum')}
              className={`flex items-center space-x-3 px-4 py-3 text-base sm:text-lg font-semibold rounded-xl transition-colors text-left w-full ${
                activeTab === 'curriculum'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-sky-700'
              }`}
            >
              <BookOpen className={`w-5 h-5 shrink-0 ${activeTab === 'curriculum' ? 'text-sky-600' : ''}`} />
              <span>Curriculum</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
          Interview Agent • Cohort 31
        </div>
      </aside>
    </>
  );
};

