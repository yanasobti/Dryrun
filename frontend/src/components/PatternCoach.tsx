import React from 'react';
import type { PatternInsight } from '../services/patternDetector';
import { motion } from 'framer-motion';

interface PatternCoachProps {
  pattern: PatternInsight;
}

export const PatternCoach: React.FC<PatternCoachProps> = ({ pattern }) => {
  return (
    <div className="flex flex-col gap-5 select-none">
      {/* Pattern Header Badge */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
          <svg className="w-5 h-5 stroke-indigo-400 stroke-2 fill-none" viewBox="0 0 24 24">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 font-mono">
            {pattern.category}
          </span>
          <h2 className="text-lg font-bold text-slate-100 leading-tight">
            {pattern.name}
          </h2>
        </div>
      </div>

      {/* Pattern Description */}
      <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/30 border border-white/5 rounded-xl p-3">
        {pattern.description}
      </p>

      {/* Why This Fits Section */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 stroke-cyan-400 stroke-[2.5] fill-none" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Why This Fits
        </h4>
        <ul className="flex flex-col gap-2 text-sm text-slate-300 pl-1">
          {pattern.whyFits.map((item, idx) => (
            <motion.li
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx}
              className="flex items-start gap-2"
            >
              <span className="text-cyan-400 font-bold shrink-0 mt-1">
                <svg className="w-2.5 h-2.5 fill-cyan-400 stroke-none" viewBox="0 0 24 24">
                  <path d="M12 2l2.4 7.2 7.2 2.4-7.2 2.4-2.4 7.2-2.4-7.2-7.2-2.4 7.2-2.4z"/>
                </svg>
              </span>
              <span>{item}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Pitfalls of Alternatives */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 stroke-rose-400 stroke-[2.5] fill-none" viewBox="0 0 24 24">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Alternative Pitfalls
        </h4>
        <ul className="flex flex-col gap-2 text-sm text-slate-400 pl-1">
          {pattern.alternatives.map((item, idx) => (
            <motion.li
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              key={idx}
              className="flex items-start gap-2"
            >
              <span className="text-rose-500 font-semibold shrink-0 mt-0.5">✕</span>
              <span>{item}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Interview Clues */}
      <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 stroke-amber-400 stroke-2 fill-none" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Interview Clues to Spot This
        </h4>
        <ul className="flex flex-col gap-2 text-sm text-slate-300 pl-1">
          {pattern.clues.map((item, idx) => (
            <motion.li
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              key={idx}
              className="flex items-start gap-2"
            >
              <span className="text-amber-500 font-bold shrink-0">·</span>
              <span className="italic">"{item}"</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
};
