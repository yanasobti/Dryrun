import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  searchTerm?: string;
  setSearchTerm?: (val: string) => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ searchTerm = '', setSearchTerm, title }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getInitials = () => {
    if (!user) return '?';
    const name = user.user_metadata?.full_name || user.user_metadata?.display_name || user.email || '';
    const cleanName = name.includes('@') ? name.split('@')[0] : name;
    const parts = cleanName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName.substring(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (_) {}
  };

  return (
    <header className="h-16 shrink-0 border-b border-slate-200/80 bg-white flex items-center justify-between px-6 z-30 select-none shadow-sm relative">
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

      {/* Dynamic Profile Badge & Dropdown */}
      <div className="ml-auto relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-500/10 cursor-pointer select-none overflow-hidden hover:scale-105 active:scale-95 transition-all"
        >
          {user?.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt="User profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initials if image loading fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span>{getInitials()}</span>
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2.5 w-60 bg-white border border-slate-200/80 rounded-2xl shadow-xl py-3 px-4 z-50 flex flex-col gap-2.5 animate-slide-in-top">
            <div className="flex flex-col border-b border-slate-100 pb-2">
              <span className="text-xs font-extrabold text-slate-800 truncate">
                {user?.user_metadata?.full_name || 'Authenticated User'}
              </span>
              <span className="text-[10px] font-bold text-slate-400 truncate">
                {user?.email}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full bg-slate-55 hover:bg-slate-100 text-slate-600 rounded-xl py-2 px-3.5 text-xs font-extrabold text-left transition-colors cursor-pointer flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
