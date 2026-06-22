import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface LargestRectangleVisualizerProps {
  visualizerState: any;
}

export const LargestRectangleVisualizer: React.FC<LargestRectangleVisualizerProps> = ({
  visualizerState
}) => {
  const variables = visualizerState?.variables || {};

  // Retrieve heights array
  const heightsArray = visualizerState?.arrays?.find((a: any) => a.name === 'heights');
  const heights: number[] = heightsArray ? heightsArray.values.map(Number) : [];

  // Active stack of indices
  const activeStack = useMemo(() => {
    if (visualizerState?.stacks && visualizerState.stacks.length > 0) {
      return visualizerState.stacks[0];
    }
    return null;
  }, [visualizerState?.stacks]);
  const stackValues: number[] = activeStack ? activeStack.values.map(Number) : [];

  const maxVal = useMemo(() => {
    if (heights.length === 0) return 1;
    return Math.max(...heights, 1);
  }, [heights]);

  // Current iteration parameters
  const iIndex = variables.i !== undefined ? Number(variables.i) : -1;
  const popped = variables.popped !== undefined ? Number(variables.popped) : -1;
  const hVal = variables.h !== undefined ? Number(variables.h) : null;
  const wVal = variables.w !== undefined ? Number(variables.w) : null;
  const maxArea = variables.maxArea !== undefined ? Number(variables.maxArea) : 0;

  // Compute the active boundary coordinates of the rectangle being calculated
  const activeRect = useMemo(() => {
    if (hVal === null || wVal === null || popped === -1) return null;
    
    // In Java:
    // int w = stack.isEmpty() ? i : i - stack.peek() - 1;
    // So the left boundary is: stack.isEmpty() ? 0 : stack.peek() + 1
    // The right boundary is i - 1
    const stackBeforePop = [...stackValues];
    // Note: since the trace shows the state *after* stack.pop(), the peek element in JDB
    // is already the one below the popped element.
    const peekIdx = stackBeforePop.length > 0 ? stackBeforePop[stackBeforePop.length - 1] : -1;
    const startIdx = peekIdx === -1 ? 0 : peekIdx + 1;
    const endIdx = iIndex - 1;

    return {
      start: startIdx,
      end: Math.max(startIdx, endIdx),
      height: hVal,
      width: wVal,
      area: hVal * wVal
    };
  }, [hVal, wVal, popped, stackValues, iIndex]);

  return (
    <div className="flex flex-col gap-5 w-full max-w-2xl mx-auto p-2">
      {/* Tiny Strategy Header */}
      <div className="text-center border-b border-slate-100 pb-2.5 mb-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Stack • Largest Rectangle Area
        </span>
      </div>

      {/* Whiteboard Workspace */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs flex flex-col gap-6 min-h-[220px] overflow-visible w-full select-none">
        
        {/* 1. Histogram Bar Graph with Active Rectangle Highlight */}
        <div className="relative w-full h-[220px] flex items-end justify-center border-b-2 border-slate-350 pb-1 mt-2 px-4">
          
          {/* Active Rectangle Overlay */}
          {activeRect !== null && (
            <motion.div
              initial={false}
              animate={{
                left: `calc(10% + ${activeRect.start * (80 / heights.length)}% + 4px)`,
                width: `calc(${(activeRect.end - activeRect.start + 1) * (80 / heights.length)}% - 8px)`,
                height: `${(activeRect.height / maxVal) * 180}px`
              }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="absolute bg-emerald-500/20 border-2 border-dashed border-emerald-500 z-10 flex items-center justify-center rounded pointer-events-none"
            >
              <span className="text-[10px] font-black text-emerald-700 bg-white/95 px-2 py-0.5 rounded border border-emerald-250 shadow-xs backdrop-blur-xs font-mono -translate-y-1/2">
                Area: {activeRect.height} &times; {activeRect.width} = {activeRect.area}
              </span>
            </motion.div>
          )}

          {/* Histogram Bars */}
          <div className="w-[80%] flex justify-between items-end h-[180px] relative z-20 pointer-events-none">
            {heights.map((h, idx) => {
              const isPopped = idx === popped;
              const isIndexPointer = idx === iIndex;
              const inStack = stackValues.includes(idx);
              const barHeight = (h / maxVal) * 180;

              let borderClass = "bg-slate-100 border-slate-300 text-slate-500";
              if (isPopped) {
                borderClass = "bg-amber-450 border-amber-500 text-indigo-950 shadow-md ring-2 ring-amber-500/20";
              } else if (inStack) {
                borderClass = "bg-indigo-100 border-indigo-300 text-indigo-900 border-2";
              }

              return (
                <div key={idx} className="flex flex-col items-center flex-1 mx-1 h-full justify-end relative">
                  <motion.div
                    layout
                    className={`w-full rounded-t border-t border-x transition-colors duration-300 flex flex-col justify-between p-1 font-mono font-bold text-center text-[10px] ${borderClass}`}
                    style={{ height: `${Math.max(barHeight, 15)}px` }}
                  >
                    <span>{h}</span>
                    {inStack && (
                      <span className="text-[7.5px] bg-indigo-500 text-white rounded px-0.5 font-black uppercase opacity-90 leading-none">
                        Stack
                      </span>
                    )}
                  </motion.div>
                  
                  {/* Pointer arrow for the current iteration index `i` */}
                  <div className="h-6 flex items-center justify-center w-full mt-1">
                    {isIndexPointer ? (
                      <motion.div
                        animate={{ y: [2, -2, 2] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-xs font-black text-amber-550"
                      >
                        &uarr; i
                      </motion.div>
                    ) : (
                      <span className="text-[9px] font-bold text-slate-400 font-mono">{idx}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Variables Info Row */}
        <div className="w-full border border-slate-200 rounded-xl bg-slate-50/50 p-3 select-none font-mono text-xs">
          <div className="grid grid-cols-4 text-center font-bold text-slate-500 border-b border-slate-200 pb-1.5 mb-1.5 uppercase text-[9px] tracking-wider">
            <div>Current Index (i)</div>
            <div>Popped Index</div>
            <div>Popped Height</div>
            <div>Max Area So Far</div>
          </div>
          <div className="grid grid-cols-4 text-center text-slate-800 font-extrabold text-sm">
            <div className="text-slate-600 bg-slate-100 rounded py-0.5">{iIndex !== -1 ? iIndex : '-'}</div>
            <div className="text-amber-700 bg-amber-50 rounded py-0.5">{popped !== -1 ? popped : '-'}</div>
            <div className="text-slate-850 rounded py-0.5">{hVal !== null ? hVal : '-'}</div>
            <div className="text-emerald-700 bg-emerald-50 border border-emerald-250 rounded py-0.5">
              {maxArea}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default LargestRectangleVisualizer;
