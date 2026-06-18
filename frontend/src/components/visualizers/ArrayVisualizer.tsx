import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { VisualEvent } from '../../utils/visualEvent';
import { ContextBubble } from './ContextBubble';

interface ArrayVisualizerProps {
  name: string;
  values: any[];
  variables: Record<string, any>;
  codeLine?: string;
  visualEvents?: VisualEvent[];
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({
  name,
  values,
  variables,
  codeLine = "",
  visualEvents = []
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

  const getCellOverlayText = (idx: number) => {
    // Custom check for valid-anagram string characters
    if (name === 's' && idx === variables['i'] && codeLine.includes('s.charAt')) {
      return `char '${values[idx]}' : +1`;
    }
    if (name === 't' && idx === variables['i'] && codeLine.includes('t.charAt')) {
      return `char '${values[idx]}' : -1`;
    }

    if (!visualEvents || visualEvents.length === 0) return "";
    
    const sortedEvents = [...visualEvents].sort((a, b) => b.priority - a.priority);

    for (const event of sortedEvents) {
      const { type, details } = event;

      // ARITHMETIC
      if (type === 'ARITHMETIC') {
        if (details.index === idx && details.needed !== undefined) {
          return `Need ${details.needed}`;
        }
        if (details.index === idx && details.min !== undefined) {
          const val = values[idx];
          return `Margin: ${val} - ${details.min} = ${val - details.min}`;
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

            return `${val} ${op} ${target}? ${res ? 'YES' : 'NO'}`;
          }
        }
      }

      // MID_CALC
      if (type === 'MID_CALC' && details.mid === idx) {
        return `mid = ${idx}`;
      }

      // ARRAY_UPDATE
      if (type === 'ARRAY_UPDATE' && details.name === name && details.index === idx) {
        return `Update: ${details.prevVal} ➔ ${details.val}`;
      }

      // POINTER_SHIFT
      if (type === 'POINTER_SHIFT' && details.to === idx) {
        return `Shift ${details.pointer}`;
      }

      // MATCH_FOUND
      if (type === 'MATCH_FOUND') {
        if (details.i === idx) {
          return `Match!`;
        }
        const compVal = details.complement;
        if (compVal !== undefined) {
          const mapVar = Object.values(variables).find(v => String(v).includes(`{`));
          if (mapVar) {
            const entryMatch = String(mapVar).match(new RegExp(`${compVal}=(\\d+)`));
            if (entryMatch && Number(entryMatch[1]) === idx) {
              return `Match Found!`;
            }
          }
        }
      }
    }

    return "";
  };

  // Identify pointers pointing to an index inside the array
  const pointers = useMemo(() => {
    const pNames = ['i', 'j', 'left', 'right', 'mid', 'low', 'high', 'start', 'end', 'k'];
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
    return null;
  }, [variables, values]);

  // Determine which index in the array to prioritize for centering/scrolling
  const primaryScrollIndex = useMemo(() => {
    if (activeIndex !== -1) return activeIndex;
    if (pointers.length > 0) return pointers[0].index;
    return -1;
  }, [activeIndex, pointers]);

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
        return 'bg-cyan-500 text-slate-950 border-cyan-400';
      case 'right':
      case 'j':
        return 'bg-rose-500 text-slate-50 border-rose-400';
      case 'mid':
        return 'bg-amber-500 text-slate-950 border-amber-400';
      default:
        return 'bg-indigo-500 text-slate-50 border-indigo-400';
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4 border-b border-slate-200/60 pb-2">
        <span className="text-sm font-semibold text-indigo-600 flex items-center gap-1.5 font-mono">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          array {name} [{values.length}]
        </span>
      </div>

      {/* Main visualization grid container */}
      <div
        id={`array-scroll-${name}`}
        className="relative py-2 w-full flex flex-col items-center overflow-x-auto select-none min-h-0 px-8"
      >
        
        {/* Cells and Pointers relative wrapper */}
        <div className="relative pt-8 pb-10">
          {/* Sliding window container or cells layout */}
          <div className="flex gap-2 relative items-start">
            
            {/* Window Overlay */}
            {windowRange && (
              <motion.div
                initial={false}
                animate={{
                  left: windowRange.start * 48 - 4,
                  width: (windowRange.end - windowRange.start + 1) * 48
                }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="absolute top-[-4px] h-[48px] rounded-xl bg-indigo-500/5 border-2 border-indigo-400/25 z-0 pointer-events-none"
              />
            )}
 
            {values.map((val, idx) => {
              const isActive = idx === activeIndex;
              const isWindowCell = windowRange && idx >= windowRange.start && idx <= windowRange.end;
              const cellOverlay = getCellOverlayText(idx);
              
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
                  className="flex flex-col items-center gap-1 w-[40px] relative z-10"
                >
                  {/* Speech bubble + Arrow stem anchored directly to cell */}
                  {cellOverlay && (
                    <ContextBubble
                      message={cellOverlay}
                      variant={cellOverlay.includes(': +1') ? 'success' : cellOverlay.includes(': -1') ? 'action' : 'info'}
                      animation="pop"
                      position="top"
                      className="absolute bottom-[40px] left-1/2 transform -translate-x-1/2"
                    />
                  )}
                  {/* Cell content */}
                  <motion.div
                    layout
                    className={`w-[40px] h-[40px] rounded-xl border flex items-center justify-center font-bold text-sm font-mono transition-all duration-300 ${borderClass}`}
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
                const offsetLeft = ptr.index * 48 + 20;
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
                      className="text-indigo-600 text-xs font-bold leading-none"
                    >
                      ▲
                    </motion.span>
                    <span className={`pointer-tag-label pointer-tag-${ptr.name.toLowerCase()} px-1.5 py-0.5 rounded text-[9px] font-extrabold font-mono border shadow-md whitespace-nowrap uppercase tracking-wider ${getPointerColor(ptr.name)}`}>
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
  );
};
