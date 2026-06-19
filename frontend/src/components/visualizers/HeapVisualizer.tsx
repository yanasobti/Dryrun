import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HeapVisualizerProps {
  name: string;
  elements: any[];
  isAbsent?: boolean;
}

export const HeapVisualizer: React.FC<HeapVisualizerProps> = ({ name, elements, isAbsent = false }) => {
  const [lastNonEmptyElements, setLastNonEmptyElements] = useState<any[]>([]);

  useEffect(() => {
    if (elements && elements.length > 0) {
      setLastNonEmptyElements(elements);
    }
  }, [elements]);

  const displayElements = elements.length > 0 ? elements : lastNonEmptyElements;
  const N = displayElements.length;
  const isHistorical = elements.length === 0 && lastNonEmptyElements.length > 0;

  // Build binary tree positions dynamically based on heap index formulas
  const { nodes, edges } = useMemo(() => {
    const list: { id: number; val: any; x: number; y: number }[] = [];
    const connectionLines: { from: number; to: number; key: string }[] = [];

    if (N === 0) return { nodes: list, edges: connectionLines };

    const canvasWidth = 200;
    const levelHeight = 35;
    const topPadding = 15;

    for (let i = 0; i < N; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const levelStartIdx = Math.pow(2, level) - 1;
      const offset = i - levelStartIdx;
      const totalInLevel = Math.pow(2, level);
      
      const x = ((offset + 0.5) * canvasWidth) / totalInLevel;
      const y = topPadding + level * levelHeight;

      list.push({ id: i, val: displayElements[i], x, y });

      // Add edge to parent if not root
      if (i > 0) {
        const parentIdx = Math.floor((i - 1) / 2);
        connectionLines.push({
          from: parentIdx,
          to: i,
          key: `edge-${parentIdx}-${i}`
        });
      }
    }

    return { nodes: list, edges: connectionLines };
  }, [displayElements, N]);

  // Determine height of canvas based on number of levels
  const canvasHeight = useMemo(() => {
    if (N === 0) return 40;
    const maxLevel = Math.floor(Math.log2(N));
    return 30 + maxLevel * 35 + 10;
  }, [N]);

  return (
    <div className={`w-full flex flex-col items-center p-4 bg-slate-50 border border-slate-200/60 rounded-xl shadow-inner transition-opacity duration-300 ${isHistorical ? 'opacity-70' : ''}`}>
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono flex flex-col items-center">
        <div>PriorityQueue (Heap): <span className="text-slate-800 font-bold">{name}</span></div>
        {isAbsent ? (
          <div className="text-[9px] text-indigo-600 font-bold mt-1 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full normal-case font-sans shadow-sm">
            Heap unchanged from previous step
          </div>
        ) : (
          isHistorical && <div className="text-[10px] text-amber-600 font-medium mt-0.5 normal-case font-sans">(Empty - Showing Last State)</div>
        )}
      </div>

      <div className="w-full max-w-[280px]">
        {N === 0 ? (
          <div className="text-xs text-slate-400 italic text-center py-4">Heap is empty</div>
        ) : (
          <svg viewBox={`0 0 200 ${canvasHeight}`} className="w-full overflow-visible">
            {/* Draw parent-child connections */}
            {edges.map(edge => {
              const p = nodes[edge.from];
              const c = nodes[edge.to];
              if (!p || !c) return null;

              return (
                <line
                  key={edge.key}
                  x1={p.x}
                  y1={p.y}
                  x2={c.x}
                  y2={c.y}
                  stroke="#cbd5e1"
                  strokeWidth={1.5}
                />
              );
            })}

            {/* Draw nodes */}
            {nodes.map(node => {
              const isFirst = node.id === 0;

              return (
                <g key={`heap-node-${node.id}`} transform={`translate(${node.x}, ${node.y})`}>
                  <motion.circle
                    r={10}
                    fill={isFirst ? "#fef3c7" : "#ffffff"}
                    stroke={isFirst ? "#d97706" : "#94a3b8"}
                    strokeWidth={isFirst ? 2 : 1.5}
                    whileHover={{ scale: 1.2 }}
                    className="cursor-pointer"
                  />
                  <text
                    dy="3"
                    textAnchor="middle"
                    fill={isFirst ? "#b45309" : "#334155"}
                    fontSize={8}
                    fontWeight="extrabold"
                    className="font-mono pointer-events-none"
                  >
                    {node.val}
                  </text>

                  {/* Heap Node Array Index Badge */}
                  <text
                    y={-12}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize={6}
                    className="font-mono pointer-events-none"
                  >
                    [{node.id}]
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Flat Array View underneath tree */}
      <div className="mt-4 flex flex-wrap gap-1 justify-center max-w-full">
        {displayElements.map((el, idx) => (
          <div
            key={`heap-array-${idx}`}
            className={`px-2 py-0.5 border text-xs font-mono rounded ${idx === 0 ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold' : 'bg-white border-slate-200 text-slate-700'}`}
          >
            <span className="text-[9px] text-slate-400 mr-1">[{idx}]</span>
            {el}
          </div>
        ))}
      </div>
    </div>
  );
};
