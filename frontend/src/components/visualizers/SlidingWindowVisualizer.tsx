import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { generateEducationalExplanation, getElementArray } from '../../utils/educationalNarrator';

interface SlidingWindowVisualizerProps {
  data: {
    steps: any[];
  };
  currentStep: number;
  questionId?: string;
}

const STRATEGIES = {
  'fixed_size_frequency_match': {
    name: "Fixed Size Frequency Match",
    objective: "Search for any permutation of the target string inside the window. Order of characters does not matter in a permutation.",
    rule: "Keep the window size fixed. As right pointer moves, expand right and shrink left to keep the window size constant.",
  },
  'unique_character_window': {
    name: "Unique Character Window",
    objective: "Find the longest segment of the string containing no duplicate characters.",
    rule: "Expand right to include characters. If a duplicate is detected, shrink left until all characters inside the window are unique.",
  },
  'replacement_budget_window': {
    name: "Replacement Budget Window",
    objective: "Find the longest segment we can make by replacing at most k characters to match the most frequent character.",
    rule: "Expand right. If replacements needed (window size minus the count of the most frequent character) exceeds the budget k, shrink from the left.",
  },
  'minimum_cover_window': {
    name: "Minimum Cover Window",
    objective: "Find the smallest window that contains all the required characters.",
    rule: "Expand right until the window contains all target characters. Then, shrink left as much as possible while keeping the window valid.",
  },
  'monotonic_queue_window': {
    name: "Monotonic Queue Window",
    objective: "Find the maximum value inside each sliding window of size k.",
    rule: "Use a decreasing queue to track the maximum element. Elements smaller than the new element are discarded.",
  }
};

