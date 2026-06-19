import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ContainerWithMostWaterVisualizerProps {
  frames: any[];
  currentFrameIndex: number;
  visualizerState: any;
}

export const ContainerWithMostWaterVisualizer: React.FC<ContainerWithMostWaterVisualizerProps> = ({
  frames,
  currentFrameIndex,
  visualizerState
}) => {
  const currentFrame = frames[currentFrameIndex];
  const variables = currentFrame?.variables || {};

  // Retrieve height array from any frame in the stack trace
  const heightArray = useMemo(() => {
    let arr = currentFrame?.arrays?.['height'];
    if (!arr) {
      for (const f of frames) {
        if (f.arrays?.['height']) {
          arr = f.arrays['height'];
          break;
        }
      }
    }
    if (!arr) {
      for (const f of frames) {
        const keys = Object.keys(f.arrays || {});
        if (keys.length > 0) {
          arr = f.arrays[keys[0]];
          break;
        }
      }
    }
    return (arr || []).map((x: any) => parseInt(String(x), 10));
  }, [frames, currentFrame]);

  const left = variables.left !== undefined ? parseInt(String(variables.left), 10) : -1;
  const right = variables.right !== undefined ? parseInt(String(variables.right), 10) : -1;
  const maxArea = variables.maxArea !== undefined ? parseInt(String(variables.maxArea), 10) : 0;

  // Derived math values
  const hasActivePointers = left !== -1 && right !== -1 && left < right;
  const leftHeight = hasActivePointers ? heightArray[left] : 0;
  const rightHeight = hasActivePointers ? heightArray[right] : 0;
  const minHeight = Math.min(leftHeight, rightHeight);
  const width = right - left;
  const currentArea = width * minHeight;

  // Max height inside the array for scaling calculation
  const maxVal = useMemo(() => {
    if (heightArray.length === 0) return 1;
    return Math.max(...heightArray, 1);
  }, [heightArray]);

  return (
    <div className="w-full flex flex-col items-center select-none bg-white p-6 rounded-2xl border border-slate-150 shadow-sm animate-fade-in">
      <div className="w-full flex items-center justify-between mb-6 border-b border-slate-100 pb-3">
        <span className="text-sm font-semibold text-indigo-650 flex items-center gap-1.5 font-mono">
          <svg className="w-4.5 h-4.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          container visualizer [n = {heightArray.length}]
        </span>
        {hasActivePointers && (
          <div className="flex items-center gap-4 text-xs font-mono font-bold">
            <span className="text-slate-400">maxArea: <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{maxArea}</span></span>
          </div>
        )}
      </div>

      {/* Heights graph block with water filled region */}
      <div className="relative w-full h-[260px] flex items-end justify-center border-b-2 border-slate-350 pb-1 mt-4 px-4">
        
        {/* Render water level region */}
        {hasActivePointers && minHeight > 0 && (
          <motion.div
            initial={false}
            animate={{
              left: `calc(10% + ${left * (80 / (heightArray.length - 1))}% + 14px)`,
              width: `calc(${(right - left) * (80 / (heightArray.length - 1))}% - 8px)`,
              height: `${(minHeight / maxVal) * 220}px`
            }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="absolute bg-blue-500/20 border-t-2 border-dashed border-blue-500 z-10 flex items-start justify-center pointer-events-none rounded-t-sm"
          >
            {/* Water animation ripple */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-300/30 via-transparent to-transparent animate-pulse" />
            <span className="text-[10px] font-black text-blue-600 bg-white/90 px-2 py-0.5 rounded-full border border-blue-200 shadow-xs backdrop-blur-xs font-mono -translate-y-1/2">
              Water Level = {minHeight}
            </span>
          </motion.div>
        )}

        {/* Render Bars */}
        <div className="w-[80%] flex justify-between items-end h-[220px] relative z-20 pointer-events-none">
          {heightArray.map((h, idx) => {
            const isLeft = idx === left;
            const isRight = idx === right;
            const isWall = isLeft || isRight;
            const barHeight = (h / maxVal) * 220;

            let borderClass = "bg-slate-200 border-slate-300 text-slate-500";
            if (isLeft) {
              borderClass = "bg-cyan-500 border-cyan-400 text-cyan-955 shadow-md ring-2 ring-cyan-500/20";
            } else if (isRight) {
              borderClass = "bg-rose-500 border-rose-400 text-white shadow-md ring-2 ring-rose-500/20";
            }

            return (
              <div key={idx} className="flex flex-col items-center flex-1 mx-1.5 h-full justify-end">
                <motion.div
                  layout
                  className={`w-full rounded-t-lg border-t-2 border-x transition-colors duration-300 flex flex-col justify-between p-1 font-mono font-bold text-center text-xs ${borderClass}`}
                  style={{ height: `${Math.max(barHeight, 15)}px` }}
                >
                  <span>{h}</span>
                  {isWall && (
                    <span className="text-[9px] font-black opacity-80 uppercase">
                      {isLeft ? 'L' : 'R'}
                    </span>
                  )}
                </motion.div>
                <span className="text-[9px] font-bold text-slate-400 mt-2 font-mono">{idx}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Equation and calculations card */}
      {hasActivePointers && (
        <div className="w-full mt-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col md:flex-row items-center md:items-stretch justify-between gap-6">
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-black uppercase text-indigo-500 tracking-wider font-mono">Current Calculations</h4>
              <div className="mt-3 flex flex-wrap gap-4 text-xs font-mono font-bold">
                <div className="flex flex-col bg-white border border-slate-150 p-2.5 rounded-xl min-w-[100px]">
                  <span className="text-[9px] text-slate-400 uppercase font-black">Width (R - L)</span>
                  <span className="text-slate-800 text-sm mt-1">{right} - {left} = {width}</span>
                </div>
                <div className="flex flex-col bg-white border border-slate-150 p-2.5 rounded-xl min-w-[110px]">
                  <span className="text-[9px] text-slate-400 uppercase font-black">Shorter Wall</span>
                  <span className="text-slate-800 text-sm mt-1">min({leftHeight}, {rightHeight}) = {minHeight}</span>
                </div>
                <div className="flex flex-col bg-white border border-slate-150 p-2.5 rounded-xl min-w-[110px]">
                  <span className="text-[9px] text-slate-400 uppercase font-black">Current Area</span>
                  <span className="text-indigo-650 text-sm mt-1">{width} × {minHeight} = {currentArea}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200/60 pt-3 flex items-center gap-3">
              <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${
                currentArea > maxArea
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                {currentArea > maxArea ? '🎉 New Maximum Area Found!' : 'Keep searching for wider/taller containers'}
              </span>
            </div>
          </div>

          <div className="w-full md:w-[320px] bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 font-mono">Tutor Decision Room</span>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2.5 font-sans">
                The left height is <strong>{leftHeight}</strong> and the right height is <strong>{rightHeight}</strong>.
                <br />
                The water level is bottlenecked by the <strong>shorter wall ({minHeight})</strong>.
              </p>
              <p className="text-[11px] text-slate-450 italic mt-2 border-l-2 border-indigo-150 pl-2">
                "Moving the taller wall inward will only reduce width without increasing maximum possible height. Thus, we must move the shorter wall."
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase font-mono text-slate-400">Action:</span>
              <span className={`text-[10px] font-black uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full ${
                leftHeight < rightHeight 
                  ? 'bg-cyan-50 text-cyan-600 border border-cyan-200' 
                  : 'bg-rose-50 text-rose-600 border border-rose-200'
              }`}>
                {leftHeight < rightHeight ? 'Move LEFT pointer ➔' : 'Move RIGHT pointer ←'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
