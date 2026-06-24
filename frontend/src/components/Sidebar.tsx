import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NEETCODE_150 } from '../data/neetcode150';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  activeItem: 'explore' | 'custom' | 'saved' | 'history';
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [solvedCount, setSolvedCount] = useState(0);
  const totalCount = NEETCODE_150.length;

  const updateProgress = () => {
    try {
      const storageKey = user ? `dryrun_completed_questions_${user.id}` : 'dryrun_completed_questions';
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const ids = JSON.parse(stored);
        if (Array.isArray(ids)) {
          const solved = ids.filter((id: string) => NEETCODE_150.some(q => q.id === id));
          setSolvedCount(solved.length);
          return;
        }
      }
    } catch (_) {}
    setSolvedCount(0);
  };

  useEffect(() => {
    updateProgress();
  }, [user]);

  useEffect(() => {
    window.addEventListener('storage', updateProgress);
    window.addEventListener('dryrun_progress_update', updateProgress);
    return () => {
      window.removeEventListener('storage', updateProgress);
      window.removeEventListener('dryrun_progress_update', updateProgress);
    };
  }, [user]);

  const progressPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  return (
    <aside className="w-64 border-r border-slate-200/80 bg-white flex flex-col justify-between shrink-0 h-full p-5 select-none font-sans animate-slide-in-left">
      <div className="flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-6 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-indigo-650 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <svg className="w-4.5 h-4.5 fill-white stroke-none" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
            DryRun
          </span>
        </div>

        {/* Start Visualizing Button */}
        <button
          onClick={() => navigate('/learn')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] transition-all cursor-pointer mb-6"
        >
          <span className="text-base font-bold leading-none">+</span> Start Visualizing
        </button>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          <button
            onClick={() => navigate('/explore')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeItem === 'explore'
                ? 'bg-indigo-50/60 text-indigo-650 shadow-xs'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" fill="currentColor" opacity={activeItem === 'explore' ? 0.25 : 0} />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" />
            </svg>
            Explore
          </button>

          <button
            onClick={() => navigate('/explore')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            NeetCode 150
          </button>

          <button
            onClick={() => navigate('/learn')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeItem === 'custom'
                ? 'bg-indigo-50/60 text-indigo-650 shadow-xs'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Custom Code
          </button>

           <button
            onClick={() => navigate('/saved')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeItem === 'saved'
                ? 'bg-indigo-50/60 text-indigo-650 shadow-xs'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Saved
          </button>

          <button
            onClick={() => navigate('/history')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeItem === 'history'
                ? 'bg-indigo-50/60 text-indigo-650 shadow-xs'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
          </button>
        </nav>
      </div>

      {/* Progress Card & Quick Demo */}
      <div className="flex flex-col gap-4">
        <div className="border border-slate-200/60 bg-slate-50/50 rounded-2xl p-4 flex flex-col gap-2">
          <span className="text-xs font-extrabold text-slate-800 font-sans-premium">Your Progress</span>
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 font-mono">
            <span>{solvedCount} / {totalCount} solved</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
            <div 
              style={{ width: `${progressPercent}%` }} 
              className="h-full bg-indigo-655 rounded-full transition-all duration-300"
            />
          </div>
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            {progressPercent}% Keep going!
            <svg className="w-3.5 h-3.5 fill-indigo-500 stroke-none animate-bounce" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
        </div>

        <button
          onClick={() => alert("See how DryRun helps you master complex coding algorithms instantly!")}
          className="flex items-center gap-2 text-[10.5px] font-extrabold text-indigo-650 hover:text-indigo-850 transition-colors cursor-pointer text-left pl-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
          </svg>
          How it works? See a quick demo
        </button>
      </div>
    </aside>
  );
};
