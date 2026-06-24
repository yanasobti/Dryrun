import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { NEETCODE_150 } from '../data/neetcode150';
import { progressService } from '../services/progressService';
import { useAuth } from '../hooks/useAuth';
import { getDifficultyStyle, getVisLevelStyle, getVisLevelLabel } from './ExplorePage';
import './LearnPage.css';

export const SavedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = user ? `dryrun_completed_questions_${user.id}` : 'dryrun_completed_questions';

  const loadData = async () => {
    try {
      setIsLoading(true);
      if (user) {
        const bookmarks = await progressService.getBookmarkedIds();
        setBookmarkedIds(bookmarks);
      }
      
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const ids = JSON.parse(stored);
        if (Array.isArray(ids)) {
          setCompletedIds(ids);
        }
      }
    } catch (_) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleToggleBookmark = async (qId: string) => {
    const isNowBookmarked = await progressService.toggleBookmark(qId);
    if (isNowBookmarked) {
      setBookmarkedIds(prev => [...prev, qId]);
    } else {
      setBookmarkedIds(prev => prev.filter(id => id !== qId));
    }
  };

  const toggleCompleted = (id: string) => {
    const nextCompleted = completedIds.includes(id)
      ? completedIds.filter(x => x !== id)
      : [...completedIds, id];
    
    setCompletedIds(nextCompleted);
    localStorage.setItem(storageKey, JSON.stringify(nextCompleted));
    window.dispatchEvent(new Event('dryrun_progress_update'));
  };

  // Filter bookmarked questions matching search term
  const savedQuestions = NEETCODE_150.filter(q => {
    const isBookmarked = bookmarkedIds.includes(q.id);
    if (!isBookmarked) return false;

    return q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           q.pattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
           q.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="learn-page flex w-screen h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans relative">
      <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-amber-200/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float-1" />
      <div className="absolute top-[60%] right-[10%] w-[350px] h-[350px] bg-indigo-200/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float-2" />

      <Sidebar activeItem="saved" />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} title="Saved Visualizations" />

        <div className="flex-1 overflow-hidden min-h-0 relative bg-slate-50/30">
          <div className="h-full overflow-y-auto bg-slate-50/40 px-6 md:px-12 py-8 select-none animate-fade-in-up">
            <div className="max-w-5xl mx-auto w-full flex flex-col gap-8">
              
              <div className="flex flex-col gap-1.5">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans-premium">
                  Saved Visualizations
                </h1>
                <p className="text-xs text-slate-500 font-semibold">
                  Access and continue your bookmarked questions instantly.
                </p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                {isLoading ? (
                  <div className="text-center py-16 text-xs text-slate-400 font-mono animate-pulse">
                    Loading bookmarked questions...
                  </div>
                ) : savedQuestions.length === 0 ? (
                  <div className="text-center py-16 text-xs text-slate-400 font-mono">
                    No bookmarked questions saved yet. Click the star icon next to a question to save it here!
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-455 text-[10px] font-black uppercase tracking-widest bg-slate-50/50">
                          <th className="py-3.5 px-6 w-16 text-center font-mono">#</th>
                          <th className="py-3.5 px-6">Question</th>
                          <th className="py-3.5 px-6 w-40">Pattern</th>
                          <th className="py-3.5 px-6 w-44">Category</th>
                          <th className="py-3.5 px-6 w-32">Visualizer</th>
                          <th className="py-3.5 px-6 w-36">Status</th>
                          <th className="py-3.5 px-6 w-14"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {savedQuestions.map((q) => {
                          const isDone = completedIds.includes(q.id);
                          return (
                            <tr
                              key={q.id}
                              onClick={() => navigate(`/learn/${q.id}`)}
                              className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors group cursor-pointer"
                            >
                              <td className="py-4.5 px-6 text-center text-xs font-mono text-slate-450">
                                {q.number}
                              </td>
                              <td className="py-4.5 px-6">
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-slate-800 group-hover:text-indigo-650 transition-colors">
                                      {q.title}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleBookmark(q.id);
                                      }}
                                      className="p-1 rounded-md hover:bg-slate-100 transition-colors text-amber-500"
                                    >
                                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                      </svg>
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getDifficultyStyle(q.difficulty)}`}>
                                      {q.difficulty}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                                      🕒 {q.estimatedMinutes} min
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4.5 px-6">
                                <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-md font-mono">
                                  {q.pattern}
                                </span>
                              </td>
                              <td className="py-4.5 px-6">
                                <span className="text-[10px] font-bold text-slate-550">
                                  {q.category}
                                </span>
                              </td>
                              <td className="py-4.5 px-6">
                                <span className={`text-[9.5px] font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${getVisLevelStyle(q.visualizationLevel)}`}>
                                  {getVisLevelLabel(q.visualizationLevel)}
                                </span>
                              </td>
                              <td className="py-4.5 px-6" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => toggleCompleted(q.id)}
                                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                                      isDone
                                        ? 'bg-indigo-600 border-indigo-500 text-white'
                                        : 'border-slate-300 hover:border-indigo-500 bg-white'
                                    }`}
                                  >
                                    {isDone && (
                                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    )}
                                  </button>
                                  <span className={`text-xs font-semibold ${
                                    isDone ? 'text-slate-855' : 'text-slate-450'
                                  }`}>
                                    {isDone ? 'Completed' : 'Not Started'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4.5 px-6 text-center text-slate-300 group-hover:text-slate-500 transition-colors">
                                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
