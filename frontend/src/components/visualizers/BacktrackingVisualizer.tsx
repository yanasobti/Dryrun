import React, { useMemo } from 'react';

interface BacktrackingVisualizerProps {
  variables: Record<string, any>;
}

export const BacktrackingVisualizer: React.FC<BacktrackingVisualizerProps> = ({ variables }) => {
  // Extract key backtracking variables
  const nums = useMemo(() => {
    const arr = variables['nums'];
    if (Array.isArray(arr)) return arr;
    if (typeof arr === 'string') {
      return arr.replace(/[\[\]]/g, '').split(',').map(x => x.trim()).filter(Boolean);
    }
    return [];
  }, [variables]);

  const tempList = useMemo(() => {
    const list = variables['tempList'] || variables['path'] || variables['subset'] || [];
    const listStr = String(list);
    if (listStr.startsWith('[') && listStr.endsWith(']')) {
      return listStr.substring(1, listStr.length - 1).split(',').map(x => x.trim()).filter(Boolean);
    }
    return [];
  }, [variables]);

  const resultList = useMemo(() => {
    const res = variables['result'] || variables['ans'] || [];
    const resStr = String(res);
    if (resStr.startsWith('[') && resStr.endsWith(']')) {
      // Parse nested arrays like [[], [1], [1, 2]]
      const clean = resStr.substring(1, resStr.length - 1).trim();
      const list: string[] = [];
      let depth = 0;
      let startIdx = 0;
      for (let i = 0; i < clean.length; i++) {
        if (clean[i] === '[') {
          if (depth === 0) startIdx = i;
          depth++;
        } else if (clean[i] === ']') {
          depth--;
          if (depth === 0) {
            list.push(clean.substring(startIdx, i + 1));
          }
        }
      }
      return list;
    }
    return [];
  }, [variables]);

  const startVal = variables['start'] !== undefined ? parseInt(variables['start']) : -1;

  return (
    <div className="w-full flex flex-col items-center p-4 bg-slate-50 border border-slate-200/60 rounded-xl shadow-inner">
      <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
        Backtracking State Tracker
      </div>

      {/* Input Array with choices */}
      <div className="w-full flex flex-col items-center mb-4">
        <div className="text-[10px] text-slate-400 font-mono mb-1">INPUT ELEMENTS (start = {startVal})</div>
        <div className="flex gap-2">
          {nums.map((num, idx) => {
            const isIncluded = tempList.includes(String(num));
            const isCursor = idx === startVal;

            return (
              <div
                key={`num-choice-${idx}`}
                className={`relative px-3 py-1.5 border rounded-lg text-xs font-mono transition-all duration-300 ${isIncluded ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-bold scale-105 shadow-sm' : 'bg-white border-slate-200 text-slate-400'} ${isCursor ? 'ring-2 ring-sky-400 ring-offset-1' : ''}`}
              >
                {num}
                {isIncluded && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Choice Path */}
      <div className="w-full bg-white border border-slate-100 rounded-lg p-3 mb-4 shadow-sm">
        <div className="text-[9px] text-slate-400 font-mono uppercase mb-1.5">Current Stack Path (tempList)</div>
        <div className="flex flex-wrap items-center gap-1.5 min-h-[28px]">
          {tempList.length === 0 ? (
            <span className="text-xs text-slate-300 italic font-mono">[empty]</span>
          ) : (
            tempList.map((item, idx) => (
              <React.Fragment key={`path-item-${idx}`}>
                {idx > 0 && <span className="text-[10px] text-slate-300 font-black">→</span>}
                <div className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[11px] font-mono font-bold">
                  {item}
                </div>
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      {/* Results Accumulator */}
      <div className="w-full">
        <div className="text-[9px] text-slate-400 font-mono uppercase mb-1.5">Solutions Found ({resultList.length})</div>
        <div className="flex flex-wrap gap-1 max-h-[120px] overflow-y-auto p-1 bg-white border border-slate-100 rounded-lg">
          {resultList.length === 0 ? (
            <div className="text-[10px] text-slate-300 italic p-1">No solutions added yet</div>
          ) : (
            resultList.map((res, idx) => (
              <div
                key={`result-${idx}`}
                className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono rounded"
              >
                {res}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
