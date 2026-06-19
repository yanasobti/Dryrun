import React, { useMemo } from 'react';

interface LongestConsecutiveSequenceVisualizerProps {
  frames: any[];
  currentFrameIndex: number;
  visualizerState: any;
}

export const LongestConsecutiveSequenceVisualizer: React.FC<LongestConsecutiveSequenceVisualizerProps> = ({
  frames,
  currentFrameIndex,
  visualizerState
}) => {
  const activeFrame = frames[currentFrameIndex] || {};
  const variables = activeFrame.variables || {};

  // Extract variables
  const numVal = variables['num'] !== undefined ? parseInt(String(variables['num']), 10) : null;
  const currentNumVal = variables['currentNum'] !== undefined ? parseInt(String(variables['currentNum']), 10) : null;
  const currentStreakVal = variables['currentStreak'] !== undefined ? parseInt(String(variables['currentStreak']), 10) : null;
  const longestStreakVal = variables['longestStreak'] !== undefined ? parseInt(String(variables['longestStreak']), 10) : 0;
  const iVal = variables['i'] !== undefined ? parseInt(String(variables['i']), 10) : -1;

  // Extract nums array
  const nums: number[] = useMemo(() => {
    const arr = visualizerState.arrays.find((a: any) => a.name === 'nums');
    if (arr && Array.isArray(arr.values)) {
      return arr.values.map((v: any) => parseInt(String(v), 10));
    }
    const firstFrame = frames[0] || {};
    const firstArrays = firstFrame.arrays || {};
    const inputNums = firstArrays['nums'];
    if (Array.isArray(inputNums)) {
      return inputNums.map((v: any) => parseInt(String(v), 10));
    }
    return [];
  }, [visualizerState, frames]);

  // Extract HashSet numSet values
  const hashSetValues: number[] = useMemo(() => {
    const sets = visualizerState.hashSets || [];
    const numSetObj = sets.find((s: any) => s.name === 'numSet') || sets[0];
    if (numSetObj && Array.isArray(numSetObj.values)) {
      return numSetObj.values.map((v: any) => parseInt(String(v), 10));
    }
    return [];
  }, [visualizerState]);

  const hashSetSet = useMemo(() => new Set<number>(hashSetValues), [hashSetValues]);

  // Predecessor state
  const predVal = numVal !== null ? numVal - 1 : null;
  const predExists = predVal !== null ? hashSetSet.has(predVal) : false;

  // Active sequence array build-up
  const activeSequence = useMemo(() => {
    if (numVal === null || predExists) return [];
    const elements: number[] = [];
    const maxVal = currentNumVal !== null ? currentNumVal : numVal;
    for (let val = numVal; val <= maxVal; val++) {
      elements.push(val);
    }
    return elements;
  }, [numVal, currentNumVal, predExists]);

  // Check if next element exists
  const nextTarget = currentNumVal !== null ? currentNumVal + 1 : (numVal !== null ? numVal + 1 : null);
  const nextExists = nextTarget !== null ? hashSetSet.has(nextTarget) : false;

  return (
    <div className="w-full flex flex-col items-center bg-white rounded-2xl border border-slate-200 p-5 shadow-sm select-none text-slate-700">
      
      {/* Header */}
      <div className="w-full flex flex-col pb-3 mb-4 border-b border-slate-100">
        <span className="text-[10px] font-black tracking-widest text-purple-600 uppercase font-mono">
          Interactive Streak Builder
        </span>
        <h2 className="text-base font-bold text-slate-800">
          Longest Consecutive Sequence Visualizer
        </h2>
      </div>

      {/* Main Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Nums array, Sequence Discovery, and Streak Dashboard */}
        <div className="md:col-span-7 flex flex-col gap-4">
          
          {/* Nums input visualization */}
          <div className="bg-slate-50 border border-slate-150 rounded-xl p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block mb-2">
              Input Array (nums)
            </span>
            <div className="flex flex-wrap gap-2">
              {nums.map((v, idx) => {
                const isActive = idx === iVal;
                return (
                  <div
                    key={idx}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono text-xs font-bold border transition-all duration-200 ${
                      isActive 
                        ? 'bg-purple-600 text-white border-purple-700 ring-2 ring-purple-300 scale-105 shadow-sm'
                        : 'bg-white text-slate-800 border-slate-200'
                    }`}
                  >
                    {v}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sequence & Streak Build Visualizer */}
          <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex-1 flex flex-col justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block mb-1">
                Sequence Discovery & Streak Build-Up
              </span>
              {numVal !== null && !predExists ? (
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex items-center flex-wrap gap-1.5 p-3 bg-white border border-slate-200 rounded-lg shadow-inner min-h-[56px]">
                    {activeSequence.map((v, sIdx) => (
                      <React.Fragment key={v}>
                        {sIdx > 0 && <span className="text-slate-450 font-black font-sans">→</span>}
                        <span className="w-9 h-9 rounded-md bg-purple-600 text-white font-mono font-bold flex items-center justify-center text-xs shadow-xs">
                          {v}
                        </span>
                      </React.Fragment>
                    ))}
                    
                    {nextTarget !== null && (
                      <>
                        <span className="text-slate-450 font-black font-sans">→</span>
                        <span className={`w-9 h-9 rounded-md font-mono font-bold flex items-center justify-center text-xs border ${
                          nextExists 
                            ? 'bg-amber-105 text-amber-800 border-amber-300 animate-pulse'
                            : 'bg-slate-100 text-slate-350 border-slate-200 border-dashed'
                        }`}>
                          {nextTarget}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-[10.5px] text-slate-600 font-mono">
                    {nextExists 
                      ? `Found next value: ${nextTarget} in HashSet (Streak increases!)`
                      : `Next target element ${nextTarget} not found in HashSet. Sequence complete.`}
                  </div>
                </div>
              ) : numVal !== null && predExists ? (
                <div className="bg-blue-50 border border-blue-150 rounded-lg p-3 text-[11px] text-blue-800 font-sans mt-2">
                  <span className="font-bold block text-[10px] uppercase font-mono tracking-wider text-blue-600 mb-1">Optimization Skip</span>
                  Predecessor <strong>{predVal}</strong> exists in HashSet. This means <strong>{numVal}</strong> is part of a sequence started earlier. Skipping to maintain O(N) complexity.
                </div>
              ) : (
                <div className="text-xs text-slate-450 italic mt-2">No number selected yet. Step through the DryRun to begin.</div>
              )}
            </div>

            {/* Streak Dashboard at the bottom of Left Panel */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-around text-xs mt-auto">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Current Streak:</span>
                <span className="font-bold text-slate-800 font-mono text-sm bg-slate-55 px-2.5 py-0.5 rounded border border-slate-150">
                  {numVal === null ? 0 : (predExists ? 0 : (currentStreakVal ?? 1))}
                </span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Longest Streak:</span>
                <span className="font-black text-emerald-600 font-mono text-sm bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-150">
                  {longestStreakVal}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: HashSet Lookup Table */}
        <div className="md:col-span-5 flex flex-col bg-slate-50 border border-slate-150 rounded-xl p-4 justify-between gap-4">
          
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
              HashSet Lookup Table
            </span>
            <p className="text-[10px] text-slate-500 font-sans italic leading-tight">
              ⚠️ HashSet does NOT preserve insertion order. Values are stored unsorted for O(1) constant time lookups.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 p-3 bg-white border border-slate-200 rounded-lg flex-1 min-h-[120px] items-start align-content-start">
            {hashSetValues.map((v, idx) => {
              const isNumTarget = v === numVal;
              const isPredecessorTarget = v === predVal;
              const isNextTarget = v === nextTarget;
              
              let highlightClass = 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-350';
              if (isNumTarget) {
                highlightClass = 'bg-purple-50 text-purple-700 border-purple-300 font-bold ring-2 ring-purple-200';
              } else if (isPredecessorTarget) {
                highlightClass = 'bg-blue-50 text-blue-700 border-blue-300 font-bold';
              } else if (isNextTarget) {
                highlightClass = 'bg-amber-50 text-amber-700 border-amber-300 font-bold';
              }

              return (
                <span
                  key={idx}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-all duration-200 ${highlightClass}`}
                >
                  {v}
                </span>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[9px] font-mono text-slate-400 border-t border-slate-200/60 pt-2.5">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-purple-50 border border-purple-300 inline-block" />
              <span>Active Target</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-blue-50 border border-blue-300 inline-block" />
              <span>Predecessor</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-50 border border-amber-300 inline-block" />
              <span>Next Lookup</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