export const SlidingWindowVisualizer: React.FC<SlidingWindowVisualizerProps> = ({
  data,
  currentStep,
  questionId: propQuestionId
}) => {
  if (!data || !data.steps || data.steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-450 font-mono italic">
        No trace data available.
      </div>
    );
  }

  const frames = data.steps;
  const step = frames[currentStep];
  const prevStep = currentStep > 0 ? frames[currentStep - 1] : null;

  const variables = step.variables || {};
  const prevVariables = prevStep ? prevStep.variables || {} : {};

  // 1. Identify Question and Strategy
  const questionId = useMemo(() => {
    if (propQuestionId) return propQuestionId;
    if (variables.k !== undefined && variables.maxCount !== undefined) {
      return 'longest-repeating-character-replacement';
    }
    if (variables.matches !== undefined || variables.s1Counts !== undefined) {
      return 'permutation-in-string';
    }
    if (variables.need !== undefined || variables.have !== undefined) {
      return 'minimum-window-substring';
    }
    if (variables.ri !== undefined || variables.q !== undefined) {
      return 'sliding-window-maximum';
    }
    return 'longest-substring-without-repeating-characters';
  }, [variables, propQuestionId]);

  const strategyKey = useMemo((): keyof typeof STRATEGIES => {
    switch (questionId) {
      case 'permutation-in-string':
        return 'fixed_size_frequency_match';
      case 'longest-substring-without-repeating-characters':
        return 'unique_character_window';
      case 'longest-repeating-character-replacement':
        return 'replacement_budget_window';
      case 'minimum-window-substring':
        return 'minimum_cover_window';
      case 'sliding-window-maximum':
        return 'monotonic_queue_window';
      default:
        return 'unique_character_window';
    }
  }, [questionId]);

  const strategyInfo = STRATEGIES[strategyKey];

  // 2. Extract Pointers
  const right = useMemo(() => {
    if (variables.right !== undefined) return parseInt(String(variables.right), 10);
    if (variables.i !== undefined) return parseInt(String(variables.i), 10);
    return 0;
  }, [variables]);

  const left = useMemo(() => {
    if (variables.left !== undefined) return parseInt(String(variables.left), 10);
    if (questionId === 'sliding-window-maximum') {
      const k = variables.k !== undefined ? parseInt(String(variables.k), 10) : 3;
      return Math.max(0, right - k + 1);
    }
    return 0;
  }, [variables, right, questionId]);

  // Extract Input array/string
  const elementsArray = useMemo(() => {
    return getElementArray(step, frames);
  }, [frames, step]);

  const sVal = useMemo(() => elementsArray.join(''), [elementsArray]);

  // Current Window Substrings
  const currentWindowSubStr = useMemo(() => {
    if (left < 0 || right < 0 || left > right || right >= elementsArray.length) return "";
    return sVal.substring(left, right + 1);
  }, [left, right, sVal, elementsArray]);

  // Educational Explanation
  const narration = useMemo(() => {
    return generateEducationalExplanation(
      questionId,
      variables,
      prevVariables,
      step.arrays || {},
      currentStep,
      frames.length,
      frames
    );
  }, [questionId, variables, prevVariables, step.arrays, currentStep, frames]);

  // Strategy-specific simple comparison (Current Check)
  const currentCheckView = useMemo(() => {
    switch (strategyKey) {
      case 'fixed_size_frequency_match': {
        let s1Str = "ab";
        for (const f of frames) {
          if (f.variables?.s1) {
            s1Str = String(f.variables.s1).replace(/['"]/g, '');
            break;
          }
        }
        
        // Window
        const windowStr = currentWindowSubStr;
        const targetFreq: Record<string, number> = {};
        for (const c of s1Str) targetFreq[c] = (targetFreq[c] || 0) + 1;
        const windowFreq: Record<string, number> = {};
        for (const c of windowStr) windowFreq[c] = (windowFreq[c] || 0) + 1;

        let matchingUniqueCount = 0;
        for (const char of Object.keys(targetFreq)) {
          if (targetFreq[char] === (windowFreq[char] || 0)) {
            matchingUniqueCount++;
          }
        }
        const totalUnique = Object.keys(targetFreq).length;
        const isPerfect = matchingUniqueCount === totalUnique;

        return (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-150">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold font-mono uppercase">Target Pattern</span>
                  <div className="flex gap-1 mt-1">
                    {s1Str.split('').map((char, idx) => (
                      <span key={idx} className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold flex items-center justify-center text-xs">
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-slate-350 text-lg font-bold font-mono">&harr;</div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold font-mono uppercase">Current Window</span>
                  <div className="flex gap-1 mt-1">
                    {windowStr.split('').map((char, idx) => {
                      const isInTarget = s1Str.includes(char);
                      const borderCol = isInTarget ? "border-emerald-350 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500";
                      return (
                        <span key={idx} className={`w-7 h-7 rounded-lg border font-mono font-bold flex items-center justify-center text-xs ${borderCol}`}>
                          {char}
                        </span>
                      );
                    })}
                    {windowStr.length === 0 && <span className="text-xs text-slate-400 italic font-mono h-7 flex items-center">empty</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${
                  isPerfect 
                    ? "bg-emerald-50 border-emerald-250 text-emerald-800" 
                    : "bg-rose-50 border-rose-250 text-rose-800"
                }`}>
                  {isPerfect ? "✅ Perfect Match" : "❌ No Match"}
                </span>
              </div>
            </div>
          </div>
        );
      }

      case 'unique_character_window': {
        const uniqueSet = new Set<string>();
        let duplicateChar: string | null = null;
        for (const char of currentWindowSubStr) {
          if (uniqueSet.has(char)) {
            duplicateChar = char;
          }
          uniqueSet.add(char);
        }

        return (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold font-mono uppercase">Window Letters:</span>
                <div className="flex gap-1">
                  {currentWindowSubStr.split('').map((char, idx) => {
                    const isDup = char === duplicateChar;
                    const borderCol = isDup ? "border-rose-450 bg-rose-50 text-rose-800 font-black animate-pulse" : "border-indigo-150 bg-indigo-50 text-indigo-700";
                    return (
                      <span key={idx} className={`w-7 h-7 rounded-lg border font-mono font-bold flex items-center justify-center text-xs ${borderCol}`}>
                        {char}
                      </span>
                    );
                  })}
                  {currentWindowSubStr.length === 0 && <span className="text-xs text-slate-400 italic font-mono">empty</span>}
                </div>
              </div>

              <div>
                {duplicateChar ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider bg-rose-50 border-rose-250 text-rose-800">
                    ❌ Duplicate found: '{duplicateChar}'
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider bg-emerald-50 border-emerald-250 text-emerald-800">
                    ✅ All Unique
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'replacement_budget_window': {
        const k = variables.k !== undefined ? parseInt(String(variables.k), 10) : 0;
        
        const freq: Record<string, number> = {};
        for (const char of currentWindowSubStr) {
          freq[char] = (freq[char] || 0) + 1;
        }

        let maxCount = 0;
        let maxChar = "";
        for (const [char, val] of Object.entries(freq)) {
          if (val > maxCount) {
            maxCount = val;
            maxChar = char;
          }
        }

        const len = currentWindowSubStr.length;
        const replacements = len - maxCount;
        const isValid = replacements <= k;

        return (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-450 font-bold uppercase text-[9px] font-mono">Window:</span>
                <span className="font-mono font-extrabold text-slate-700">"{currentWindowSubStr || '-'}"</span>
              </div>
              <div className="w-px h-3.5 bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-1">
                <span className="text-slate-450 font-semibold">Most Freq:</span>
                <span className="font-mono bg-indigo-50 border border-indigo-150 text-indigo-700 px-1.5 py-0.5 rounded font-black text-[11px]">
                  {maxChar ? `'${maxChar}' (${maxCount})` : 'none'}
                </span>
              </div>
              <div className="w-px h-3.5 bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-1">
                <span className="text-slate-450 font-semibold">Replacements needed:</span>
                <span className="font-mono text-slate-700 font-bold">{replacements}</span>
              </div>
              <div className="w-px h-3.5 bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-1">
                <span className="text-slate-450 font-semibold">Budget (k):</span>
                <span className="font-mono text-slate-700 font-bold">{k}</span>
              </div>
            </div>

            <div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${
                isValid 
                  ? "bg-emerald-50 border-emerald-250 text-emerald-800" 
                  : "bg-rose-50 border-rose-250 text-rose-800"
              }`}>
                {isValid ? "✅ Valid" : "❌ Invalid"}
              </span>
            </div>
          </div>
        );
      }

      case 'minimum_cover_window': {
        const have = variables.have !== undefined ? parseInt(String(variables.have), 10) : 0;
        const need = variables.need !== undefined ? parseInt(String(variables.need), 10) : 0;
        const isValid = have === need && need > 0;

        return (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-450 font-bold uppercase text-[9px] font-mono">Character Matches:</span>
              <span className="font-mono text-[11px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-black text-slate-700">
                {have} / {need}
              </span>
            </div>
            <div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${
                isValid 
                  ? "bg-emerald-50 border-emerald-250 text-emerald-800" 
                  : "bg-rose-50 border-rose-250 text-rose-800"
              }`}>
                {isValid ? "✅ Contains All" : "❌ Missing Target"}
              </span>
            </div>
          </div>
        );
      }

      case 'monotonic_queue_window': {
        const dequeVal = step.objects?.['q'] || step.arrays?.['q'] || [];
        const qIndices = Array.isArray(dequeVal) ? dequeVal.map(x => parseInt(String(x), 10)) : [];
        const currentMaxVal = qIndices.length > 0 && elementsArray[qIndices[0]] !== undefined 
          ? elementsArray[qIndices[0]] 
          : "-";

        return (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-450 font-bold uppercase text-[9px] font-mono">Window Values:</span>
              <div className="flex gap-1.5 font-mono text-slate-700">
                {currentWindowSubStr.split('').map((_, idx) => {
                  const val = elementsArray[left + idx];
                  const isMax = String(val) === String(currentMaxVal);
                  const borderCol = isMax ? "border-indigo-400 bg-indigo-50 text-indigo-800 font-extrabold" : "border-slate-200 bg-white text-slate-500";
                  return (
                    <span key={idx} className={`px-2 py-0.5 rounded border text-xs ${borderCol}`}>
                      {val}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-slate-450 font-semibold">Window Max:</span>
              <span className="font-mono text-indigo-700 font-extrabold text-[13px] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {currentMaxVal}
              </span>
            </div>
          </div>
        );
      }
    }
  }, [strategyKey, currentWindowSubStr, right, left, elementsArray, variables, frames]);

  // Target objective strings
  const targetLabelText = useMemo(() => {
    if (questionId === 'permutation-in-string') {
      let s1Str = "ab";
      for (const f of frames) {
        if (f.variables?.s1) {
          s1Str = String(f.variables.s1).replace(/['"]/g, '');
          break;
        }
      }
      return `Find a permutation of "${s1Str}"`;
    }
    if (questionId === 'minimum-window-substring') {
      let tStr = "ABC";
      for (const f of frames) {
        if (f.variables?.t) {
          tStr = String(f.variables.t).replace(/['"]/g, '');
          break;
        }
      }
      return `Find the minimum window containing all characters of "${tStr}"`;
    }
    if (questionId === 'longest-repeating-character-replacement') {
      const k = variables.k !== undefined ? parseInt(String(variables.k), 10) : 0;
      return `Find the longest identical character segment (k = ${k} budget)`;
    }
    if (questionId === 'sliding-window-maximum') {
      const k = variables.k !== undefined ? parseInt(String(variables.k), 10) : 3;
      return `Find the maximum value inside each window of size ${k}`;
    }
    return "Find the longest substring without repeating characters";
  }, [questionId, variables, frames]);

  // Calculate container horizontal scroll width helper
  const totalGridWidth = useMemo(() => {
    return `calc(${elementsArray.length * 48}px + 40px)`;
  }, [elementsArray]);

  return (
    <div className="w-full flex flex-col gap-6 select-none bg-slate-50/10 p-4 rounded-2xl border border-slate-200 shadow-3xs animate-fade-in text-slate-700 shrink-0">
      
      {/* 1. Goal Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs shrink-0">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider font-mono bg-indigo-50 border border-indigo-150 text-indigo-700 px-2 py-0.5 rounded">
            🎯 Goal
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-400 ml-auto">Step {currentStep + 1} / {frames.length}</span>
        </div>
        <h3 className="text-sm font-extrabold text-slate-800 font-sans leading-tight">
          {targetLabelText}
        </h3>
        <p className="text-xs text-slate-500 font-sans leading-relaxed mt-1">{strategyInfo.objective}</p>
        
        {/* Helper permutations block */}
        {questionId === 'permutation-in-string' && (
          <div className="mt-2.5 text-[10px] text-slate-500 font-mono bg-slate-50 px-2.5 py-1.5 rounded border border-slate-100 flex flex-wrap gap-1.5 items-center">
            <strong>Permutations contain the same letters (order doesn't matter). Examples:</strong>
            <span className="bg-white px-1.5 py-0.5 rounded border text-indigo-650 font-bold">ab</span>
            <span className="bg-white px-1.5 py-0.5 rounded border text-indigo-650 font-bold">ba</span>
          </div>
        )}
      </div>

      {/* 2. Sliding Window Strip (THE STAR OF THE SCREEN) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col gap-1 items-stretch overflow-visible shrink-0">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
            📦 Sliding Window
          </span>
          {currentWindowSubStr && (
            <span className="text-xs font-mono font-black text-indigo-650 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-lg shadow-3xs">
              Current Window = "{currentWindowSubStr}"
            </span>
          )}
        </div>

        {/* Single scrollable container holding both bubble and letters row to ensure they scroll together */}
        <div className="w-full bg-slate-50/50 rounded-xl border border-slate-150/60 p-5 overflow-x-auto relative flex flex-col items-stretch justify-start min-h-[200px] shrink-0">
          
          {/* Scrollable inner wrapper stretching to full elements width */}
          <div className="flex flex-col items-stretch overflow-visible shrink-0 relative" style={{ minWidth: totalGridWidth }}>
            
            {/* Top Row: Floating tutor bubble (glides horizontally inside the scroll area) */}
            <div className="w-full h-28 relative overflow-visible mb-2 shrink-0">
              {left !== -1 && right !== -1 && left <= right && (
                <motion.div
                  initial={false}
                  animate={{
                    left: `max(160px, min(calc(100% - 160px), calc(20px + ${((left + right) / 2) * (100 / elementsArray.length)}% + 22px)))`,
                  }}
                  transition={{ type: "spring", stiffness: 100, damping: 18 }}
                  className="absolute bottom-2 -translate-x-1/2 w-64 bg-indigo-900 border border-indigo-950 text-white rounded-xl shadow-lg p-2.5 z-30 pointer-events-auto flex flex-col gap-0.5 text-[10px] font-medium leading-relaxed"
                >
                  {/* Downward triangle pointing to elements below */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-indigo-900" />
                  
                  {narration.title && (
                    <div className="font-extrabold text-[8.5px] uppercase tracking-wider text-indigo-300 border-b border-indigo-800/80 pb-0.5 mb-0.5 flex items-center gap-1">
                      <span>💬</span>
                      <span>{narration.title}</span>
                    </div>
                  )}
                  <div className="font-bold text-slate-100 text-[10.5px] leading-snug">{narration.explanation}</div>
                  {narration.why && (
                    <div className="text-[9.5px] text-indigo-200/90 italic border-l border-indigo-650 pl-1.5 mt-0.5 font-medium leading-tight">
                      💡 {narration.why}
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Bottom Row: Letters grid strip (aligning elements from start using justify-start) */}
            <div className="w-full flex justify-start items-center gap-1.5 min-h-[64px] relative overflow-visible shrink-0 pt-4 pb-2">
              
              {/* Visual Overlay boundary highlighting */}
              {left !== -1 && right !== -1 && left <= right && (
                <div className="absolute inset-y-0 border-2 border-indigo-400 bg-indigo-50/10 rounded-xl pointer-events-none z-0"
                     style={{
                       left: `calc(20px + ${left * (100 / elementsArray.length)}%)`,
                       width: `calc(${(right - left + 1) * (100 / elementsArray.length)}% - 8px)`,
                     }}
                />
              )}

              {elementsArray.map((val, idx) => {
                const isLeft = idx === left;
                const isRight = idx === right;
                const inWindow = idx >= left && idx <= right;

                let cellClass = "bg-white border-slate-250 text-slate-700 shadow-3xs";
                if (isLeft) {
                  cellClass = "bg-cyan-50 border-cyan-400 text-cyan-800 ring-2 ring-cyan-500/10 font-black scale-105 shadow-2xs z-10";
                } else if (isRight) {
                  cellClass = "bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-500/10 font-black scale-105 shadow-2xs z-10";
                } else if (inWindow) {
                  cellClass = "bg-indigo-50/50 border-indigo-300 text-indigo-950 font-bold z-10";
                }

                return (
                  <div key={idx} className="flex flex-col items-center flex-1 min-w-10 max-w-14 relative shrink-0">
                    
                    {/* Large letter box */}
                    <motion.div
                      layout
                      className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center font-mono text-sm font-extrabold transition-all duration-300 ${cellClass} shrink-0`}
                    >
                      <span>{val}</span>
                      {inWindow && (
                        <span className="text-[7.5px] font-black opacity-80 uppercase leading-none mt-0.5">
                          {isLeft && isRight ? 'L,R' : (isLeft ? 'L' : isRight ? 'R' : '')}
                        </span>
                      )}
                    </motion.div>

                    {/* Index label or Pointer Arrow */}
                    <div className="h-5 flex items-center justify-center mt-1.5 shrink-0">
                      {isLeft || isRight ? (
                        <motion.span
                          animate={{ y: [1, -1, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className={`text-xs font-black ${isLeft ? 'text-cyan-600' : 'text-rose-600'}`}
                        >
                          &uarr;
                        </motion.span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400 font-mono">{idx}</span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

      {/* 3. Current Check Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs flex flex-col gap-2 shrink-0">
        <div className="border-b border-slate-100 pb-1.5 mb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
            🔍 Current Check
          </span>
        </div>
        {currentCheckView}
      </div>

    </div>
  );
};

export default SlidingWindowVisualizer;
