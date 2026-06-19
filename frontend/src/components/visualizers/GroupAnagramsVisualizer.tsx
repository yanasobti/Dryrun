import React, { useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContextBubble } from './ContextBubble';

interface GroupAnagramsVisualizerProps {
  frames: any[];
  currentFrameIndex: number;
  visualizerState: any;
}

export const GroupAnagramsVisualizer: React.FC<GroupAnagramsVisualizerProps> = ({
  frames,
  currentFrameIndex,
  visualizerState
}) => {
  const activeFrame = frames[currentFrameIndex] || {};
  const currentVars = activeFrame.variables || {};

  // Extract variables
  const currentWord = currentVars['s'] ? String(currentVars['s']).replace(/['"]/g, '') : null;
  const sortedKey = currentVars['key'] ? String(currentVars['key']).replace(/['"]/g, '') : null;
  const iVal = currentVars['i'] !== undefined ? parseInt(currentVars['i']) : -1;

  // Extract strs array
  const strs: string[] = useMemo(() => {
    const firstFrame = frames[0] || {};
    const arrays = firstFrame.arrays || {};
    const inputStrs = arrays['strs'];
    if (Array.isArray(inputStrs)) {
      return inputStrs.map(s => String(s).replace(/['"]/g, ''));
    }
    return [];
  }, [frames]);

  // Extract HashMap
  const mapData = useMemo(() => {
    const maps = visualizerState.hashMaps || [];
    const mainMap = maps.find((m: any) => m.name === 'map') || maps[0];
    if (!mainMap) return [];

    return mainMap.entries.map(([key, valueStr]: [string, string]) => {
      const cleanedKey = key.replace(/['"]/g, '').trim();
      const words = valueStr
        .replace(/[\[\]]/g, '')
        .split(',')
        .map(w => w.trim().replace(/['"]/g, ''))
        .filter(Boolean);
      return { key: cleanedKey, words };
    });
  }, [visualizerState]);

  // Active bucket key
  const activeBucketKey = sortedKey;

  // Refs for scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeBucketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeBucketRef.current && scrollContainerRef.current) {
      activeBucketRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeBucketKey]);

  // Bubble explanation text for the active word/sorting panel
  const sortingBubbleText = useMemo(() => {
    if (!currentWord) return null;
    const code = (activeFrame.code || "").trim();

    if (code.includes('s = strs[i]')) {
      return `Pick word "${currentWord}" at index ${iVal}`;
    }
    if (code.includes('s.toCharArray()')) {
      return `Convert "${currentWord}" to character array`;
    }
    if (code.includes('Arrays.sort')) {
      return `Sort characters to generate signature key`;
    }
    if (code.includes('String.valueOf')) {
      return `Key signature resolved: "${sortedKey}"`;
    }
    return null;
  }, [currentWord, activeFrame.code, iVal, sortedKey]);

  // Bubble explanation for map insertion/retrieval
  const mapBubbleText = useMemo(() => {
    if (!activeBucketKey) return null;
    const code = (activeFrame.code || "").trim();

    if (code.includes('containsKey')) {
      const exists = mapData.some((g: any) => g.key === activeBucketKey);
      return exists ? `Key "${activeBucketKey}" exists in map!` : `Key "${activeBucketKey}" not found. Creating new group.`;
    }
    if (code.includes('put(')) {
      return `Initialized empty list for key "${activeBucketKey}"`;
    }
    if (code.includes('add(')) {
      return `Grouping "${currentWord}" into key "${activeBucketKey}"`;
    }
    return null;
  }, [activeBucketKey, activeFrame.code, currentWord, mapData]);

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 items-stretch justify-start min-h-[440px]">
      
      {/* ── LEFT PANEL: CURRENT WORD & SORTING TRANSFORMATION ── */}
      <div className="flex-1 flex flex-col gap-4 bg-slate-50 border border-slate-200/60 rounded-2xl p-5 shadow-inner select-none justify-between relative">
        <div>
          <span className="text-[10px] font-black uppercase text-indigo-650 tracking-widest font-mono">
            Active Processing Scope
          </span>
          <h4 className="text-sm font-extrabold text-slate-700 mt-1">Anagram Key Transformation</h4>
          
          {strs.length > 0 && iVal !== -1 && (
            <div className="text-[11px] text-slate-400 font-mono mt-1 font-bold">
              Input Index i = {iVal} (Word {iVal + 1} of {strs.length})
            </div>
          )}
        </div>

        {/* Word Transformation Visual */}
        <div className="my-6 flex flex-col items-center justify-center gap-4 relative pt-10">
          {sortingBubbleText && (
            <ContextBubble
              message={sortingBubbleText}
              variant="info"
              animation="pop"
              position="top"
              className="absolute top-0 left-1/2 transform -translate-x-1/2"
            />
          )}

          <AnimatePresence mode="wait">
            {currentWord ? (
              <motion.div
                key={`word-card-${currentWord}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Current Word
                </div>
                <div className="flex gap-1.5">
                  {currentWord.split('').map((char, idx) => (
                    <motion.div
                      key={`char-${idx}`}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="w-10 h-10 flex items-center justify-center bg-indigo-50 border border-indigo-200/50 rounded-xl text-indigo-700 font-bold text-lg font-mono shadow-sm"
                    >
                      {char}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="text-xs text-slate-400 italic">No active word selected</div>
            )}
          </AnimatePresence>

          {sortedKey && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3 w-full"
            >
              <div className="text-slate-350 text-xs">Arrays.sort() ↓</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Sorted Anagram Key
              </div>
              <div className="flex gap-1.5">
                {sortedKey.split('').map((char, idx) => (
                  <motion.div
                    key={`sort-char-${idx}`}
                    className="w-10 h-10 flex items-center justify-center bg-emerald-50 border border-emerald-250 rounded-xl text-emerald-700 font-black text-lg font-mono shadow-sm"
                  >
                    {char}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Strings Tracker */}
        <div className="border-t border-slate-200/60 pt-3">
          <div className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider font-mono mb-2">
            Input Array (strs)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {strs.map((w, idx) => {
              const isActive = idx === iVal;
              const isProcessed = idx < iVal;
              return (
                <div
                  key={`tracker-word-${idx}`}
                  className={`px-2 py-1 text-[11px] font-mono rounded-lg border font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm scale-105'
                      : isProcessed
                      ? 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  {w}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: SCROLLABLE GROUP ANAGRAMS HASHMAP (Two Sum Style) ── */}
      <div className="flex-1 flex flex-col gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm min-h-[350px]">
        <div>
          <span className="text-[10px] font-black uppercase text-emerald-650 tracking-widest font-mono">
            HashMap map [ {mapData.length} entries ]
          </span>
          <h4 className="text-sm font-extrabold text-slate-800 mt-1 font-sans-premium">Group Buckets</h4>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto max-h-[340px] flex flex-col gap-5 pr-2 scrollbar-thin select-none pt-4"
        >
          {mapData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic">
              HashMap is empty. Step into loop to populate anagram groups.
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {mapData.map((group: any) => {
                const isActive = group.key === activeBucketKey;
                
                // Styles matching Two Sum lookup/insertion states
                let cardClass = "border-slate-150 bg-white text-slate-800 shadow-sm";
                let keyColorClass = "text-slate-700 bg-slate-100 border border-slate-200/50";
                
                if (isActive) {
                  cardClass = "border-emerald-450 bg-emerald-50/20 text-emerald-950 ring-2 ring-emerald-500/10 shadow-md";
                  keyColorClass = "bg-emerald-600 text-white shadow-sm";
                }

                return (
                  <div
                    key={`map-group-container-${group.key}`}
                    ref={isActive ? activeBucketRef : null}
                    id={`anagram-group-bucket-${group.key}`}
                    className="relative pt-6 min-w-[200px]"
                  >
                    {isActive && mapBubbleText && (
                      <ContextBubble
                        message={mapBubbleText}
                        variant={mapBubbleText.includes('Grouping') ? 'success' : 'action'}
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
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border ${cardClass} transition-colors duration-300`}
                    >
                      {/* Key */}
                      <div className="flex flex-col items-start">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Key (Sorted)</span>
                        <span className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg ${keyColorClass}`}>
                          {group.key}
                        </span>
                      </div>

                      {/* Connecting Arrow */}
                      <div className="flex-1 flex items-center justify-center px-3">
                        {isActive ? (
                          <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm font-mono uppercase tracking-wider animate-pulse border border-emerald-400">
                            Update
                          </span>
                        ) : (
                          <svg className="w-8 h-3 text-slate-300" viewBox="0 0 32 12" fill="none">
                            <path d="M0 6 H 24 M 18 1 L 25 6 L 18 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>

                      {/* Value (List of Anagrams) */}
                      <div className="flex flex-col items-end max-w-[50%]">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Value (List)</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {group.words.map((w: string, wIdx: number) => {
                            const isNew = isActive && wIdx === group.words.length - 1;
                            return (
                              <motion.span
                                key={`word-badge-${group.key}-${wIdx}`}
                                initial={isNew ? { scale: 0.8, y: 3 } : { scale: 1, y: 0 }}
                                animate={{ scale: 1, y: 0 }}
                                className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold border ${
                                  isNew
                                    ? 'bg-purple-600 border-purple-700 text-white shadow-sm animate-bounce'
                                    : 'bg-white border-slate-205 text-slate-700'
                                }`}
                              >
                                {w}
                              </motion.span>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};
