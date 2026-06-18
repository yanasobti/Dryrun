import React from 'react';
import { motion } from 'framer-motion';

interface RecursionVisualizerProps {
  stackList?: any[];
  currentFrameIndex: number;
  frames: any[];
  trees?: any[];
}

export const RecursionVisualizer: React.FC<RecursionVisualizerProps> = ({
  stackList = [],
  currentFrameIndex,
  frames,
  trees
}) => {
  const getNodeValFromVars = (variables: Record<string, any>) => {
    const nodeEntries = Object.entries(variables).filter(([k]) => k !== 'args');
    for (const [k, v] of nodeEntries) {
      if (v === null || v === "null") {
        return { val: "Ø", name: k };
      }
      if (typeof v === 'string') {
        const match = v.match(/(?:#|id=)(\w+)/);
        if (match) {
          const refId = match[1];
          if (trees) {
            for (const tree of trees) {
              if (tree.nodes && tree.nodes[refId]) {
                return { val: tree.nodes[refId].val, name: k };
              }
            }
          }
        }
      }
    }
    return null;
  };



  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full flex items-center justify-between border-b border-slate-200/60 pb-2">
        <span className="text-sm font-semibold text-indigo-600 flex items-center gap-1.5 font-mono">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          recursion call stack & trace
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch min-h-[300px]">
        {/* Left Side: Tutor Explanation Card */}
        <div className="flex-1 w-full lg:w-[260px] flex flex-col gap-4 bg-indigo-50/30 border border-indigo-100/50 p-5 rounded-2xl shadow-sm text-left">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest font-mono">
            TUTOR INSIGHT
          </span>
          {(() => {
            const activeFrame = frames[currentFrameIndex];
            const explanation = activeFrame?.explanation;
            if (explanation) {
              return (
                <div className="flex flex-col gap-3">
                  <h4 className="text-sm font-extrabold text-slate-800 font-sans-premium">
                    {explanation.title || "Exploring Tree"}
                  </h4>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed font-sans-premium">
                    {explanation.explanation}
                  </p>
                  {explanation.why && (
                    <div className="bg-white/60 rounded-xl p-3 border border-indigo-100/35 text-[11px] text-slate-500 italic font-semibold leading-normal font-sans-premium">
                      {explanation.why}
                    </div>
                  )}
                  {explanation.stateVars && explanation.stateVars.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">
                        Tracked State
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {explanation.stateVars.map((v: any, idx: number) => (
                          <div key={idx} className="bg-indigo-100/40 border border-indigo-200/25 px-2 py-0.5 rounded-lg text-[9.5px] font-bold text-indigo-950 font-mono">
                            {v.name}: <span className="text-indigo-650 font-black">{v.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return (
              <div className="py-12 text-center text-xs text-slate-400 font-mono">
                Stepping through simulation...
              </div>
            );
          })()}
        </div>

        {/* Right Side: Current DFS Journey Indented Path */}
        <div className="flex-[1.5] w-full flex flex-col items-start bg-slate-50/30 border border-slate-200 rounded-2xl p-6 relative select-none">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 font-mono">
            Current DFS Journey
          </span>
          {(() => {
            const journeyNodes = stackList.map(sf => {
              const nodeInfo = getNodeValFromVars(sf.variables);
              return nodeInfo ? nodeInfo.val : sf.methodName;
            });

            if (journeyNodes.length === 0) {
              return (
                <div className="py-8 text-center text-xs text-slate-400 font-mono w-full">
                  No active recursion path.
                </div>
              );
            }

            return (
              <div className="flex flex-col items-start font-mono text-sm text-slate-700 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs w-full max-w-[420px] text-left">
                {journeyNodes.map((val, idx) => {
                  const isLast = idx === journeyNodes.length - 1;
                  const indent = "      ".repeat(idx);
                  const prefix = idx === 0 ? "■ " : "└── ";
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className={`${isLast ? 'text-indigo-655 font-black scale-[1.01]' : 'text-slate-500 font-bold'} flex items-center gap-2.5 h-8`}
                    >
                      <span className="whitespace-pre">{indent}{prefix}{val}</span>
                      {isLast && (
                        <span className="bg-indigo-100 text-indigo-700 border border-indigo-200/30 text-[9px] px-2 py-0.5 rounded-lg font-sans uppercase tracking-wider font-extrabold animate-pulse">
                          Active Node
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
