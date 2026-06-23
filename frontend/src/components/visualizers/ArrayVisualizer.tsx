import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { VisualEvent } from '../../utils/visualEvent';
import { ContextBubble } from './ContextBubble';
import type { BubbleVariant } from './ContextBubble';

interface ArrayVisualizerProps {
  name: string;
  values: any[];
  variables: Record<string, any>;
  codeLine?: string;
  visualEvents?: VisualEvent[];
  questionId?: string;
  arrays?: any[];
  frames?: any[];
  strategy?: string;
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({
  name,
  values,
  variables,
  codeLine = "",
  visualEvents = [],
  questionId,
  arrays = [],
  frames = [],
  strategy
}) => {
  // Identify active index referenced directly in active code line (e.g., nums[i] or s.charAt(i))
  const activeIndex = useMemo(() => {
    if (!codeLine) return -1;
    const arrayRegex = new RegExp(`${name}\\s*\\[([^\\]]+)\\]`);
    const charAtRegex = new RegExp(`${name}\\s*\\.charAt\\s*\\(([^\\)]+)\\)`);
    
    let match = codeLine.match(arrayRegex);
    let expr = "";
    if (match) {
      expr = match[1].trim();
    } else {
      match = codeLine.match(charAtRegex);
      if (match) {
        expr = match[1].trim();
      }
    }
    
    if (expr) {
      if (!isNaN(Number(expr))) {
        return Number(expr);
      }
      if (variables[expr] !== undefined) {
        return Number(variables[expr]);
      }
    }
    return -1;
  }, [name, variables, codeLine]);

  const getCellOverlay = (idx: number): { message: React.ReactNode; variant: BubbleVariant } | null => {
    // Proactively suppress individual update bubbles during Arrays.sort
    if (codeLine && codeLine.includes("Arrays.sort")) {
      return null;
    }

    // Custom check for valid-anagram string characters
    if (name === 's' && idx === variables['i'] && codeLine.includes('s.charAt')) {
      return { message: `char '${values[idx]}' : +1`, variant: 'success' };
    }
    if (name === 't' && idx === variables['i'] && codeLine.includes('t.charAt')) {
      return { message: `char '${values[idx]}' : -1`, variant: 'action' };
    }

    // Custom mathematical explanation for product-of-array-except-self
    if (questionId === 'product-of-array-except-self' && name === 'answer') {
      const arrayUpdateEvent = visualEvents?.find(
        e => e.type === 'ARRAY_UPDATE' && e.details.name === name && e.details.index === idx
      );
      if (arrayUpdateEvent) {
        const numsVals = arrays?.find(a => a.name === 'nums')?.values || [];
        if (numsVals.length > 0) {
          const isSuffixPhase = variables['right'] !== undefined;
          if (!isSuffixPhase) {
            if (idx === 0) {
              return {
                variant: 'success',
                message: (
                  <div className="text-left font-sans min-w-[150px]">
                    <div className="font-semibold text-emerald-350">Computing prefix product:</div>
                    <div className="my-1 text-slate-100 font-mono font-bold text-xs">Base case = 1</div>
                    <div className="text-[9px] text-slate-350 mt-1 border-t border-emerald-500/20 pt-1 font-mono">
                      Writing:<br />
                      <span className="text-amber-350 font-bold">answer[0] = 1</span>
                    </div>
                  </div>
                )
              };
            } else {
              const sub = numsVals.slice(0, idx);
              const val = sub.reduce((a: number, b: number) => a * b, 1);
              return {
                variant: 'success',
                message: (
                  <div className="text-left font-sans min-w-[150px]">
                    <div className="font-semibold text-emerald-350">Computing prefix product:</div>
                    <div className="my-1 text-slate-100 font-mono font-bold text-xs">{sub.join(' × ')} = {val}</div>
                    <div className="text-[9px] text-slate-350 mt-1 border-t border-emerald-500/20 pt-1 font-mono">
                      Writing:<br />
                      <span className="text-amber-350 font-bold">answer[{idx}] = {val}</span>
                    </div>
                  </div>
                )
              };
            }
          } else {
            const leftSub = numsVals.slice(0, idx);
            const rightSub = numsVals.slice(idx + 1);
            const leftProduct = leftSub.reduce((a: number, b: number) => a * b, 1);
            const rightProduct = rightSub.reduce((a: number, b: number) => a * b, 1);
            const finalVal = leftProduct * rightProduct;
            return {
              variant: 'success',
              message: (
                <div className="text-left font-sans min-w-[170px]">
                  <div className="font-semibold text-emerald-350">Computing product except self:</div>
                  <div className="my-1 text-slate-100 font-mono font-bold text-xs">
                    ({leftSub.length > 0 ? leftSub.join(' × ') : '1'}) × ({rightSub.length > 0 ? rightSub.join(' × ') : '1'}) = {finalVal}
                  </div>
                  <div className="text-[9px] text-slate-355 mt-1 border-t border-emerald-500/20 pt-1 font-mono">
                    Writing:<br />
                    <span className="text-amber-350 font-bold">answer[{idx}] = {finalVal}</span>
                  </div>
                </div>
              )
            };
          }
        }
      }
    }

    if (!visualEvents || visualEvents.length === 0) return null;
    
    const sortedEvents = [...visualEvents].sort((a, b) => b.priority - a.priority);

    for (const event of sortedEvents) {
      const { type, details } = event;

      // ARITHMETIC
      if (type === 'ARITHMETIC') {
        if (details.index === idx && details.needed !== undefined) {
          return { message: `Need ${details.needed}`, variant: 'info' };
        }
        if (details.index === idx && details.min !== undefined) {
          const val = values[idx];
          return { message: `Margin: ${val} - ${details.min} = ${val - details.min}`, variant: 'info' };
        }
      }

      // COMPARE
      if (type === 'COMPARE') {
        const targetIdx = details.mid !== undefined ? details.mid : details.index;
        if (targetIdx === idx) {
          const val = values[idx];
          const target = details.target;
          if (val !== undefined && target !== undefined) {
            let op = '==';
            if (details.code?.includes('<')) op = '<';
            else if (details.code?.includes('>')) op = '>';
            
            let res = false;
            if (op === '==') res = val === target;
            else if (op === '<') res = val < target;
            else if (op === '>') res = val > target;

            return { message: `${val} ${op} ${target}? ${res ? 'YES' : 'NO'}`, variant: 'info' };
          }
        }
      }

      // MID_CALC
      if (type === 'MID_CALC' && details.mid === idx) {
        return { message: `mid = ${idx}`, variant: 'info' };
      }

      // ARRAY_UPDATE
      if (type === 'ARRAY_UPDATE' && details.name === name && details.index === idx) {
        return { message: `Update: ${details.prevVal} ➔ ${details.val}`, variant: 'info' };
      }

      // POINTER_SHIFT
      if (type === 'POINTER_SHIFT' && details.to === idx) {
        return { message: `Shift ${details.pointer}`, variant: 'info' };
      }

      // MATCH_FOUND
      if (type === 'MATCH_FOUND') {
        if (details.i === idx) {
          return { message: `Match!`, variant: 'success' };
        }
        const compVal = details.complement;
        if (compVal !== undefined) {
          const mapVar = Object.values(variables).find(v => String(v).includes(`{`));
          if (mapVar) {
            const entryMatch = String(mapVar).match(new RegExp(`${compVal}=(\\d+)`));
            if (entryMatch && Number(entryMatch[1]) === idx) {
              return { message: `Match Found!`, variant: 'success' };
            }
          }
        }
      }
    }

    return null;
  };

  // Identify pointers pointing to an index inside the array
  const pointers = useMemo(() => {
    const pNames = ['i', 'j', 'left', 'right', 'mid', 'low', 'high', 'start', 'end'];
    return Object.entries(variables)
      .filter(([key, val]) => {
        const num = Number(val);
        return (
          pNames.includes(key) &&
          Number.isInteger(num) &&
          num >= 0 &&
          num < values.length
        );
      })
      .map(([key, val]) => ({ name: key, index: Number(val) }));
  }, [variables, values]);

  // Sliding window bounds detection (e.g., left and right bounds)
  const windowRange = useMemo(() => {
    const leftVal = variables['left'] !== undefined ? Number(variables['left']) : variables['start'] !== undefined ? Number(variables['start']) : -1;
    const rightVal = variables['right'] !== undefined ? Number(variables['right']) : variables['end'] !== undefined ? Number(variables['end']) : -1;
    if (
      leftVal >= 0 &&
      rightVal >= 0 &&
      leftVal <= rightVal &&
      rightVal < values.length
    ) {
      return { start: leftVal, end: rightVal };
    }
  }, [variables, values]);

  // Two Sum II Helper Data
  const twoSumIIData = useMemo(() => {
    if (questionId !== 'two-sum-ii-input-array-is-sorted') return null;
    const leftVal = variables['left'];
    const rightVal = variables['right'];
    const targetVal = variables['target'] !== undefined ? Number(variables['target']) : 9;
    if (leftVal === undefined || rightVal === undefined) return null;
    const lIdx = Number(leftVal);
    const rIdx = Number(rightVal);
    const lNum = Number(values[lIdx]);
    const rNum = Number(values[rIdx]);
    if (isNaN(lNum) || isNaN(rNum)) return null;
    const sum = lNum + rNum;
    return { lIdx, rIdx, lNum, rNum, sum, targetVal };
  }, [questionId, variables, values]);

  // Unsorted values from the first frame
  const beforeSortValues = useMemo(() => {
    if (!frames || frames.length === 0) return null;
    const firstFrame = frames[0];
    return firstFrame.arrays?.[name] || null;
  }, [frames, name]);

  const isSortingStep = useMemo(() => {
    return codeLine && codeLine.includes("Arrays.sort") && beforeSortValues;
  }, [codeLine, beforeSortValues]);

  // 3Sum Helper Data
  const threeSumData = useMemo(() => {
    if (questionId !== '3sum') return null;
    const iVal = variables['i'];
    const leftVal = variables['left'];
    const rightVal = variables['right'];
    if (iVal === undefined || leftVal === undefined || rightVal === undefined) return null;
    const iIdx = Number(iVal);
    const lIdx = Number(leftVal);
    const rIdx = Number(rightVal);
    const iNum = Number(values[iIdx]);
    const lNum = Number(values[lIdx]);
    const rNum = Number(values[rIdx]);
    if (isNaN(iNum) || isNaN(lNum) || isNaN(rNum)) return null;
    const sum = iNum + lNum + rNum;
    return { iIdx, lIdx, rIdx, iNum, lNum, rNum, sum };
  }, [questionId, variables, values]);

  // Dynamic scaling parameters based on array length
  const cellWidth = useMemo(() => {
    if (values.length > 25) return 24;
    if (values.length > 15) return 30;
    return 40;
  }, [values.length]);

  const gapWidth = useMemo(() => {
    if (values.length > 25) return 4;
    if (values.length > 15) return 6;
    return 8;
  }, [values.length]);

  const stepWidth = cellWidth + gapWidth;

  // Determine which index in the array to prioritize for centering/scrolling
  const primaryScrollIndex = useMemo(() => {
    if (activeIndex !== -1) return activeIndex;
    // Check if there was a pointer shift event to center on the active pointer
    const shiftEvent = visualEvents?.find(e => e.type === 'POINTER_SHIFT');
    if (shiftEvent && shiftEvent.details.to !== undefined) {
      return shiftEvent.details.to;
    }
    if (pointers.length > 0) {
      // Prioritize 'left' or 'i' over others if multiple are present
      const preferred = pointers.find(p => p.name === 'left' || p.name === 'i');
      if (preferred) return preferred.index;
      return pointers[0].index;
    }
    return -1;
  }, [activeIndex, pointers, visualEvents]);

  // Smooth scroll active index to the horizontal center of the container
  React.useEffect(() => {
    if (primaryScrollIndex !== -1) {
      const activeCellEl = document.getElementById(`array-cell-${name}-${primaryScrollIndex}`);
      const scrollContainerEl = document.getElementById(`array-scroll-${name}`);
      
      if (activeCellEl && scrollContainerEl) {
        const containerRect = scrollContainerEl.getBoundingClientRect();
        const cellRect = activeCellEl.getBoundingClientRect();
        
        const relativeLeft = cellRect.left - containerRect.left;
        const scrollOffset = relativeLeft - (containerRect.width / 2) + (cellRect.width / 2);
        
        scrollContainerEl.scrollBy({
          left: scrollOffset,
          behavior: 'smooth'
        });
      }
    }
  }, [primaryScrollIndex, name]);

  // Color mappings for different pointer names
  const getPointerColor = (ptrName: string) => {
    switch (ptrName) {
      case 'left':
      case 'i':
        return 'bg-cyan-500 text-slate-955 border-cyan-400';
      case 'right':
      case 'j':
        return 'bg-rose-500 text-slate-50 border-rose-400';
      case 'mid':
        return 'bg-amber-500 text-slate-955 border-amber-400';
      default:
        return 'bg-indigo-500 text-slate-50 border-indigo-400';
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {strategy && (
        <div className="text-center border-b border-slate-100 pb-2.5 mb-3 w-full">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
            {strategy === 'classic_search' 
              ? 'Binary Search • Classic Target Search' 
              : strategy === 'search_on_answer'
              ? 'Binary Search • Search on Answer (Optimization)'
              : strategy === 'rotated_array_search'
              ? 'Binary Search • Rotated Sorted Array Search'
              : 'Binary Search'}
          </span>
        </div>
      )}

      {questionId === 'koko-eating-bananas' ? (
        <div className="flex flex-row gap-6 items-stretch justify-center w-full max-w-6xl animate-fade-in font-sans mt-2">
          {/* Left Column: Piles Array and Pointers */}
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-full flex items-center justify-between mb-4 border-b border-slate-200/60 pb-2">
              <span className="text-sm font-semibold text-indigo-650 flex items-center gap-1.5 font-mono">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                array {name} [{values.length}]
              </span>
            </div>
            
            <div
              id={`array-scroll-${name}`}
              className="relative py-2 w-full flex flex-col items-center overflow-x-auto select-none min-h-0 px-4"
            >
              <div className="relative pt-8 pb-10">
                <div className="flex relative items-start" style={{ gap: `${gapWidth}px` }}>
                  {values.map((val, idx) => {
                    const isActive = idx === activeIndex;
                    const cellOverlay = getCellOverlay(idx);
                    let borderClass = 'border-slate-200 bg-slate-50 text-slate-800 shadow-sm';
                    if (isActive) {
                      borderClass = 'border-amber-500 bg-amber-500/10 text-amber-700 ring-2 ring-amber-500/30 shadow-md';
                    }
                    return (
                      <div
                        key={idx}
                        id={`array-cell-${name}-${idx}`}
                        className="flex flex-col items-center gap-1 relative z-10"
                        style={{ width: `${cellWidth}px` }}
                      >
                        {cellOverlay && (
                          <ContextBubble
                            message={cellOverlay.message}
                            variant={cellOverlay.variant}
                            animation="pop"
                            position="top"
                            className="absolute bottom-[40px] left-1/2 transform -translate-x-1/2"
                          />
                        )}
                        <motion.div
                          layout
                          className={`rounded-xl border flex items-center justify-center font-bold font-mono transition-all duration-300 ${borderClass} ${
                            values.length > 25 ? 'text-[10px]' : (values.length > 15 ? 'text-xs' : 'text-sm')
                          }`}
                          style={{ width: `${cellWidth}px`, height: `${cellWidth}px` }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <motion.span
                            key={val}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {val}
                          </motion.span>
                        </motion.div>
                        <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-amber-500' : 'text-slate-400'}`}>
                          {idx}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {pointers.length > 0 && (
                  <div className="absolute left-0 right-0 bottom-0 h-10">
                    {pointers.map((ptr, pIdx) => {
                      const offsetLeft = ptr.index * stepWidth + (cellWidth / 2);
                      const stackY = pIdx * 16;
                      return (
                        <motion.div
                          key={ptr.name}
                          initial={false}
                          animate={{ left: offsetLeft, y: stackY }}
                          transition={{ type: "spring", stiffness: 220, damping: 25 }}
                          className="absolute transform -translate-x-1/2 flex flex-col items-center z-20"
                        >
                          <motion.span 
                            animate={{ y: [2, -2, 2] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="text-indigo-650 text-xs font-bold leading-none"
                          >
                            ▲
                          </motion.span>
                          <span className={`pointer-tag-label pointer-tag-${ptr.name.toLowerCase()} px-1.5 py-0.5 rounded text-[9px] font-extrabold font-mono border shadow-md whitespace-nowrap uppercase tracking-wider ${getPointerColor(ptr.name)} flex items-center justify-center`}>
                            {ptr.name}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Custom Koko calculations */}
          <div className="flex-1 bg-indigo-50/40 border border-indigo-100 rounded-2xl px-6 py-5 flex flex-col items-center justify-center shadow-sm">
            {/* Speed range line */}
            <div className="w-full flex flex-col items-center mb-6 select-none">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider font-mono mb-2">
                Eating Speed Search Range (Bananas/hr)
              </span>
              <div className="w-full relative px-6 py-4 flex items-center justify-between">
                <div className="absolute left-6 right-6 h-1.5 bg-slate-200 rounded-full" />
                {(() => {
                  const leftVal = variables['left'] !== undefined ? Number(variables['left']) : variables['low'] !== undefined ? Number(variables['low']) : -1;
                  const rightVal = variables['right'] !== undefined ? Number(variables['right']) : variables['high'] !== undefined ? Number(variables['high']) : -1;
                  const maxPile = Math.max(...values);
                  if (leftVal !== -1 && rightVal !== -1 && maxPile > 1) {
                    const leftPercent = ((leftVal - 1) / (maxPile - 1)) * 100;
                    const rightPercent = ((rightVal - 1) / (maxPile - 1)) * 100;
                    return (
                      <div 
                        className="absolute h-1.5 bg-indigo-400 rounded-full" 
                        style={{
                          left: `calc(24px + ${leftPercent * 0.88}%)`,
                          width: `${(rightPercent - leftPercent) * 0.88}%`
                        }}
                      />
                    );
                  }
                  return null;
                })()}

                <div className="flex flex-col items-center z-10">
                  <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-[10px] font-black font-mono">1</span>
                  <span className="text-[8px] text-slate-400 font-bold font-mono mt-1">Min</span>
                </div>
                
                {(() => {
                  const midVal = variables['mid'] !== undefined ? Number(variables['mid']) : -1;
                  const maxPile = Math.max(...values);
                  if (midVal !== -1 && maxPile > 1) {
                    const midPercent = ((midVal - 1) / (maxPile - 1)) * 100;
                    return (
                      <div 
                        className="absolute flex flex-col items-center z-20"
                        style={{
                          left: `calc(24px + ${midPercent * 0.88}%)`,
                          transform: 'translateX(-50%)',
                          top: '-4px'
                        }}
                      >
                        <div className="w-4 h-4 rounded-full bg-amber-500 border border-amber-400 flex items-center justify-center text-[9px] font-black text-white shadow-sm">
                          {midVal}
                        </div>
                        <span className="text-[9px] text-amber-600 font-black font-mono mt-1 whitespace-nowrap">Speed = {midVal}</span>
                        <span className="text-[9px] text-amber-500 font-bold leading-none mt-0.5">▲</span>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="flex flex-col items-center z-10">
                  <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-[10px] font-black font-mono">{Math.max(...values)}</span>
                  <span className="text-[8px] text-slate-400 font-bold font-mono mt-1">Max</span>
                </div>
              </div>
              
              {(() => {
                const leftVal = variables['left'] !== undefined ? Number(variables['left']) : variables['low'] !== undefined ? Number(variables['low']) : -1;
                const rightVal = variables['right'] !== undefined ? Number(variables['right']) : variables['high'] !== undefined ? Number(variables['high']) : -1;
                if (leftVal !== -1 && rightVal !== -1) {
                  return (
                    <span className="text-[9px] font-bold text-indigo-500 font-mono mt-2 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150">
                      Active Scope: Speed [{leftVal} to {rightVal}]
                    </span>
                  );
                }
                return null;
              })()}
            </div>

            {/* Bananas piles and hours calc */}
            <div className="w-full border-t border-slate-150/60 pt-4 flex flex-col items-center select-none">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider font-mono mb-3">
                Koko's Eating Time Calculation
              </span>
              <div className="flex items-center gap-3.5 mb-4">
                {values.map((pile, idx) => {
                  const midVal = variables['mid'] !== undefined ? Number(variables['mid']) : -1;
                  const hoursForPile = midVal !== -1 ? Math.ceil(pile / midVal) : 0;
                  return (
                    <div key={idx} className="flex flex-col items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 min-w-[64px] shadow-3xs">
                      <span className="text-[8px] text-slate-400 font-black uppercase font-mono tracking-wider">Pile {idx}</span>
                      <span className="text-xs font-black text-slate-800 font-mono mt-0.5">[{pile}] ban.</span>
                      {midVal !== -1 && (
                        <div className="mt-1 border-t border-slate-200/80 pt-1 text-[10px] text-indigo-650 font-black font-mono">
                          {hoursForPile} {hoursForPile === 1 ? 'hr' : 'hrs'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {(() => {
                const midVal = variables['mid'] !== undefined ? Number(variables['mid']) : -1;
                const hVal = variables['h'] !== undefined ? Number(variables['h']) : 8;
                if (midVal !== -1) {
                  const totalHours = values.reduce((sum, pile) => sum + Math.ceil(pile / midVal), 0);
                  const canFinish = totalHours <= hVal;
                  return (
                    <div className="flex flex-col items-center gap-3 w-full">
                      <div className="flex items-center gap-2 font-mono text-xs font-black text-slate-800 bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-2">
                        <span>Total Time: {values.map(pile => Math.ceil(pile / midVal)).join(' + ')} = {totalHours} hrs</span>
                        <span>vs</span>
                        <span>Target: {hVal} hrs</span>
                      </div>

                      <div className={`text-[11px] font-bold p-3 rounded-xl border w-full text-center leading-relaxed ${
                        canFinish 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {canFinish ? (
                          <span>
                            Can Koko finish all bananas within {hVal} hours if she eats {midVal} bananas per hour? <strong>Yes!</strong> ({totalHours} hrs ≤ {hVal} limit). Speed {midVal} works. Let's try a smaller speed (shift right boundary to mid - 1).
                          </span>
                        ) : (
                          <span>
                            Can Koko finish all bananas within {hVal} hours if she eats {midVal} bananas per hour? <strong>No!</strong> ({totalHours} hrs &gt; {hVal} limit). Speed {midVal} is too slow. Let's try a faster speed (shift left boundary to mid + 1).
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="w-full flex items-center justify-between mb-4 border-b border-slate-200/60 pb-2">
            <span className="text-sm font-semibold text-indigo-650 flex items-center gap-1.5 font-mono">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              array {name} [{values.length}]
            </span>
          </div>
          {/* Main visualization grid container */}
          {isSortingStep ? (
            <div className="flex flex-col items-center gap-5 py-5 w-full animate-fade-in">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono mb-2">Before Sort</span>
                <div className="flex items-center gap-2">
                  {beforeSortValues.map((val: any, idx: number) => (
                    <div key={idx} className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center font-bold font-mono text-xs text-slate-500">
                      {val}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center text-indigo-650 my-1">
                <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                </svg>
                <span className="text-[9px] font-black uppercase tracking-wider font-mono mt-0.5">Sorting Array...</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-650 font-mono mb-2">After Sort</span>
                <div className="flex items-center gap-2">
                  {values.map((val: any, idx: number) => (
                    <div key={idx} className="w-9 h-9 rounded-xl border-2 border-indigo-500 bg-indigo-50/10 flex items-center justify-center font-bold font-mono text-xs text-indigo-700 shadow-sm animate-pulse-subtle">
                      {val}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
        <div
          id={`array-scroll-${name}`}
          className="relative py-2 w-full flex flex-col items-center overflow-x-auto select-none min-h-0 px-8"
        >
          {/* Cells and Pointers relative wrapper */}
          <div className="relative pt-8 pb-10">
            {/* Sliding window container or cells layout */}
            <div className="flex relative items-start" style={{ gap: `${gapWidth}px` }}>
              
              {/* Window Overlay */}
              {windowRange && (
                <motion.div
                  initial={false}
                  animate={{
                    left: windowRange.start * stepWidth - 4,
                    width: (windowRange.end - windowRange.start + 1) * stepWidth - gapWidth + 8
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="absolute top-[-4px] rounded-xl bg-indigo-500/5 border-2 border-indigo-400/25 z-0 pointer-events-none"
                  style={{ height: `${cellWidth + 8}px` }}
                />
              )}
   
              {values.map((val, idx) => {
                const isActive = idx === activeIndex;
                const isWindowCell = windowRange && idx >= windowRange.start && idx <= windowRange.end;
                const cellOverlay = getCellOverlay(idx);
                
                // Highlight classes depending on role
                let borderClass = 'border-slate-200 bg-slate-50 text-slate-800 shadow-sm';
                if (isActive) {
                  borderClass = 'border-amber-500 bg-amber-500/10 text-amber-700 ring-2 ring-amber-500/30 shadow-md';
                } else if (isWindowCell) {
                  borderClass = 'border-indigo-500/35 bg-indigo-50/20 text-indigo-700';
                }
   
                return (
                  <div
                    key={idx}
                    id={`array-cell-${name}-${idx}`}
                    className="flex flex-col items-center gap-1 relative z-10"
                    style={{ width: `${cellWidth}px` }}
                  >
                    {/* Speech bubble + Arrow stem anchored directly to cell */}
                    {cellOverlay && (
                      <ContextBubble
                        message={cellOverlay.message}
                        variant={cellOverlay.variant}
                        animation="pop"
                        position="top"
                        className="absolute bottom-[40px] left-1/2 transform -translate-x-1/2"
                      />
                    )}
                    {/* Cell content */}
                    <motion.div
                      layout
                      className={`rounded-xl border flex items-center justify-center font-bold font-mono transition-all duration-300 ${borderClass} ${
                        values.length > 25 ? 'text-[10px]' : (values.length > 15 ? 'text-xs' : 'text-sm')
                      }`}
                      style={{ width: `${cellWidth}px`, height: `${cellWidth}px` }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.span
                        key={val}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {val}
                      </motion.span>
                    </motion.div>
                    
                    {/* Index marker */}
                    <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-amber-500' : 'text-slate-400'}`}>
                      {idx}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Pointers track inside the same relative wrapper */}
            {pointers.length > 0 && (
              <div className="absolute left-0 right-0 bottom-0 h-10">
                {pointers.map((ptr, pIdx) => {
                  const offsetLeft = ptr.index * stepWidth + (cellWidth / 2);
                  const stackY = pIdx * 16;
                  const isLeft = ptr.name === 'left';
                  const isRight = ptr.name === 'right';
                  
                  let movementArrow = null;
                  if (twoSumIIData) {
                    if (twoSumIIData.sum > twoSumIIData.targetVal && isRight) {
                      movementArrow = (
                        <motion.span 
                          animate={{ x: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="text-white font-extrabold text-[10px] ml-1"
                        >
                          ←
                        </motion.span>
                      );
                    } else if (twoSumIIData.sum < twoSumIIData.targetVal && isLeft) {
                      movementArrow = (
                        <motion.span 
                          animate={{ x: [0, 4, 0] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="text-white font-extrabold text-[10px] ml-1"
                        >
                          ➔
                        </motion.span>
                      );
                    }
                  } else if (threeSumData) {
                    if (threeSumData.sum > 0 && isRight) {
                      movementArrow = (
                        <motion.span 
                          animate={{ x: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="text-white font-extrabold text-[10px] ml-1"
                        >
                          ←
                        </motion.span>
                      );
                    } else if (threeSumData.sum < 0 && isLeft) {
                      movementArrow = (
                        <motion.span 
                          animate={{ x: [0, 4, 0] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="text-white font-extrabold text-[10px] ml-1"
                        >
                          ➔
                        </motion.span>
                      );
                    }
                  }

                  return (
                    <motion.div
                      key={ptr.name}
                      initial={false}
                      animate={{ left: offsetLeft, y: stackY }}
                      transition={{ type: "spring", stiffness: 220, damping: 25 }}
                      className="absolute transform -translate-x-1/2 flex flex-col items-center z-20"
                    >
                      <motion.span 
                        animate={{ y: [2, -2, 2] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-indigo-650 text-xs font-bold leading-none"
                      >
                        ▲
                      </motion.span>
                      <span className={`pointer-tag-label pointer-tag-${ptr.name.toLowerCase()} px-1.5 py-0.5 rounded text-[9px] font-extrabold font-mono border shadow-md whitespace-nowrap uppercase tracking-wider ${getPointerColor(ptr.name)} flex items-center justify-center`}>
                        {ptr.name}
                        {movementArrow}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )}

      {/* Two Sum II Center Math Comparison Panel */}
      {!isSortingStep && twoSumIIData && (
        <div className="mt-2 mb-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl px-8 py-4 flex flex-col items-center justify-center min-w-[320px] shadow-sm animate-fade-in">
          <div className="flex items-center gap-4 text-base font-bold font-mono text-slate-800">
            <span className="text-cyan-600 bg-cyan-50 px-2 py-1 rounded-lg border border-cyan-200">{twoSumIIData.lNum}</span>
            <span className="text-slate-405 font-sans">+</span>
            <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">{twoSumIIData.rNum}</span>
            <span className="text-slate-405 font-sans">=</span>
            <span className={`px-2.5 py-1 rounded-lg border ${
              twoSumIIData.sum === twoSumIIData.targetVal 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                : 'bg-indigo-50 text-indigo-600 border-indigo-200'
            }`}>
              {twoSumIIData.sum}
            </span>
          </div>

          <div className="mt-2.5 flex flex-col items-center">
            {twoSumIIData.sum === twoSumIIData.targetVal ? (
              <div className="flex flex-col items-center gap-1.5 text-center">
                <span className="text-emerald-500 font-extrabold text-[10px]">▲</span>
                <span className="text-[10px] font-black text-emerald-600 tracking-wider uppercase font-mono">
                  Target = {twoSumIIData.targetVal} (Match found! 🎉)
                </span>
                <div className="text-[10px] text-slate-500 max-w-[280px] leading-normal border-t border-slate-100 pt-1.5 font-sans">
                  <strong>💡 Note:</strong> Since the problem asks for 1-indexed results, we add 1 to each index and return <strong>[{twoSumIIData.lIdx + 1}, {twoSumIIData.rIdx + 1}]</strong> instead of [{twoSumIIData.lIdx}, {twoSumIIData.rIdx}].
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px] font-mono">
                  <span>Current Sum ({twoSumIIData.sum})</span>
                  <span>{twoSumIIData.sum > twoSumIIData.targetVal ? '>' : '<'}</span>
                  <span>Target ({twoSumIIData.targetVal})</span>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  twoSumIIData.sum > twoSumIIData.targetVal 
                    ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                    : 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                }`}>
                  {twoSumIIData.sum > twoSumIIData.targetVal ? 'Move RIGHT ←' : 'Move LEFT ➔'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3Sum Center Math Comparison Panel */}
      {!isSortingStep && threeSumData && (
        <div className="mt-2 mb-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl px-8 py-4 flex flex-col items-center justify-center min-w-[340px] shadow-sm animate-fade-in">
          <div className="flex items-center gap-3.5 text-base font-bold font-mono text-slate-800">
            <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">{threeSumData.iNum}</span>
            <span className="text-slate-405 font-sans">+</span>
            <span className="text-cyan-600 bg-cyan-50 px-2 py-1 rounded-lg border border-cyan-200">{threeSumData.lNum}</span>
            <span className="text-slate-405 font-sans">+</span>
            <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">{threeSumData.rNum}</span>
            <span className="text-slate-405 font-sans">=</span>
            <span className={`px-2.5 py-1 rounded-lg border ${
              threeSumData.sum === 0 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                : 'bg-indigo-50 text-indigo-600 border-indigo-200'
            }`}>
              {threeSumData.sum}
            </span>
          </div>

          <div className="mt-2.5 flex flex-col items-center">
            {threeSumData.sum === 0 ? (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-emerald-500 font-extrabold text-[10px]">▲</span>
                <span className="text-[10px] font-black text-emerald-600 tracking-wider uppercase font-mono">
                  🎉 Valid triplet found! [{threeSumData.iNum}, {threeSumData.lNum}, {threeSumData.rNum}]
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px] font-mono">
                  <span>Current Sum ({threeSumData.sum})</span>
                  <span>{threeSumData.sum > 0 ? '>' : '<'}</span>
                  <span>Target (0)</span>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  threeSumData.sum > 0 
                    ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                    : 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                }`}>
                  {threeSumData.sum > 0 ? 'Move RIGHT ←' : 'Move LEFT ➔'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
