import React from 'react';
import { NEETCODE_150 } from '../../data/neetcode150';
import type { Question } from '../../types';

interface WorkspaceToolbarProps {
  setIsSidebarOpen: (open: boolean) => void;
  onBackToQuestions: () => void;
  preset: Question | undefined;
  handleSelectPreset: (presetId: string) => void;
  handleVerifyCode: () => void;
  isLoading: boolean;
  handleReset: () => void;
  bookmarkedIds: string[];
  handleToggleBookmark: (qId: string) => void;
}

export const WorkspaceToolbar: React.FC<WorkspaceToolbarProps> = ({
  setIsSidebarOpen,
  onBackToQuestions,
  preset,
  handleSelectPreset,
  handleVerifyCode,
  isLoading,
  handleReset,
  bookmarkedIds = [],
  handleToggleBookmark
}) => {
  return (
    <div className="h-14 shrink-0 border-b border-slate-200 bg-slate-50/80 backdrop-blur-md flex items-center justify-between px-6 z-20">
      <div className="flex items-center gap-4">
        {/* Dots Trigger Button to Open Sidebar */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="w-9 h-9 bg-white border border-slate-200 hover:border-slate-350 rounded-xl flex items-center justify-center shadow-xs transition-all cursor-pointer group shrink-0"
          title="Open Navigation Sidebar"
        >
          <svg className="w-4.5 h-4.5 text-slate-500 group-hover:text-indigo-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="6" cy="6" r="2" />
            <circle cx="12" cy="6" r="2" />
            <circle cx="18" cy="6" r="2" />
            <circle cx="6" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="18" cy="12" r="2" />
            <circle cx="6" cy="18" r="2" />
            <circle cx="12" cy="18" r="2" />
            <circle cx="18" cy="18" r="2" />
          </svg>
        </button>

        <div className="w-px h-5 bg-slate-200" />

        {/* Back to Questions button */}
        <button
          onClick={onBackToQuestions}
          className="flex items-center gap-2 text-indigo-655 hover:text-indigo-800 text-xs font-extrabold transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          ← Explore Questions
        </button>

        <div className="w-px h-5 bg-slate-200" />

        {/* Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider font-mono">
              Problem:
            </span>
            <select
              value={preset?.id || ""}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-bold select-none cursor-pointer shadow-sm"
            >
              <option value="">Custom Code</option>
              {Array.from(new Set(NEETCODE_150.map(q => q.category))).map(category => (
                <optgroup key={category} label={category}>
                  {NEETCODE_150.filter(q => q.category === category).map(q => (
                    <option key={q.id} value={q.id}>
                      #{q.number} {q.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            {preset && (
              <button
                onClick={() => handleToggleBookmark(preset.id)}
                className={`p-1.5 rounded-xl border flex items-center justify-center transition-colors shadow-sm cursor-pointer ${
                  bookmarkedIds.includes(preset.id)
                    ? 'bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100/50'
                    : 'bg-white border-slate-200 text-slate-455 hover:border-slate-355 hover:text-slate-700'
                }`}
                title={bookmarkedIds.includes(preset.id) ? "Remove Bookmark" : "Bookmark Question"}
              >
                {bookmarkedIds.includes(preset.id) ? (
                  <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ) : (
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.564-.386-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {preset && preset.url && (
            <a
              href={preset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-indigo-655 hover:bg-slate-50 font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              Open Original Problem
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleVerifyCode}
          disabled={isLoading || preset?.visualizationLevel === 'coming-soon'}
          className="px-4 py-2 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-[0_4px_16px_rgba(79,70,229,0.15)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 fill-white stroke-none" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Simulate DryRun
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-655 hover:text-slate-855 font-bold text-xs transition-colors cursor-pointer shadow-sm hover:bg-slate-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
