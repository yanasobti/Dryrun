import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { NEETCODE_150 } from '../data/neetcode150';
import { useAuth } from '../hooks/useAuth';
import { progressService } from '../services/progressService';
import './LearnPage.css'; // Reuse core animations and design CSS definitions

export const getDifficultyStyle = (diff: "Easy" | "Medium" | "Hard") => {
  switch (diff) {
    case "Easy":
      return "text-emerald-600 bg-emerald-50 border border-emerald-100/50";
    case "Medium":
      return "text-amber-600 bg-amber-50 border border-amber-100/50";
    case "Hard":
      return "text-rose-600 bg-rose-50 border border-rose-100/50";
    default:
      return "text-slate-600 bg-slate-50 border border-slate-100/50";
  }
};

export const getVisLevelStyle = (level: "full" | "basic" | "coming-soon") => {
  switch (level) {
    case "full":
      return "text-indigo-600 bg-indigo-50 border border-indigo-100/50";
    case "basic":
      return "text-cyan-600 bg-cyan-50 border border-cyan-100/50";
    case "coming-soon":
      return "text-slate-400 bg-slate-50 border border-slate-200/50";
    default:
      return "text-slate-400 bg-slate-50 border border-slate-200/50";
  }
};

export const getVisLevelLabel = (level: "full" | "basic" | "coming-soon") => {
  switch (level) {
    case "full":
      return "✓ Visualized";
    case "basic":
      return "✓ Basic Mode";
    case "coming-soon":
      return "Coming Soon";
    default:
      return "Coming Soon";
  }
};

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      progressService.getBookmarkedIds().then(setBookmarkedIds).catch(() => {});
    }
  }, [user]);

  const handleToggleBookmark = async (qId: string) => {
    const isNowBookmarked = await progressService.toggleBookmark(qId);
    if (isNowBookmarked) {
      setBookmarkedIds(prev => [...prev, qId]);
    } else {
      setBookmarkedIds(prev => prev.filter(id => id !== qId));
    }
  };

  // User-scoped storage key
  const storageKey = user ? `dryrun_completed_questions_${user.id}` : 'dryrun_completed_questions';

  // Sync completion states
  const loadCompletedQuestions = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const ids = JSON.parse(stored);
        if (Array.isArray(ids)) {
          setCompletedIds(ids);
          return;
        }
      }
    } catch (_) {}
    // Initial default fallback
    const initialCompleted: string[] = [];
    setCompletedIds(initialCompleted);
    localStorage.setItem(storageKey, JSON.stringify(initialCompleted));
  };

  useEffect(() => {
    loadCompletedQuestions();
  }, [user]);

  useEffect(() => {
    window.addEventListener('storage', loadCompletedQuestions);
    window.addEventListener('dryrun_progress_update', loadCompletedQuestions);
    return () => {
      window.removeEventListener('storage', loadCompletedQuestions);
      window.removeEventListener('dryrun_progress_update', loadCompletedQuestions);
    };
  }, [user]);

  const toggleCompleted = (id: string) => {
    const nextCompleted = completedIds.includes(id)
      ? completedIds.filter(x => x !== id)
      : [...completedIds, id];
    
    setCompletedIds(nextCompleted);
    localStorage.setItem(storageKey, JSON.stringify(nextCompleted));
    window.dispatchEvent(new Event('dryrun_progress_update'));
  };

  // Filter Presets
  const filteredQuestions = NEETCODE_150.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.pattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCategory = true;
    if (selectedCategory) {
      const categoryLower = q.category.toLowerCase();
      if (selectedCategory === 'arrays') {
        matchesCategory = categoryLower.includes('array') || categoryLower.includes('hash');
      } else if (selectedCategory === 'pointers') {
        matchesCategory = categoryLower.includes('pointer');
      } else if (selectedCategory === 'window') {
        matchesCategory = categoryLower.includes('window');
      } else if (selectedCategory === 'stack') {
        matchesCategory = categoryLower.includes('stack');
      } else if (selectedCategory === 'binary-search') {
        matchesCategory = categoryLower.includes('search');
      } else if (selectedCategory === 'linkedlist') {
        matchesCategory = categoryLower.includes('list');
      } else if (selectedCategory === 'trees') {
        matchesCategory = categoryLower.includes('tree');
      }
    }

    return matchesSearch && matchesCategory;
  });

  const TOPIC_PILLS = [
    { id: 'all', label: `All (${NEETCODE_150.length})` },
    { id: 'arrays', label: `Arrays & Hashing (${NEETCODE_150.filter(q => q.category === 'Arrays & Hashing').length})` },
    { id: 'pointers', label: `Two Pointers (${NEETCODE_150.filter(q => q.category === 'Two Pointers').length})` },
    { id: 'window', label: `Sliding Window (${NEETCODE_150.filter(q => q.category === 'Sliding Window').length})` },
    { id: 'stack', label: `Stack (${NEETCODE_150.filter(q => q.category === 'Stack').length})` },
    { id: 'binary-search', label: `Binary Search (${NEETCODE_150.filter(q => q.category === 'Binary Search').length})` },
    { id: 'linkedlist', label: `Linked List (${NEETCODE_150.filter(q => q.category === 'Linked List').length})` },
    { id: 'trees', label: `Trees (${NEETCODE_150.filter(q => q.category === 'Trees').length})` }
  ];

  return (
    <div className="learn-page flex w-screen h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans relative">
      {/* Background glowing decorations */}
      <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-indigo-300/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float-1" />
      <div className="absolute top-[60%] right-[10%] w-[350px] h-[350px] bg-blue-300/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float-2" />
      <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] bg-violet-300/8 rounded-full blur-3xl pointer-events-none -z-10 animate-float-3" />

      {/* 1. Sidebar */}
      <Sidebar activeItem="explore" />

      {/* 2. Main Workstation Panel */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {/* Explorer Content Dashboard View */}
        <div className="flex-1 overflow-hidden min-h-0 relative bg-slate-50/30">
          <div className="h-full overflow-y-auto bg-slate-50/40 px-6 md:px-12 py-8 select-none animate-fade-in-up">
            <div className="max-w-5xl mx-auto w-full flex flex-col gap-8">
              
              {/* Main Titles */}
              <div className="flex flex-col gap-1.5">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans-premium">
                  What do you want to visualize today?
                </h1>
                <p className="text-xs text-slate-500 font-semibold">
                  Choose a question from NeetCode 150 or visualize your own code.
                </p>
              </div>

              {/* Hero Dual Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Card 1: Visualize Any Code */}
                <div className="bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 border border-indigo-200/40 rounded-3xl p-6 md:p-8 flex items-stretch justify-between relative overflow-hidden group shadow-sm hover:shadow-lg hover:border-indigo-300 hover:scale-[1.01] transition-all duration-300">
                  <div className="flex-1 flex flex-col justify-between z-10 min-w-0 pr-4">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-655 mb-4 font-bold">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-2 font-sans-premium">Visualize Any Code</h2>
                      <p className="text-xs text-slate-500 leading-relaxed mb-6 font-semibold">
                        Paste your own code and watch it come to life step-by-step.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/learn')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 self-start shadow-sm transition-all hover:scale-[1.02] cursor-pointer whitespace-nowrap"
                    >
                      Visualize My Code
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>

                  {/* Mini Browser/Code illustration */}
                  <div className="w-[170px] shrink-0 border border-slate-200/50 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden relative transform rotate-1 translate-y-3 translate-x-4 select-none">
                    <div className="h-6 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 px-3 shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="p-4 flex flex-col gap-2.5 font-mono text-[8px] leading-none text-slate-350">
                      <div className="flex gap-2"><span>1</span><span className="w-12 h-1.5 bg-slate-100 rounded-sm" /></div>
                      <div className="flex gap-2"><span>2</span><span className="w-16 h-1.5 bg-slate-100 rounded-sm" /></div>
                      <div className="flex gap-2 items-center bg-emerald-50 py-0.5 rounded-sm -mx-2 px-2 border-l-2 border-emerald-500">
                        <span className="text-emerald-600 font-bold">3</span>
                        <span className="w-20 h-1.5 bg-emerald-200/60 rounded-sm" />
                      </div>
                      <div className="flex gap-2"><span>4</span><span className="w-14 h-1.5 bg-slate-100 rounded-sm" /></div>
                      <div className="flex gap-2"><span>5</span><span className="w-10 h-1.5 bg-slate-100 rounded-sm" /></div>
                      <div className="flex gap-2"><span>6</span><span className="w-24 h-1.5 bg-slate-100 rounded-sm" /></div>
                    </div>
                  </div>
                </div>

                {/* Card 2: NeetCode 150 */}
                <div className="bg-gradient-to-br from-emerald-50/40 to-emerald-100/20 border border-emerald-200/30 rounded-3xl p-6 md:p-8 flex items-stretch justify-between relative overflow-hidden group shadow-sm hover:shadow-lg hover:border-emerald-300 hover:scale-[1.01] transition-all duration-300">
                  <div className="flex-1 flex flex-col justify-between z-10 min-w-0 pr-4">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-700 mb-4 font-bold">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-2 font-sans-premium">NeetCode 150</h2>
                      <p className="text-xs text-slate-500 leading-relaxed mb-6 font-semibold">
                        Practice the most important coding interview questions.
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="bg-[#047857] hover:bg-emerald-800 text-white rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 self-start shadow-sm transition-all hover:scale-[1.02] cursor-pointer whitespace-nowrap"
                    >
                      Explore NeetCode 150
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>

                  {/* Mini Checklist illustration */}
                  <div className="w-[170px] shrink-0 border border-slate-200/50 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden relative transform -rotate-1 translate-y-3 translate-x-4 select-none">
                    <div className="p-4 flex flex-col gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-md border border-emerald-500 bg-emerald-50 flex items-center justify-center text-emerald-600 text-[9px] font-bold">✓</div>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-sm" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-md border border-emerald-500 bg-emerald-50 flex items-center justify-center text-emerald-600 text-[9px] font-bold">✓</div>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-sm" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-md border border-slate-200 bg-white" />
                        <div className="w-28 h-1.5 bg-slate-100 rounded-sm" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-md border border-slate-200 bg-white" />
                        <div className="w-16 h-1.5 bg-slate-100 rounded-sm" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Topic Pills Carousel Filter */}
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-extrabold text-slate-800 font-sans-premium">
                  NeetCode 150 by Topic
                </h3>
                
                <div className="flex items-center relative gap-2 w-full">
                  {/* Scrollable container with hidden scrollbar */}
                  <div className="flex-1 overflow-x-auto scrollbar-none flex gap-3 py-1">
                    {TOPIC_PILLS.map((pill) => {
                      const isActive = (pill.id === 'all' && !selectedCategory) || selectedCategory === pill.id;
                      return (
                        <button
                          key={pill.id}
                          onClick={() => setSelectedCategory(pill.id === 'all' ? null : pill.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
                            isActive
                              ? 'border-indigo-650 text-indigo-650 bg-white shadow-xs'
                              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-350 hover:text-slate-800'
                          }`}
                        >
                          {pill.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Scroll Right Trigger button */}
                  <button 
                    onClick={() => {
                      const container = document.querySelector('.scrollbar-none');
                      if (container) {
                        container.scrollBy({ left: 150, behavior: 'smooth' });
                      }
                    }}
                    className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-350 bg-white flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors shadow-sm shrink-0 cursor-pointer"
                  >
                    ➔
                  </button>
                </div>
              </div>

              {/* Questions Table */}
              <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-16 text-xs text-slate-400 font-mono">
                    No matching questions found for current criteria.
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-450 text-[10px] font-black uppercase tracking-widest bg-slate-50/50">
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
                        {filteredQuestions.map((q) => {
                          const isDone = completedIds.includes(q.id);
                          return (
                            <tr
                              key={q.id}
                              onClick={() => {
                                navigate(`/learn/${q.id}`);
                              }}
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
                                      className={`p-1 rounded-md hover:bg-slate-100 transition-colors ${
                                        bookmarkedIds.includes(q.id) ? 'text-amber-500' : 'text-slate-350 hover:text-slate-500'
                                      }`}
                                    >
                                      {bookmarkedIds.includes(q.id) ? (
                                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                      ) : (
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.564-.386-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                      )}
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
                                <span className="text-[10px] font-bold text-slate-500">
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
                                    onClick={() => {
                                      toggleCompleted(q.id);
                                    }}
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

              {/* Center bottom all questions trigger */}
              <div className="flex items-center justify-center mt-2 pb-6">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs font-extrabold text-indigo-650 hover:text-indigo-850 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View all 150 questions →
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
