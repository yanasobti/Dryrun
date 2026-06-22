import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { generateEducationalExplanation, getElementArray } from '../../utils/educationalNarrator';

interface TwoPointersVisualizerProps {
  data: {
    steps: any[];
  };
  currentStep: number;
}

export const TwoPointersVisualizer: React.FC<TwoPointersVisualizerProps> = ({ data, currentStep }) => {
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

  // Safely get variables
  const left = variables.left !== undefined ? parseInt(String(variables.left), 10) : -1;
  const right = variables.right !== undefined ? parseInt(String(variables.right), 10) : -1;
  const prevLeft = prevVariables.left !== undefined ? parseInt(String(prevVariables.left), 10) : -1;
  const prevRight = prevVariables.right !== undefined ? parseInt(String(prevVariables.right), 10) : -1;
  const iFixed = variables.i !== undefined ? parseInt(String(variables.i), 10) : -1;

  // Extract question ID to adapt UI logic
  const questionId = useMemo(() => {
    // We can infer the question ID from variables or find it from global context
    if (variables.leftMax !== undefined || variables.rightMax !== undefined) {
      return 'trapping-rain-water';
    }
    if (variables.maxArea !== undefined) {
      return 'container-with-most-water';
    }
    if (variables.i !== undefined) {
      return '3sum';
    }
    if (variables.target !== undefined) {
      return 'two-sum-ii-input-array-is-sorted';
    }
    return 'valid-palindrome';
  }, [variables]);

  // Retrieve primary array/string
  const elementsArray = useMemo(() => {
    return getElementArray(step, frames);
  }, [frames, step]);

  const maxVal = useMemo(() => {
    const numArr = elementsArray.map(x => Number(x)).filter(x => !isNaN(x));
    if (numArr.length === 0) return 1;
    return Math.max(...numArr, 1);
  }, [elementsArray]);

  // Compute trapped water at each index (Trapping Rain Water specific)
  const waterLevels = useMemo(() => {
    if (questionId !== 'trapping-rain-water') return [];
    const numArr = elementsArray.map(x => Number(x));
    return numArr.map((h, idx) => {
      if (idx < left) {
        const maxLeftSoFar = Math.max(...numArr.slice(0, idx + 1));
        return Math.max(0, maxLeftSoFar - h);
      } else if (idx > right) {
        const maxRightSoFar = Math.max(...numArr.slice(idx, numArr.length));
        return Math.max(0, maxRightSoFar - h);
      }
      return 0;
    });
  }, [elementsArray, left, right, questionId]);

  // Determine active pointer side based on movements
  const activePointerSide = useMemo(() => {
    if (left === -1 || right === -1 || left >= right) return null;
    const leftMoved = left !== prevLeft && prevLeft !== -1;
    const rightMoved = right !== prevRight && prevRight !== -1;
    if (leftMoved) return 'LEFT';
    if (rightMoved) return 'RIGHT';
    
    // Default based on values
    const numArr = elementsArray.map(x => Number(x));
    if (numArr[left] !== undefined && numArr[right] !== undefined) {
      return numArr[left] < numArr[right] ? 'LEFT' : 'RIGHT';
    }
    return 'LEFT';
  }, [elementsArray, left, right, prevLeft, prevRight]);

  // Generate Narrations Layer
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



  const isElevationMap = questionId === 'container-with-most-water' || questionId === 'trapping-rain-water';

  return (
    <div className="w-full flex flex-col items-center select-none bg-white p-4 rounded-2xl border border-slate-150 shadow-sm animate-fade-in">

      {/* Visualization Canvas */}
      <div className="relative w-full h-[320px] flex items-end justify-center border-b-2 border-slate-350 pb-2 mt-2 px-4">
        
        {/* Draw Area Box (Container With Most Water specific) */}
        {questionId === 'container-with-most-water' && left !== -1 && right !== -1 && left < right && (
          <motion.div
            initial={false}
            animate={{
              left: `calc(10% + ${left * (80 / (elementsArray.length - 1))}% + 14px)`,
              width: `calc(${(right - left) * (80 / (elementsArray.length - 1))}% - 8px)`,
              height: `${(Math.min(Number(elementsArray[left]), Number(elementsArray[right])) / maxVal) * 200}px`
            }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="absolute bg-blue-500/10 border-t-2 border-dashed border-blue-500 z-10 flex items-center justify-center rounded-t-sm"
          >
            <span className="text-[10px] font-black text-blue-600 bg-white/90 px-2 py-0.5 rounded border border-blue-200 shadow-xs backdrop-blur-xs font-mono -translate-y-1/2">
              Water Level = {Math.min(Number(elementsArray[left]), Number(elementsArray[right]))}
            </span>
          </motion.div>
        )}

        <div className="w-full flex justify-between items-end h-[280px] relative z-20">
          {elementsArray.map((val, idx) => {
            const numVal = Number(val);
            const isLeft = idx === left;
            const isRight = idx === right;
            const isFixed = idx === iFixed;
            const isPointer = isLeft || isRight || isFixed;
            const isCurrentActive = (activePointerSide === 'LEFT' && isLeft) || (activePointerSide === 'RIGHT' && isRight);

            const barHeightPercent = isNaN(numVal) ? 30 : (numVal / maxVal) * 80;
            const waterHeight = waterLevels[idx] || 0;
            const waterHeightPercent = (waterHeight / maxVal) * 80;
            const topPercent = Math.max(barHeightPercent, barHeightPercent + waterHeightPercent);

            let borderClass = "bg-slate-100 border-slate-300 text-slate-600";
            if (isLeft) {
              borderClass = "bg-cyan-500 border-cyan-400 text-cyan-955 shadow-md ring-2 ring-cyan-500/20";
            } else if (isRight) {
              borderClass = "bg-rose-500 border-rose-400 text-white shadow-md ring-2 ring-rose-500/20";
            } else if (isFixed) {
              borderClass = "bg-violet-500 border-violet-400 text-white shadow-md ring-2 ring-violet-500/20";
            }

            return (
              <div key={idx} className="flex flex-col items-center flex-1 mx-1 h-full justify-end relative">
                
                {/* Floating explanation bubble directly over the active column/box */}
                {isCurrentActive && left !== -1 && right !== -1 && left < right && (
                  <div 
                    className="absolute w-52 bg-slate-50 border border-slate-200 text-slate-850 rounded-xl shadow-md p-2.5 z-35 text-[10.5px] font-sans text-left leading-snug pointer-events-auto"
                    style={{
                      bottom: `calc(${isElevationMap ? topPercent : 45}% + 12px)`,
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-slate-200" />
                    <div className="font-extrabold border-b border-slate-200 pb-0.5 mb-1 font-mono text-[9px] uppercase tracking-wider text-indigo-650">
                      {narration.title}
                    </div>
                    <div className="font-semibold text-slate-700">
                      {narration.explanation}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-1 border-t border-slate-200/50 pt-1 italic font-medium">
                      {narration.why}
                    </div>
                  </div>
                )}

                {/* Trapping Water (specific) */}
                {questionId === 'trapping-rain-water' && waterHeight > 0 && (
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

                {/* Grid vs Elevation element rendering */}
                {isElevationMap ? (
                  <motion.div
                    layout
                    className={`w-full rounded-t border-t border-x flex flex-col justify-between p-1 font-mono font-bold text-center text-[10px] transition-colors duration-300 ${borderClass}`}
                    style={{ height: `${Math.max(barHeightPercent, 6)}%` }}
                  >
                    <span>{val}</span>
                    {isPointer && (
                      <span className="text-[8.5px] font-black opacity-90 uppercase">
                        {isLeft ? 'L' : (isRight ? 'R' : 'i')}
                      </span>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    layout
                    className={`w-10 h-10 rounded-lg border flex flex-col items-center justify-center font-mono font-bold transition-all duration-300 ${borderClass}`}
                  >
                    <span className="text-xs">{val}</span>
                    {isPointer && (
                      <span className="text-[8px] font-black opacity-90 uppercase leading-none">
                        {isLeft ? 'L' : (isRight ? 'R' : 'i')}
                      </span>
                    )}
                  </motion.div>
                )}

                {/* Index label / Pointer arrow under the element */}
                <div className="h-6 flex items-center justify-center w-full mt-1">
                  {isPointer ? (
                    <motion.div
                      animate={{ y: [2, -2, 2] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className={`text-xs font-black ${isLeft ? 'text-cyan-600' : (isRight ? 'text-rose-600' : 'text-violet-650')}`}
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
export default TwoPointersVisualizer;
