import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface CycleDetectionVisualizerProps {
  frames: any[];
  visualizerState: any;
  preset?: any;
  paramInputs?: Record<string, string>;
}

export const CycleDetectionVisualizer: React.FC<CycleDetectionVisualizerProps> = ({
  frames,
  visualizerState,
  preset,
  paramInputs
}) => {
  const currentVars = visualizerState?.variables || {};

  // Retrieve raw array input
  const numsArray = useMemo(() => {
    const fromFrames = frames.find(f => f.arrays?.nums)?.arrays?.nums;
    if (fromFrames && fromFrames.length > 0) return fromFrames.map(Number);
    const rawVal = paramInputs?.nums || preset?.inputs?.nums;
    if (rawVal) {
      return rawVal.split(',').map((x: string) => Number(x.trim()));
    }
    return [];
  }, [frames, preset, paramInputs]);

  // Extract tortoise and hare pointer values
  const slow = currentVars.slow !== undefined ? Number(currentVars.slow) : -1;
  const fast = currentVars.fast !== undefined ? Number(currentVars.fast) : -1;
  const slow2 = currentVars.slow2 !== undefined ? Number(currentVars.slow2) : -1;

  // Build the transition chain starting from index 0
  const chain = useMemo(() => {
    const list: { index: number; value: number }[] = [];
    if (numsArray.length === 0) return { list, hasCycle: false, cycleStartIdx: -1 };

    const visited = new Set<number>();
    let curr = 0;

    // Follow hops: next index is numsArray[curr]
    while (curr >= 0 && curr < numsArray.length && !visited.has(curr)) {
      visited.add(curr);
      const nextVal = numsArray[curr];
      list.push({ index: curr, value: nextVal });
      curr = nextVal;
    }

    const hasCycle = curr >= 0 && curr < numsArray.length && visited.has(curr);
    const cycleStartIdx = hasCycle ? list.findIndex(node => node.index === curr) : -1;

    return { list, hasCycle, cycleStartIdx };
  }, [numsArray]);

  const distanceBack = useMemo(() => {
    if (chain.cycleStartIdx === -1) return 0;
    const stepsBack = (chain.list.length - 1) - chain.cycleStartIdx;
    return stepsBack * 128; // w-16 + gap-16 = 128px per step
  }, [chain]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-1 font-sans">
      <div className="text-center border-b border-slate-100 pb-2.5">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Floyd's Cycle Detection • Tortoise & Hare Algorithm
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-6">
        {/* Top: Array values display */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] text-slate-400 font-black uppercase font-mono tracking-wider">Input Array</span>
          <div className="flex gap-2.5 overflow-x-auto py-1">
            {numsArray.map((val: number, idx: number) => {
              const isSlowAtIdx = slow === idx || slow2 === idx;
              const isFastAtIdx = fast === idx;

              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center bg-slate-50/50 border rounded-xl p-3 min-w-[56px] transition-all relative ${
                    isSlowAtIdx && isFastAtIdx
                      ? 'border-purple-400 bg-purple-50/30 ring-2 ring-purple-500/10'
                      : isSlowAtIdx
                      ? 'border-cyan-400 bg-cyan-50/30 ring-2 ring-cyan-500/10'
                      : isFastAtIdx
                      ? 'border-rose-400 bg-rose-50/30 ring-2 ring-rose-500/10'
                      : 'border-slate-150'
                  }`}
                >
                  <span className="text-[9px] font-black text-slate-400 font-mono mb-1">Index {idx}</span>
                  <span className="text-sm font-black text-slate-800 font-mono">{val}</span>

                  {/* Pointer overlay badges */}
                  <div className="absolute -bottom-2 flex gap-1 justify-center z-10">
                    {slow === idx && (
                      <span className="px-1 py-0.5 rounded text-[8px] font-black bg-cyan-500 text-white font-mono uppercase tracking-wider shadow-xs">
                        slow
                      </span>
                    )}
                    {slow2 === idx && (
                      <span className="px-1 py-0.5 rounded text-[8px] font-black bg-emerald-500 text-white font-mono uppercase tracking-wider shadow-xs">
                        slow2
                      </span>
                    )}
                    {fast === idx && (
                      <span className="px-1 py-0.5 rounded text-[8px] font-black bg-rose-500 text-white font-mono uppercase tracking-wider shadow-xs">
                        fast
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom: Hops Node Graph Visualizer */}
        <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-5">
          <span className="text-[10px] text-slate-400 font-black uppercase font-mono tracking-wider">Hops Trace Graph (next = nums[curr])</span>

          <div className="w-full overflow-x-auto py-10 px-6 flex justify-start items-center min-h-[220px] select-none scrollbar-thin">
            <div className="flex items-center gap-16 relative">
              {chain.list.map((node, idx) => {
                const isSlowAtNode = slow === node.index || slow2 === node.index;
                const isFastAtNode = fast === node.index;
                const isLast = idx === chain.list.length - 1;

                return (
                  <div key={idx} className="flex items-center relative z-10">
                    {/* Node circle */}
                    <div className="flex flex-col items-center relative w-16">
                      {/* Floating pointer tag labels */}
                      <div className="absolute top-[-36px] flex flex-col gap-1 items-center h-8 justify-end">
                        {slow === node.index && (
                          <span className="px-2 py-0.5 rounded text-[8.5px] font-black font-mono border shadow-sm uppercase tracking-wider bg-cyan-500 text-white border-cyan-400">
                            slow
                          </span>
                        )}
                        {slow2 === node.index && (
                          <span className="px-2 py-0.5 rounded text-[8.5px] font-black font-mono border shadow-sm uppercase tracking-wider bg-emerald-500 text-white border-emerald-400">
                            slow2
                          </span>
                        )}
                        {fast === node.index && (
                          <span className="px-2 py-0.5 rounded text-[8.5px] font-black font-mono border shadow-sm uppercase tracking-wider bg-rose-500 text-white border-rose-400">
                            fast
                          </span>
                        )}
                      </div>

                      {/* Bubble index-value visual */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center font-mono transition-all duration-300 ${
                          isSlowAtNode && isFastAtNode
                            ? 'border-purple-500 bg-purple-50 text-purple-700 ring-4 ring-purple-500/15 shadow-md'
                            : isSlowAtNode
                            ? 'border-cyan-500 bg-cyan-50 text-cyan-700 ring-4 ring-cyan-500/15 shadow-md'
                            : isFastAtNode
                            ? 'border-rose-500 bg-rose-50 text-rose-700 ring-4 ring-rose-500/15 shadow-md'
                            : 'border-slate-200 bg-white text-slate-800 shadow-sm'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 font-bold">idx {node.index}</span>
                        <span className="text-sm font-black text-slate-800 leading-none mt-0.5">&rarr; {node.value}</span>
                      </motion.div>
                    </div>

                    {/* Arrow to next transition */}
                    {!isLast && (
                      <div className="absolute left-14 w-16 h-8 flex items-center pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 64 32" fill="none">
                          <path
                            d="M0 16 H 56"
                            stroke={(isSlowAtNode || isFastAtNode) ? "#6366f1" : "#cbd5e1"}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M48 10 L 56 16 L 48 22"
                            stroke={(isSlowAtNode || isFastAtNode) ? "#6366f1" : "#cbd5e1"}
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Loop cycle back line */}
                    {isLast && chain.hasCycle && chain.cycleStartIdx !== -1 && (
                      <div className="absolute left-8 w-[240px] h-[100px] pointer-events-none z-0">
                        <svg className="w-full h-full overflow-visible" fill="none">
                          <motion.path
                            initial={{ strokeDasharray: "6, 6", strokeDashoffset: 100 }}
                            animate={{ strokeDashoffset: 0 }}
                            transition={{ repeat: Infinity, ease: "linear", duration: 4 }}
                            d={`M 0 28 C 40 100, ${-distanceBack - 40} 100, ${-distanceBack} 28`}
                            stroke="#f43f5e"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          <path
                            d={`M ${-distanceBack + 4} 38 L ${-distanceBack} 28 L ${-distanceBack - 6} 36`}
                            stroke="#f43f5e"
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleDetectionVisualizer;
