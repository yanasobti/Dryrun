import React from 'react';

interface HeaderProps {
  searchTerm?: string;
  setSearchTerm?: (val: string) => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ searchTerm = '', setSearchTerm, title }) => {
  return (
    <header className="h-16 shrink-0 border-b border-slate-200/80 bg-white flex items-center justify-between px-6 z-30 select-none shadow-sm">
      {/* Centered search input when in explorer view */}
      {setSearchTerm ? (
        <div className="flex-1 max-w-lg relative flex items-center">
          <svg className="w-4.5 h-4.5 text-slate-400 absolute left-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search questions (e.g. Two Sum, Binary Search...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-slate-800 placeholder-slate-400 font-semibold transition-all shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 text-slate-405 hover:text-slate-655 text-xs font-bold font-mono cursor-pointer hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono font-extrabold text-slate-400 tracking-wider">
            {title || "Visualization Workspace"}
          </span>
        </div>
      )}

      {/* Profile Badge YD */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-500/10 cursor-pointer select-none ml-auto">
        YD
      </div>
    </header>
  );
};
