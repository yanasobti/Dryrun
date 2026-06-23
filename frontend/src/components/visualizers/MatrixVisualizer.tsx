import React, { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';

interface MatrixVisualizerProps {
  name: string;
  grid: any[][];
  frames: any[];
  currentFrameIndex: number;
  visualizerState?: any;
  strategy?: string;
}

export const MatrixVisualizer: React.FC<MatrixVisualizerProps> = ({
  name,
  grid: activeGrid,
  frames,
  currentFrameIndex,
  visualizerState,
  strategy
}) => {
  // 1. Immutable Background Layer: Cache the original grid on first render
  const originalGridRef = useRef<any[][] | null>(null);
  if (!originalGridRef.current && frames && frames[0]) {
    // Attempt to extract grid from first frame arrays or variables
    const initialArrays = frames[0].arrays || {};
    const gridVal = initialArrays['grid'] || initialArrays['image'] || initialArrays[name];
    if (gridVal && Array.isArray(gridVal)) {
      originalGridRef.current = JSON.parse(JSON.stringify(gridVal));
    }
  }

  // Fallback to active grid if not cached
  const originalGrid = originalGridRef.current || activeGrid;
  
  const activeFrame = frames[currentFrameIndex] || {};
  const currentVars = activeFrame.variables || {};

  console.log("console.log(frame.variables):", activeFrame.variables);
  console.log("console.log(visualizerState):", visualizerState);

  if (!originalGrid || !Array.isArray(originalGrid) || originalGrid.length === 0 || !originalGrid[0]) return null;

  const C = originalGrid[0].length;
  const prevFrame = currentFrameIndex > 0 ? frames[currentFrameIndex - 1] : null;
  const prevVars = prevFrame ? prevFrame.variables : {};

  // 2. Active Cell Detection
  const isBinarySearch = strategy === 'classic_search' || (currentVars['left'] !== undefined && currentVars['mid'] !== undefined);

  const activeR = currentVars['i'] !== undefined ? parseInt(currentVars['i']) : 
                  currentVars['r'] !== undefined ? parseInt(currentVars['r']) : -1;

  const activeC = currentVars['j'] !== undefined ? parseInt(currentVars['j']) : 
                  currentVars['c'] !== undefined ? parseInt(currentVars['c']) : -1;

  const prevR = prevVars['i'] !== undefined ? parseInt(prevVars['i']) : 
                prevVars['r'] !== undefined ? parseInt(prevVars['r']) : -1;

  const prevC = prevVars['j'] !== undefined ? parseInt(prevVars['j']) : 
                prevVars['c'] !== undefined ? parseInt(prevVars['c']) : -1;

  const minCellWidth = useMemo(() => {
    if (C <= 4) return '80px';
    if (C <= 8) return '64px';
    return '48px';
  }, [C]);

  const cellClassSize = useMemo(() => {
    if (C <= 4) return 'w-20 h-20 text-lg';
    if (C <= 8) return 'w-16 h-16 text-base';
    return 'w-11 h-11 text-xs';
  }, [C]);

  // 3. Chronological Scan to assign Unique Island IDs and color codes
  const { cellIslands, maxIslandCount, activeIsland } = useMemo(() => {
    const mapping: Record<string, number> = {};
    let islandCounter = 0;
    let currentActiveIsland = 0;
    
    for (let fIdx = 0; fIdx <= currentFrameIndex; fIdx++) {
      const f = frames[fIdx];
      if (!f) continue;
      const vars = f.variables || {};
      const code = (f.code || "").trim();
      
      // If DFS starts
      if (f.methodName === 'numIslands' && (code.includes('dfs(') || code.includes('numIslands++'))) {
        if (code.includes('dfs(')) {
          islandCounter++;
          currentActiveIsland = islandCounter;
        }
      }
      
      // Map active cell to the current island
      if (f.methodName === 'dfs') {
        const rVal = vars['i'] !== undefined ? parseInt(vars['i']) : vars['r'] !== undefined ? parseInt(vars['r']) : -1;
        const cVal = vars['j'] !== undefined ? parseInt(vars['j']) : vars['c'] !== undefined ? parseInt(vars['c']) : -1;
        if (rVal !== -1 && cVal !== -1 && currentActiveIsland > 0) {
          mapping[`${rVal},${cVal}`] = currentActiveIsland;
        }
      }
    }
    
    return { 
      cellIslands: mapping, 
      maxIslandCount: islandCounter,
      activeIsland: currentActiveIsland
    };
  }, [frames, currentFrameIndex]);

  // 4. Directional Arrow calculation
  const moveDirection = useMemo(() => {
    if (activeR === -1 || activeC === -1 || prevR === -1 || prevC === -1) return null;
    if (activeR < prevR) return 'up';
    if (activeR > prevR) return 'down';
    if (activeC < prevC) return 'left';
    if (activeC > prevC) return 'right';
    return null;
  }, [activeR, activeC, prevR, prevC]);

  // 6. Connected Cells Visited Count
  const connectedVisitedCount = useMemo(() => {
    if (activeIsland === 0) return 0;
    return Object.values(cellIslands).filter(id => id === activeIsland).length;
  }, [cellIslands, activeIsland]);

  // 5. Floating Speech Bubble Text
  const statusBubbleText = useMemo(() => {
    if (activeR === -1 || activeC === -1) return null;
    
    // Check if we just completed DFS and returned to numIslands
    const prevFrame = currentFrameIndex > 0 ? frames[currentFrameIndex - 1] : null;
    const justFinishedDfs = activeFrame.methodName === 'numIslands' && prevFrame && prevFrame.methodName === 'dfs';
    if (justFinishedDfs && activeIsland > 0) {
      return `Island #${activeIsland} Complete! Cells explored: ${connectedVisitedCount}`;
    }

    if (activeFrame.methodName === 'dfs') {
      const rawExpl = typeof activeFrame.explanation === 'object' 
        ? (activeFrame.explanation.explanation || '') 
        : (activeFrame.explanation || '');
      const expl = String(rawExpl).toLowerCase();
      
      if (expl.includes('boundary') || expl.includes('out of bounds')) {
        return "Boundary check";
      }
      if (expl.includes('water')) {
        return "Water (0)";
      }
      if (expl.includes('already') || expl.includes('visited')) {
        return "Already visited";
      }
      return "Connected land found";
    }

    // New Island Discovery
    const code = (activeFrame.code || "").trim();
    if (activeFrame.methodName === 'numIslands' && (code.includes('numIslands++') || code.includes('dfs('))) {
      return `New Island Found! (#${maxIslandCount})`;
    }

    // Default scanning: return null so we don't distract the user
    return null;
  }, [activeR, activeC, activeFrame, currentFrameIndex, frames, activeIsland, connectedVisitedCount, maxIslandCount]);

  // Island Color Schemes
  const getIslandColorClass = (islandId: number) => {
    switch (islandId) {
      case 1: return 'bg-emerald-600 border-emerald-700 text-white font-black shadow-md';
      case 2: return 'bg-blue-600 border-blue-700 text-white font-black shadow-md';
      case 3: return 'bg-amber-500 border-amber-600 text-white font-black shadow-md';
      case 4: return 'bg-purple-600 border-purple-700 text-white font-black shadow-md';
      default: return 'bg-teal-600 border-teal-700 text-white font-black shadow-md';
    }
  };

  // Determine grid cell background classes
  const getCellClasses = (r: number, c: number, cellVal: any) => {
    const isTarget = r === activeR && c === activeC;
    const key = `${r},${c}`;
    const islandId = cellIslands[key];

    if (isTarget) {
      if (activeFrame.methodName === 'dfs') {
        return 'bg-purple-500 border-purple-600 text-white font-black shadow-lg scale-110 z-20 animate-pulse';
      }
      const code = (activeFrame.code || "").trim();
      if (activeFrame.methodName === 'numIslands' && (code.includes('numIslands++') || code.includes('dfs('))) {
        return 'bg-purple-500 border-purple-600 text-white font-black shadow-lg scale-110 z-20 animate-pulse';
      }
      const strVal = String(cellVal).replace(/'/g, '').trim();
      const baseBg = strVal === '0' 
        ? 'bg-slate-100 text-slate-350' 
        : (islandId !== undefined ? getIslandColorClass(islandId) : 'bg-sky-100 text-sky-700 font-bold');
      return `${baseBg} border-indigo-500 border-2 scale-105 z-10`;
    }

    if (islandId !== undefined) {
      return getIslandColorClass(islandId);
    }

    if (isBinarySearch) {
      const leftVal = currentVars['left'] !== undefined ? parseInt(currentVars['left']) : -1;
      const rightVal = currentVars['right'] !== undefined ? parseInt(currentVars['right']) : -1;
      const midVal = currentVars['mid'] !== undefined ? parseInt(currentVars['mid']) : -1;
      const keyIndex = r * C + c;

      if (keyIndex === midVal) {
        return 'bg-amber-500/10 border-amber-500 border-2 text-amber-700 font-black shadow-md scale-105 z-10';
      }
      if (keyIndex === leftVal) {
        return 'bg-cyan-500/10 border-cyan-500 border-2 text-cyan-700 font-bold';
      }
      if (keyIndex === rightVal) {
        return 'bg-rose-500/10 border-rose-500 border-2 text-rose-700 font-bold';
      }
      if (leftVal !== -1 && rightVal !== -1 && (keyIndex < leftVal || keyIndex > rightVal)) {
        return 'bg-slate-50 border-slate-200 text-slate-350 opacity-40';
      }
    }

    const strVal = String(cellVal).replace(/'/g, '').trim();
    if (strVal === '0') {
      return 'bg-slate-100 border-slate-200 text-slate-300';
    }
    // Unvisited land
    return 'bg-sky-100 border-sky-300 text-sky-700 font-bold hover:bg-sky-200';
  };

  return (
    <div className="w-full flex flex-col items-center bg-slate-50 border border-slate-200/60 rounded-xl p-5 shadow-inner">
      {(strategy || isBinarySearch) && (
        <div className="text-center border-b border-slate-200/20 pb-2.5 mb-3 w-full">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
            {isBinarySearch 
              ? 'Binary Search • Classic Target Search' 
              : strategy === 'search_on_answer'
              ? 'Binary Search • Search on Answer (Optimization)'
              : strategy === 'rotated_array_search'
              ? 'Binary Search • Rotated Sorted Array Search'
              : 'Binary Search'}
          </span>
        </div>
      )}

      {/* ── TOP SUMMARY DASHBOARD ── */}
      {!isBinarySearch && (activeFrame.methodName === 'dfs' || activeFrame.methodName === 'numIslands') && (
        <div className="w-full grid grid-cols-4 gap-2 mb-6 bg-white border border-slate-200/60 rounded-xl p-3 shadow-sm text-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Islands Found</div>
            <motion.div 
              key={maxIslandCount}
              initial={{ scale: 0.8, color: "#10b981" }}
              animate={{ scale: 1, color: "#1e293b" }}
              className="text-lg font-black font-sans-premium"
            >
              {maxIslandCount}
            </motion.div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Current Cell</div>
            <div className="text-lg font-bold font-sans-premium text-slate-700">
              {activeR !== -1 ? `(${activeR}, ${activeC})` : '—'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">DFS Status</div>
            <div className="text-sm font-extrabold uppercase font-sans-premium text-indigo-600 mt-0.5">
              {activeFrame.methodName === 'dfs' ? 'Exploring' : 'Scanning'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Connected Land</div>
            <div className="text-lg font-bold font-sans-premium text-slate-700">
              {connectedVisitedCount}
            </div>
          </div>
        </div>
      )}

      {/* ── GRID CANVAS AREA ── */}
      <div className="relative overflow-visible max-w-full p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex justify-center items-center w-full">
        <div 
          className="grid gap-2.5 relative justify-center mx-auto"
          style={{ gridTemplateColumns: `repeat(${C + 1}, minmax(${minCellWidth}, 1fr))` }}
        >
          {/* Top-Left Corner Header */}
          <div className={`${cellClassSize} flex items-center justify-center text-[10px] font-mono text-slate-400 font-bold border border-transparent`}>
            r \ c
          </div>

          {/* Column Indices */}
          {Array.from({ length: C }).map((_, c) => (
            <div key={`col-header-${c}`} className={`${cellClassSize} flex items-center justify-center text-xs font-mono text-slate-400 font-bold border border-transparent`}>
              {c}
            </div>
          ))}

          {/* Grid Rows with Row Index Headers */}
          {originalGrid.map((row, r) => (
            <React.Fragment key={`grid-row-frag-${r}`}>
              {/* Row Index Header */}
              <div className={`${cellClassSize} flex items-center justify-center text-xs font-mono text-slate-400 font-bold border border-transparent`}>
                {r}
              </div>

              {row.map((val, c) => {
                const isTarget = r === activeR && c === activeC;
                const leftVal = currentVars['left'] !== undefined ? parseInt(currentVars['left']) : -1;
                const rightVal = currentVars['right'] !== undefined ? parseInt(currentVars['right']) : -1;
                const midVal = currentVars['mid'] !== undefined ? parseInt(currentVars['mid']) : -1;
                const keyIndex = r * C + c;

                return (
                  <div
                    key={`island-cell-${r}-${c}`}
                    className={`${cellClassSize} flex items-center justify-center border rounded-xl font-bold font-mono transition-all duration-300 relative ${getCellClasses(r, c, val)}`}
                  >
                    {/* Flat index labels for binary search matrix */}
                    {isBinarySearch && (
                      <div className="absolute inset-0 flex flex-col justify-between p-1 pointer-events-none select-none text-[9px] font-black font-mono">
                        <div className="flex justify-between w-full">
                          {keyIndex === leftVal && <span className="bg-cyan-500 text-white px-1 rounded leading-none">left</span>}
                          {keyIndex === rightVal && <span className="bg-rose-500 text-white px-1 rounded leading-none ml-auto">right</span>}
                        </div>
                        {keyIndex === midVal && <span className="bg-amber-500 text-white px-1 py-0.5 rounded leading-none mx-auto mb-1">mid</span>}
                      </div>
                    )}

                    {/* Floating speech bubble directly on active cell */}
                    {isTarget && statusBubbleText && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded-md shadow-md z-30 whitespace-nowrap animate-bounce font-sans font-bold uppercase tracking-wider">
                        {statusBubbleText}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                      </div>
                    )}

                    {/* Directional Movement Indicator Arrows */}
                    {isTarget && moveDirection && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 text-white opacity-80 text-lg">
                        {moveDirection === 'up' && '▲'}
                        {moveDirection === 'down' && '▼'}
                        {moveDirection === 'left' && '◀'}
                        {moveDirection === 'right' && '▶'}
                      </div>
                    )}

                    {String(val).replace(/'/g, '')}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
