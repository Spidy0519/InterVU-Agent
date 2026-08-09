import React, { useState } from 'react';
import { Candidate } from '../types/interview';
import CURRICULUM_DATA from '../../../data/curriculum.json';
import { Search, Play, X, ChevronRight, CheckCircle } from 'lucide-react';

interface CandidateSelectorProps {
  candidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
  selectedCandidateId?: string;
}

export const CandidateSelector: React.FC<CandidateSelectorProps> = ({
  candidates,
  onSelectCandidate,
  selectedCandidateId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [activeModalCandidate, setActiveModalCandidate] = useState<Candidate | null>(null);

  const roles = Array.from(new Set(candidates.map((c) => c.member.jobRole)));

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.member.jobRole.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || c.member.jobRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div id="candidate-selector-view" className="space-y-6">
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Box */}
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="candidate-search-input"
            type="text"
            placeholder="Search candidate by name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-base bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Role Filter */}
        <select
          id="candidate-role-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-3 text-base bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
        >
          <option value="ALL">All Roles ({candidates.length})</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {/* Candidate Cards Grid */}
      <div id="candidate-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCandidates.map((candidate) => {
          const isSelected = candidate.member.id === selectedCandidateId;

          return (
            <div
              key={candidate.member.id}
              id={`candidate-card-${candidate.member.id}`}
              className={`bg-white rounded-xl p-4 border transition-all duration-200 flex flex-col justify-between hover:shadow-xs ${
                isSelected
                  ? 'border-sky-600 ring-2 ring-sky-500/20 bg-sky-50/20'
                  : 'border-slate-200 hover:border-sky-300'
              }`}
            >
              <div>
                {/* Top Info */}
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                      {candidate.member.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5 truncate">
                      {candidate.member.jobRole} • {candidate.member.yearsExperience} yrs exp
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-semibold shrink-0">
                    {candidate.member.id}
                  </span>
                </div>

                {/* Signals Bar */}
                <div className="mt-3 grid grid-cols-3 gap-1 bg-slate-50/90 p-2 rounded-lg border border-slate-200/60 text-center">
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-sky-700">
                      {candidate.signals.missionsCompleted}/31
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium leading-tight">Missions</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">
                      {candidate.signals.missionsFirstTry}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium leading-tight">1st Try Pass</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">
                      {candidate.signals.commitDays}d
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium leading-tight">Commit Days</div>
                  </div>
                </div>

                {/* Read More Section */}
                <div className="mt-2.5">
                  <button
                    id={`btn-read-more-${candidate.member.id}`}
                    onClick={() => setActiveModalCandidate(candidate)}
                    className="text-xs font-bold text-sky-600 hover:text-sky-800 underline flex items-center space-x-0.5 cursor-pointer"
                  >
                    <span>Read More</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-3.5 pt-3 border-t border-slate-100">
                <button
                  id={`btn-start-interview-${candidate.member.id}`}
                  onClick={() => onSelectCandidate(candidate)}
                  className={`w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-xs ${
                    isSelected
                      ? 'bg-sky-600 text-white hover:bg-sky-700'
                      : 'bg-white text-sky-700 border border-sky-200 hover:border-sky-400 hover:bg-sky-50'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span>
                    {isSelected ? 'Continue Interview' : 'Start AI Interview'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Modal Card */}
      {activeModalCandidate && (
        <div
          id="candidate-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity overflow-y-auto"
          onClick={() => setActiveModalCandidate(null)}
        >
          <div
            id="candidate-modal-card"
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] shadow-2xl border border-slate-200/80 flex flex-col relative my-8 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200/80 flex items-start justify-between bg-white shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {activeModalCandidate.member.name}
                </h3>
                <p className="text-sm font-semibold text-slate-600 mt-1">
                  {activeModalCandidate.member.jobRole} • {activeModalCandidate.member.yearsExperience} yrs exp
                </p>
              </div>
              <button
                id="btn-close-candidate-modal"
                onClick={() => setActiveModalCandidate(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                aria-label="Close details modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
              {/* Candidate Info Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-sm">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                    Candidate Name
                  </span>
                  <span className="font-semibold text-slate-900 text-base">
                    {activeModalCandidate.member.name}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                    Email ID
                  </span>
                  <span className="font-semibold text-slate-900">
                    {activeModalCandidate.member.email || `${activeModalCandidate.member.name.toLowerCase().replace(/\s+/g, '.')}@enterprise.ai`}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                    Role
                  </span>
                  <span className="font-semibold text-slate-900">
                    {activeModalCandidate.member.jobRole}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                    Experience
                  </span>
                  <span className="font-semibold text-slate-900">
                    {activeModalCandidate.member.yearsExperience} Years
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                    Commit Days / Current Day
                  </span>
                  <span className="font-semibold text-slate-900">
                    {activeModalCandidate.signals.commitDays} Days
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                    Total Missions Completed
                  </span>
                  <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 inline-block">
                    {activeModalCandidate.signals.missionsCompleted} / 31 Missions
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                    First Try Pass
                  </span>
                  <span className="font-semibold text-slate-900">
                    {activeModalCandidate.signals.missionsFirstTry} Missions
                  </span>
                </div>
              </div>

              {/* All Completed Missions Section */}
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-2">
                  <h4 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                    All Completed Missions ({activeModalCandidate.missions.filter((m) => m.passed).length})
                  </h4>
                </div>

                <div className="space-y-4">
                  {activeModalCandidate.missions
                    .filter((m) => m.passed)
                    .map((m) => {
                      const curriculumDay = CURRICULUM_DATA.days.find((d) => d.day === m.day);

                      return (
                        <div
                          key={m.day}
                          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-3"
                        >
                          {/* Day Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-md border border-emerald-200 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                                Day {m.day}
                              </span>
                              <h5 className="font-bold text-slate-900 text-base">
                                {curriculumDay?.title || m.title}
                              </h5>
                            </div>
                            {curriculumDay?.type && (
                              <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                                {curriculumDay.type}
                              </span>
                            )}
                          </div>

                          {/* Tools Used */}
                          {curriculumDay?.tools && curriculumDay.tools.length > 0 && (
                            <div>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                Tools:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {curriculumDay.tools.map((tool) => (
                                  <span
                                    key={tool}
                                    className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md border border-slate-200"
                                  >
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Objectives */}
                          {curriculumDay?.objectives && curriculumDay.objectives.length > 0 && (
                            <div>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                All Objectives:
                              </span>
                              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 font-normal pl-1">
                                {curriculumDay.objectives.map((obj, idx) => (
                                  <li key={idx} className="leading-relaxed">
                                    {obj}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

