import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { NEETCODE_150 } from '../data/neetcode150';
import { progressService } from '../services/progressService';
import type { UserQuestionProgress } from '../services/progressService';
import { useAuth } from '../hooks/useAuth';
import { getDifficultyStyle } from './ExplorePage';
import './LearnPage.css';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [historyList, setHistoryList] = useState<UserQuestionProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      if (user) {
        const progress = await progressService.getAllProgress();
        // Sort by last attempted time descending
        const sortedProgress = (progress || []).sort((a, b) => {
          const tA = new Date(a.last_attempted_at || 0).getTime();
          const tB = new Date(b.last_attempted_at || 0).getTime();
          return tB - tA;
        });
        setHistoryList(sortedProgress);
      }
    } catch (_) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Map progress database rows to NEETCODE_150 questions
  const historyQuestions = historyList
    .map(p => {
      const q = NEETCODE_150.find(item => item.id === p.question_id);
      if (!q) return null;
      return {
        ...q,
        historyDetails: p,
      };
    })
    .filter((q): q is NonNullable<typeof q> => {
      if (!q) return false;
      return q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             q.pattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
             q.category.toLowerCase().includes(searchTerm.toLowerCase());
    });

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="learn-page flex w-screen h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans relative">
      <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-sky-200/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float-1" />
      <div className="absolute top-[60%] right-[10%] w-[350px] h-[350px] bg-violet-200/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float-2" />

      <Sidebar activeItem="history" />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} title="Simulation History" />

        <div className="flex-1 overflow-hidden min-h-0 relative bg-slate-50/30">
          <div className="h-full overflow-y-auto bg-slate-50/40 px-6 md:px-12 py-8 select-none animate-fade-in-up">
            <div className="max-w-5xl mx-auto w-full flex flex-col gap-8">
              
              <div className="flex flex-col gap-1.5">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans-premium">
                  Simulation History
                </h1>
                <p className="text-xs text-slate-500 font-semibold">
                  Review your recently simulated coding questions and resume from your last step.
                </p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                {isLoading ? (
                  <div className="text-center py-16 text-xs text-slate-400 font-mono animate-pulse">
                    Loading simulation history...
                  </div>
                ) : historyQuestions.length === 0 ? (
                  <div className="text-center py-16 text-xs text-slate-400 font-mono">
                    No simulation history found. Go to explore page, pick a question, and hit Simulate!
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-455 text-[10px] font-black uppercase tracking-widest bg-slate-50/50">
                          <th className="py-3.5 px-6">Question</th>
                          <th className="py-3.5 px-6 w-36">Last Attempted</th>
                          <th className="py-3.5 px-6 w-24 text-center">Resume Step</th>
                          <th className="py-3.5 px-6 w-36">Status</th>
                          <th className="py-3.5 px-6 w-14"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyQuestions.map(({ historyDetails: p, ...q }) => {
                          const isDone = p.status === 'completed';
                          return (
                            <tr
                              key={q.id}
                              onClick={() => navigate(`/learn/${q.id}`)}
                              className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors group cursor-pointer"
                            >
                              <td className="py-4.5 px-6">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-bold text-sm text-slate-800 group-hover:text-indigo-650 transition-colors">
                                    {q.title}
                                  </span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getDifficultyStyle(q.difficulty)}`}>
                                      {q.difficulty}
                                    </span>
                                    <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-md font-mono">
                                      {q.pattern}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4.5 px-6 text-xs text-slate-500 font-medium">
                                {formatDate(p.last_attempted_at)}
                              </td>
                              <td className="py-4.5 px-6 text-center text-xs font-mono font-bold text-indigo-650 bg-indigo-50/20">
                                Step {p.last_step + 1}
                              </td>
                              <td className="py-4.5 px-6">
                                <span className={`text-[9.5px] font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                                  isDone 
                                    ? 'text-emerald-600 bg-emerald-50 border-emerald-100/50' 
                                    : 'text-amber-600 bg-amber-50 border-amber-100/50'
                                }`}>
                                  {isDone ? '✓ Completed' : '✎ In Progress'}
                                </span>
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
