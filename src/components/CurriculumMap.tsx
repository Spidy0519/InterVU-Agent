import React, { useState } from 'react';
import { InterviewState } from '../types/interview';
import { CURRICULUM_DATA } from '../data/curriculum';
import { ChevronDown, ChevronRight, BookOpen, Layers, CheckCircle2, Wrench, Calendar, Sparkles } from 'lucide-react';

interface CurriculumMapProps {
  session?: InterviewState | null;
}

export const CurriculumMap: React.FC<CurriculumMapProps> = () => {
  // Store set of open module numbers (Module 1 open by default)
  const [openModules, setOpenModules] = useState<Record<number, boolean>>({
    1: true,
  });

  // Filter dropdown for quick navigation
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<number | 'all'>('all');

  const toggleModule = (moduleNumber: number) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleNumber]: !prev[moduleNumber],
    }));
  };

  const expandAll = () => {
    const allOpen: Record<number, boolean> = {};
    CURRICULUM_DATA.modules.forEach((m) => {
      allOpen[m.n] = true;
    });
    setOpenModules(allOpen);
  };

  const collapseAll = () => {
    setOpenModules({});
  };

  const filteredModules = CURRICULUM_DATA.modules.filter((m) =>
    selectedModuleFilter === 'all' ? true : m.n === selectedModuleFilter
  );

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'SETUP':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'BUILD':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'AI_CORE':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SHIP_IT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'LEARN':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'OPTIMIZE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'CAPSTONE':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div id="curriculum-map-view" className="space-y-6 w-full py-2">
      {/* Header & Controls Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            <span>Curriculum Architecture & Roadmap</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {CURRICULUM_DATA.cohort}
          </p>
        </div>

        {/* Quick Dropdown Filter & Expand/Collapse Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Module Select Dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-600 shrink-0">Module:</span>
            <select
              id="curriculum-module-select"
              value={selectedModuleFilter}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                setSelectedModuleFilter(val);
                if (val !== 'all') {
                  setOpenModules((prev) => ({ ...prev, [val]: true }));
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer w-full sm:w-auto"
            >
              <option value="all">All Modules (1 – 8)</option>
              {CURRICULUM_DATA.modules.map((m) => (
                <option key={m.n} value={m.n}>
                  Module {m.n}: {m.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              id="btn-expand-all"
              onClick={expandAll}
              className="px-2.5 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <button
              id="btn-collapse-all"
              onClick={collapseAll}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Modules Dropdown List */}
      <div className="space-y-4">
        {filteredModules.map((module) => {
          const isOpen = !!openModules[module.n];
          const moduleDays = CURRICULUM_DATA.days.filter((d) =>
            module.days.length === 2
              ? d.day >= module.days[0] && d.day <= module.days[1]
              : d.day === module.days[0]
          );

          const dayRangeText =
            module.days.length === 2
              ? `Days ${module.days[0]}–${module.days[1]}`
              : `Day ${module.days[0]}`;

          return (
            <div
              key={module.n}
              id={`curriculum-module-dropdown-${module.n}`}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200"
            >
              {/* Module Dropdown Header Button */}
              <button
                id={`btn-toggle-module-${module.n}`}
                onClick={() => toggleModule(module.n)}
                className={`w-full p-4 flex items-center justify-between text-left transition-colors cursor-pointer ${
                  isOpen
                    ? 'bg-slate-50/80 border-b border-slate-200'
                    : 'hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  <span className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0">
                    M{module.n}
                  </span>

                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      Module {module.n} — {module.title}
                    </h2>
                    <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-500 font-medium">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dayRangeText}</span>
                      </span>
                      <span>•</span>
                      <span>{moduleDays.length} {moduleDays.length === 1 ? 'Day' : 'Days'}</span>
                    </div>
                  </div>
                </div>

                {/* Dropdown Indicator Icon */}
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 hidden sm:inline-block">
                    {isOpen ? 'Click to collapse' : 'Click to expand'}
                  </span>
                  <div className="p-1 rounded-md text-slate-500 hover:text-slate-800 bg-white border border-slate-200">
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-sky-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* Dropdown Content Body */}
              {isOpen && (
                <div className="p-4 sm:p-5 space-y-4 bg-slate-50/30">
                  <div className="space-y-3.5">
                    {moduleDays.map((day) => (
                      <div
                        key={day.day}
                        id={`day-card-${day.day}`}
                        className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3"
                      >
                        {/* Day Title & Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                              Day {day.day}
                            </span>
                            <span>{day.title}</span>
                          </h3>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getTypeBadgeStyle(
                              day.type
                            )}`}
                          >
                            {day.type}
                          </span>
                        </div>

                        {/* Tools list */}
                        {day.tools && day.tools.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                            <span className="font-semibold text-slate-700 flex items-center space-x-1 shrink-0">
                              <Wrench className="w-3.5 h-3.5 text-slate-400" />
                              <span>Tools:</span>
                            </span>
                            {day.tools.map((tool, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px]"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Objectives List */}
                        {day.objectives && day.objectives.length > 0 && (
                          <div className="pt-1 text-xs">
                            <div className="font-semibold text-slate-700 mb-1.5 flex items-center space-x-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>Learning Objectives:</span>
                            </div>
                            <ul className="space-y-1.5 text-slate-700 pl-0.5">
                              {day.objectives.map((obj, idx) => (
                                <li key={idx} className="flex items-start space-x-2 leading-relaxed">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                                  <span>{obj}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

