import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VisualEvent } from '../../utils/visualEvent';

interface HashSetVisualizerProps {
  name: string;
  values: string[];
  visualEvents?: VisualEvent[];
}

export const HashSetVisualizer: React.FC<HashSetVisualizerProps> = ({
  name,
  values,
  visualEvents = []
}) => {
  const statusOverlay = useMemo(() => {
    if (!visualEvents || visualEvents.length === 0) return "";
    const sorted = [...visualEvents].sort((a, b) => b.priority - a.priority);
    for (const event of sorted) {
      const { type, details } = event;
      if (type === 'SEARCH_MAP') {
        return `Checking HashSet duplicate: value "${details.key}" ... ${details.exists ? 'FOUND DUPLICATE!' : 'NOT FOUND (Unique)'}`;
      }
      if (type === 'MAP_INSERT' && details.name === name) {
        return `Adding to HashSet seen: Value ${details.key}`;
      }
    }
    return "";
  }, [visualEvents, name]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4 border-b border-slate-200/60 pb-2">
        <span className="text-sm font-semibold text-indigo-650 flex items-center gap-1.5 font-mono">
          <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
            <circle cx="12" cy="12" r="6" strokeWidth={2} strokeDasharray="3 3" />
          </svg>
          hashset {name} [{values.length} elements]
        </span>
      </div>

      {statusOverlay && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-3.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono bg-indigo-50 border border-indigo-100 text-indigo-755 flex items-center gap-2 shadow-sm select-none"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
          <span>{statusOverlay}</span>
        </motion.div>
      )}

      {values.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 select-none">
          <span className="text-xs text-slate-400 font-mono">{"[ ]"}</span>
          <span className="text-xs text-slate-550 mt-2 font-semibold">Set is currently empty</span>
        </div>
      ) : (
        <div className="w-full flex flex-wrap gap-3 max-h-[200px] overflow-y-auto p-1 select-none justify-start">
          <AnimatePresence mode="popLayout">
            {values.map((val) => {
              let isMatched = false;
              let isSearching = false;
              let isInserting = false;

              if (visualEvents) {
                for (const event of visualEvents) {
                  const { type, details } = event;
                  if (type === 'SEARCH_MAP' && String(details.key) === String(val)) {
                    isSearching = true;
                    if (details.exists) {
                      isMatched = true; // duplicate match
                    }
                  }
                  if (type === 'MAP_INSERT' && details.name === name && String(details.key) === String(val)) {
                    isInserting = true;
                  }
                  if (type === 'MATCH_FOUND' && String(details.key) === String(val)) {
                    isMatched = true;
                  }
                }
              }

              let bubbleClass = "border-slate-200 bg-white text-slate-800 shadow-xs hover:border-slate-350";
              let textClass = "text-slate-700 font-bold";

              if (isMatched) {
                bubbleClass = "border-emerald-500 bg-emerald-500/10 text-emerald-900 ring-2 ring-emerald-500/30 shadow-md";
                textClass = "text-emerald-800 font-extrabold";
              } else if (isSearching) {
                bubbleClass = "border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-400/30 shadow-md animate-pulse";
                textClass = "text-amber-800 font-extrabold";
              } else if (isInserting) {
                bubbleClass = "border-indigo-500 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-400/35 shadow-md animate-pulse";
                textClass = "text-indigo-850 font-extrabold";
              }

              return (
                <motion.div
                  key={val}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`flex items-center justify-center w-[46px] h-[46px] rounded-full border text-center font-mono text-sm ${bubbleClass} transition-all duration-300 shrink-0`}
                >
                  <span className={textClass}>{val}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
