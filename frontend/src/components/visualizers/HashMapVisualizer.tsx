import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VisualEvent } from '../../utils/visualEvent';
import { ContextBubble } from './ContextBubble';

interface HashMapVisualizerProps {
  name: string;
  entries: [string, string][];
  variables: Record<string, any>;
  visualEvents?: VisualEvent[];
  codeLine?: string;
}

export const HashMapVisualizer: React.FC<HashMapVisualizerProps> = ({
  name,
  entries,
  variables,
  visualEvents = [],
  codeLine = ""
}) => {
  // Try to find if any variable is being used as a lookup key (e.g. complement)
  const lookupKey = useMemo(() => {
    const potentialKeys = ['complement', 'target', 'key', 'k'];
    for (const pKey of potentialKeys) {
      if (variables[pKey] !== undefined) {
        return String(variables[pKey]);
      }
    }
    return null;
  }, [variables]);

  // Clean values of sc and tc for character lookup
  const scVal = useMemo(() => variables['sc'] !== undefined ? String(variables['sc']).replace(/['"]/g, '') : null, [variables]);
  const tcVal = useMemo(() => variables['tc'] !== undefined ? String(variables['tc']).replace(/['"]/g, '') : null, [variables]);

  const getEntryOverlayText = (key: string, value: string) => {
    const C = Number(value);
    const hasCodeLine = typeof codeLine === 'string';
    
    if (scVal === key && hasCodeLine && codeLine.includes('sc')) {
      return `${key} : ${isNaN(C) ? 0 : C - 1} → ${value}`;
    }
    if (tcVal === key && hasCodeLine && codeLine.includes('tc')) {
      return `${key} : ${isNaN(C) ? 0 : C + 1} → ${value}`;
    }

    if (visualEvents) {
      for (const event of visualEvents) {
        const { type, details } = event;
        if (type === 'MAP_INSERT' && String(details.key) === String(key)) {
          return `Updated: ${key} ➔ ${value}`;
        }
        if (type === 'SEARCH_MAP' && String(details.key) === String(key)) {
          return details.exists ? 'Found!' : 'Not Found';
        }
      }
    }
    return "";
  };

  // Compute status overlay text based on active code line and variables
  const statusOverlay = useMemo(() => {
    if (!visualEvents || visualEvents.length === 0) return "";
    
    const sorted = [...visualEvents].sort((a, b) => b.priority - a.priority);
    for (const event of sorted) {
      const { type, details } = event;
      if (type === 'SEARCH_MAP') {
        return `Searching HashMap: key "${details.key}" ... ${details.exists ? 'FOUND! (OK)' : 'NOT FOUND (Empty)'}`;
      }
      if (type === 'MAP_INSERT' && details.name === name) {
        return `Inserting Pair: Key ${details.key} ➔ Value ${details.value}`;
      }
      if (type === 'MATCH_FOUND') {
        return `Match Found! Solution returned.`;
      }
      if (type === 'INIT_MAP') {
        return `Initialized empty HashMap`;
      }
    }
    return "";
  }, [visualEvents, name]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4 border-b border-slate-200/60 pb-2">
        <span className="text-sm font-semibold text-indigo-600 flex items-center gap-1.5 font-mono">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          hashmap {name} [{entries.length} entries]
        </span>
      </div>
      
      {statusOverlay && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-3.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center gap-2 shadow-sm select-none"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
          <span>{statusOverlay}</span>
        </motion.div>
      )}

      {entries.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <span className="text-xs text-slate-400 font-mono">{"{ }"}</span>
          <span className="text-xs text-slate-500 mt-2 font-medium">Map is currently empty</span>
        </div>
      ) : (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-h-0 overflow-y-auto px-1 select-none">
          <AnimatePresence mode="popLayout">
            {entries.map(([key, value]) => {
              let isMatched = false;
              let isSearching = false;
              let isInserting = false;

              if (visualEvents) {
                for (const event of visualEvents) {
                  const { type, details } = event;
                  if (type === 'SEARCH_MAP' && String(details.key) === String(key)) {
                    isSearching = true;
                  }
                  if (type === 'MATCH_FOUND' && (String(details.complement) === String(key) || String(lookupKey) === String(key))) {
                    isMatched = true;
                  }
                  if (type === 'MAP_INSERT' && details.name === name && String(details.key) === String(key)) {
                    isInserting = true;
                  }
                }
              }

              let cardClass = "border-slate-150 bg-white text-slate-800 shadow-sm";
              let keyColorClass = "text-slate-700";
              let valColorClass = "text-indigo-600";

              if (isMatched) {
                cardClass = "border-emerald-500 bg-emerald-500/10 text-emerald-900 ring-2 ring-emerald-500/30 shadow-md";
                keyColorClass = "text-emerald-800";
                valColorClass = "text-emerald-600";
              } else if (isSearching) {
                cardClass = "border-amber-400 bg-amber-50/70 text-amber-900 ring-2 ring-amber-400/30 shadow-md animate-pulse";
                keyColorClass = "text-amber-800";
                valColorClass = "text-amber-600";
              } else if (isInserting) {
                cardClass = "border-indigo-500 bg-indigo-50/20 text-indigo-900 ring-2 ring-indigo-400/35 shadow-md";
                keyColorClass = "text-indigo-800";
                valColorClass = "text-indigo-600";
              }

              const entryOverlay = getEntryOverlayText(key, value);

              return (
                <div key={key} id={`hashmap-entry-${name}-${key}`} className="relative pt-6 min-w-[140px]">
                  {entryOverlay && (
                    <ContextBubble
                      message={entryOverlay}
                      variant={entryOverlay.includes('→') ? (tcVal === key && codeLine?.includes('tc') ? 'action' : 'success') : 'info'}
                      animation="pop"
                      position="top"
                      className="absolute top-0 left-1/2 transform -translate-x-1/2"
                    />
                  )}
                  <motion.div
                    layout
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border ${cardClass} transition-colors duration-300`}
                  >
                    {/* Key */}
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Key</span>
                      <span className={`font-mono text-sm font-bold ${keyColorClass}`}>
                        {key}
                      </span>
                    </div>

                    {/* Connecting indicator */}
                    <div className="flex-1 flex items-center justify-center px-4">
                      {isMatched ? (
                        <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm font-mono uppercase tracking-wider animate-pulse border border-emerald-400">
                          Match
                        </span>
                      ) : isSearching ? (
                        <span className="bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm font-mono uppercase tracking-wider animate-pulse border border-amber-400">
                          Search
                        </span>
                      ) : (
                        <svg className="w-8 h-3 text-slate-300" viewBox="0 0 32 12" fill="none">
                          <path d="M0 6 H 24 M 18 1 L 25 6 L 18 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    {/* Value */}
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Value</span>
                      <span className={`font-mono text-sm font-bold ${valColorClass}`}>
                        {value}
                      </span>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
