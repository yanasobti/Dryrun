import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface TrappingRainWaterVisualizerProps {
  data: {
    steps: any[];
  };
  currentStep: number;
}

const TrappingRainWaterVisualizer: React.FC<TrappingRainWaterVisualizerProps> = ({ data, currentStep }) => {
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

  // Extract height array from frames
  const heightArray = useMemo(() => {
    let arr = step.arrays?.['height'];
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
  }, [frames, step]);

  const left = variables.left !== undefined ? parseInt(String(variables.left), 10) : -1;
  const right = variables.right !== undefined ? parseInt(String(variables.right), 10) : -1;
  const leftMax = variables.leftMax !== undefined ? parseInt(String(variables.leftMax), 10) : 0;
  const rightMax = variables.rightMax !== undefined ? parseInt(String(variables.rightMax), 10) : 0;
  const totalWater = variables.trappedWater !== undefined 
    ? parseInt(String(variables.trappedWater), 10) 
    : (variables.totalWater !== undefined ? parseInt(String(variables.totalWater), 10) : 0);

  const prevLeft = prevVariables.left !== undefined ? parseInt(String(prevVariables.left), 10) : -1;
  const prevRight = prevVariables.right !== undefined ? parseInt(String(prevVariables.right), 10) : -1;
  const prevLeftMax = prevVariables.leftMax !== undefined ? parseInt(String(prevVariables.leftMax), 10) : 0;
  const prevRightMax = prevVariables.rightMax !== undefined ? parseInt(String(prevVariables.rightMax), 10) : 0;

  const isLeftMaxUpdated = leftMax > prevLeftMax && currentStep > 0;
  const isRightMaxUpdated = rightMax > prevRightMax && currentStep > 0;

  const maxVal = useMemo(() => {
    if (heightArray.length === 0) return 1;
    return Math.max(...heightArray, 1);
  }, [heightArray]);

  // Compute trapped water at each index based on current step pointers
  const waterLevels = useMemo(() => {
    return heightArray.map((h: number, idx: number) => {
      if (idx < left) {
        const maxLeftSoFar = Math.max(...heightArray.slice(0, idx + 1));
        return Math.max(0, maxLeftSoFar - h);
      } else if (idx > right) {
        const maxRightSoFar = Math.max(...heightArray.slice(idx, heightArray.length));
        return Math.max(0, maxRightSoFar - h);
      }
      return 0;
    });
  }, [heightArray, left, right]);

  // Determine current active pointer side
  const activePointerSide = useMemo(() => {
    if (left === -1 || right === -1 || left >= right) return null;
    
    // We determine which pointer is active based on what changed in this step
    const leftMoved = left !== prevLeft && prevLeft !== -1;
    const rightMoved = right !== prevRight && prevRight !== -1;
    
    if (leftMoved) return 'LEFT';
    if (rightMoved) return 'RIGHT';
    
    // Fallback based on values comparison
    return heightArray[left] < heightArray[right] ? 'LEFT' : 'RIGHT';
  }, [heightArray, left, right, prevLeft, prevRight]);

  // Bubble explanation text for the active pointer
  const bubbleExplanation = useMemo(() => {
    if (left === -1 || right === -1) return "Simulation Not Started";
    if (left >= right) return `Pointers met! Total trapped water = ${totalWater}`;

    const hLeft = heightArray[left];
    const hRight = heightArray[right];

    if (activePointerSide === 'LEFT') {
      if (hLeft >= leftMax) {
        return (
          <>
            <strong>height[left] = {hLeft}</strong> &ge; leftMax ({prevLeftMax}).<br />
            Update <strong>leftMax: {prevLeftMax} &rarr; {hLeft}</strong>.<br />
            No water trapped.
          </>
        );
      } else {
        const trapped = leftMax - hLeft;
        return (
          <>
            <strong>height[left] = {hLeft}</strong> &lt; leftMax ({leftMax}).<br />
            Process LEFT side since {hLeft} &lt; {hRight}.<br />
            Water trapped: <strong>{leftMax} - {hLeft} = {trapped} unit{trapped > 1 ? 's' : ''}</strong>.
          </>
        );
      }
    } else {
      if (hRight >= rightMax) {
        return (
          <>
            <strong>height[right] = {hRight}</strong> &ge; rightMax ({prevRightMax}).<br />
            Update <strong>rightMax: {prevRightMax} &rarr; {hRight}</strong>.<br />
            No water trapped.
          </>
        );
      } else {
        const trapped = rightMax - hRight;
        return (
          <>
            <strong>height[right] = {hRight}</strong> &lt; rightMax ({rightMax}).<br />
            Process RIGHT side since {hRight} &le; {hLeft}.<br />
            Water trapped: <strong>{rightMax} - {hRight} = {trapped} unit{trapped > 1 ? 's' : ''}</strong>.
          </>
        );
      }
    }
  }, [left, right, heightArray, activePointerSide, leftMax, rightMax, prevLeftMax, prevRightMax, totalWater]);

  return (
    <div className="w-full flex flex-col items-center select-none bg-white p-6 rounded-2xl border border-slate-150 shadow-sm animate-fade-in">
      <div className="w-full flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <span className="text-sm font-semibold text-indigo-655 flex items-center gap-1.5 font-mono">
          <svg className="w-4.5 h-4.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Trapping Rain Water Elevation Map
        </span>
      </div>

      {/* Small table of variables above the elevation map */}
      <div className="w-full border border-slate-200 rounded-xl bg-slate-50/50 p-3 mb-6 select-none font-mono text-xs">
        <div className="grid grid-cols-5 text-center font-bold text-slate-500 border-b border-slate-200 pb-1.5 mb-1.5 uppercase text-[9px] tracking-wider">
          <div>Left</div>
          <div>Right</div>
          <div>leftMax</div>
          <div>rightMax</div>
          <div>Trapped Water</div>
        </div>
        <div className="grid grid-cols-5 text-center text-slate-800 font-extrabold text-sm">
          <div className="text-cyan-600 bg-cyan-50/50 rounded py-0.5">{left !== -1 ? left : '-'}</div>
          <div className="text-rose-600 bg-rose-50/50 rounded py-0.5">{right !== -1 ? right : '-'}</div>
          <div className={`transition-all rounded py-0.5 ${isLeftMaxUpdated ? 'bg-cyan-100 text-cyan-700 px-1 border border-cyan-300 font-black' : ''}`}>
            {leftMax}
          </div>
          <div className={`transition-all rounded py-0.5 ${isRightMaxUpdated ? 'bg-rose-100 text-rose-700 px-1 border border-rose-300 font-black' : ''}`}>
            {rightMax}
          </div>
          <div className="text-emerald-700 bg-emerald-50 border border-emerald-250 rounded py-0.5">
            {totalWater} units
          </div>
        </div>
      </div>

      {/* Main Elevation Map & Water Visualization */}
      <div className="relative w-full h-[320px] flex items-end justify-center border-b-2 border-slate-350 pb-2 mt-2 px-4">
        {/* Render Bars & Water */}
        <div className="w-full flex justify-between items-end h-[280px] relative z-20">
          {heightArray.map((h: number, idx: number) => {
            const isLeft = idx === left;
            const isRight = idx === right;
            const isPointer = isLeft || isRight;
            const isCurrentActive = (activePointerSide === 'LEFT' && isLeft) || (activePointerSide === 'RIGHT' && isRight);

            const barHeightPercent = (h / maxVal) * 80; // max 80% height for bars
            const waterHeight = waterLevels[idx];
            const waterHeightPercent = (waterHeight / maxVal) * 80;
            const topPercent = Math.max(barHeightPercent, barHeightPercent + waterHeightPercent);

            let barColorClass = "bg-slate-300 border-slate-400 text-slate-700";
            if (isLeft) {
              barColorClass = "bg-cyan-500 border-cyan-400 text-cyan-955 shadow-md ring-2 ring-cyan-500/20";
            } else if (isRight) {
              barColorClass = "bg-rose-500 border-rose-400 text-white shadow-md ring-2 ring-rose-500/20";
            }

            return (
              <div key={idx} className="flex flex-col items-center flex-1 mx-1 h-full justify-end relative">
                
                {/* Floating Tutor Decision Bubble above the active pointer */}
                {isCurrentActive && left !== -1 && right !== -1 && left < right && (
                  <div 
                    className="absolute w-56 bg-slate-800 text-white rounded-xl shadow-xl p-3 z-30 text-xs font-sans text-left leading-relaxed pointer-events-auto border border-slate-700"
                    style={{
                      bottom: `calc(${topPercent}% + 12px)`,
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }}
                  >
                    {/* Bottom arrow pointing to the column */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-slate-800" />
                    <div className="font-bold border-b border-slate-700 pb-1 mb-1 font-mono text-[9px] uppercase tracking-wider text-slate-400">
                      Tutor Insight
                    </div>
                    <div className="text-[11px] font-medium text-slate-200">
                      {bubbleExplanation}
                    </div>
                  </div>
                )}

                {/* Water Column */}
                {waterHeight > 0 && (
                  <motion.div
                    className="absolute w-full bg-blue-500/40 border-t-2 border-dashed border-blue-500 z-10 flex items-center justify-center rounded-t-sm"
                    style={{
                      bottom: `${barHeightPercent}%`,
                      height: `${waterHeightPercent}%`,
                      originY: 1,
                    }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-blue-400/10 animate-pulse" />
                    <span className="absolute -top-5 text-[8.5px] font-black text-blue-600 bg-white/90 px-1 rounded border border-blue-200 shadow-xs z-25 font-mono">
                      +{waterHeight}
                    </span>
                  </motion.div>
                )}

                {/* Elevation Wall Bar */}
                <motion.div
                  layout
                  className={`w-full rounded-t border-t border-x flex flex-col justify-between p-1 font-mono font-bold text-center text-[10px] transition-colors duration-300 ${barColorClass}`}
                  style={{ height: `${Math.max(barHeightPercent, 6)}%` }}
                >
                  <span>{h}</span>
                  {isPointer && (
                    <span className="text-[9px] font-black opacity-90">
                      {isLeft ? 'L' : 'R'}
                    </span>
                  )}
                </motion.div>

                {/* Index label / Pointer arrow under the bar */}
                <div className="h-6 flex items-center justify-center w-full mt-1">
                  {isPointer ? (
                    <motion.div
                      animate={{ y: [2, -2, 2] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className={`text-xs font-black ${isLeft ? 'text-cyan-600' : 'text-rose-600'}`}
                    >
                      &uarr;
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
    </div>
  );
};

export default TrappingRainWaterVisualizer;
