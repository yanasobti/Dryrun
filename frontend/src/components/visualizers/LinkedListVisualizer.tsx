import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ContextBubble } from './ContextBubble';

interface LinkedListVisualizerProps {
  name: string;
  rootRefId: string;
  nodes: Record<string, any>;
  variables: Record<string, any>;
  codeLine?: string;
}

export const LinkedListVisualizer: React.FC<LinkedListVisualizerProps> = ({
  name,
  rootRefId,
  nodes,
  variables
}) => {
  const getNodeOverlayText = (ptrs: string[], val: any) => {
    if (ptrs.length === 0) return "";
    return ptrs.map(p => `${p} = ${val}`).join(', ');
  };
  // Extract node pointer ids from variables
  const activeNodeId = useMemo(() => {
    for (const [key, val] of Object.entries(variables)) {
      if (key === 'args') continue;
      if (typeof val === 'string') {
        const match = val.match(/id=([a-fA-F0-9]+)/);
        if (match) {
          const refId = match[1];
          if (nodes[refId]) return refId;
        }
      }
    }
    return null;
  }, [variables, nodes]);

  // Prioritize pointer targets to scroll to (curr -> slow -> fast -> prev -> head)
  const targetScrollNodeId = useMemo(() => {
    const priority = ['curr', 'current', 'slow', 'fast', 'temp', 'nexttemp', 'prev', 'head'];
    const varEntries = Object.entries(variables).filter(([k]) => k !== 'args');
    
    for (const name of priority) {
      const entry = varEntries.find(([k]) => k.toLowerCase() === name);
      if (entry && typeof entry[1] === 'string') {
        const match = entry[1].match(/id=([a-fA-F0-9]+)/);
        if (match) {
          const refId = match[1];
          if (nodes[refId]) return refId;
        }
      }
    }
    
    // Fallback: first found ListNode reference
    for (const [_, val] of varEntries) {
      if (typeof val === 'string') {
        const match = val.match(/id=([a-fA-F0-9]+)/);
        if (match) {
          const refId = match[1];
          if (nodes[refId]) return refId;
        }
      }
    }
    return null;
  }, [variables, nodes]);

  // Smooth scroll active node to the horizontal center of the container
  React.useEffect(() => {
    if (targetScrollNodeId) {
      const activeNodeEl = document.getElementById(`node-${rootRefId}-${targetScrollNodeId}`);
      const scrollContainerEl = document.getElementById(`list-scroll-${rootRefId}`);
      
      if (activeNodeEl && scrollContainerEl) {
        const containerRect = scrollContainerEl.getBoundingClientRect();
        const nodeRect = activeNodeEl.getBoundingClientRect();
        
        const relativeLeft = nodeRect.left - containerRect.left;
        const scrollOffset = relativeLeft - (containerRect.width / 2) + (nodeRect.width / 2);
        
        scrollContainerEl.scrollBy({
          left: scrollOffset,
          behavior: 'smooth'
        });
      }
    }
  }, [targetScrollNodeId, rootRefId]);

  // Construct linked list chain (prevent infinite loops with cyclic set)
  const chain = useMemo(() => {
    const arr: any[] = [];
    let currId = rootRefId;
    const visited = new Set<string>();

    while (currId && nodes[currId] && !visited.has(currId)) {
      visited.add(currId);
      const node = nodes[currId];
      arr.push(node);
      
      // Resolve next node ID
      let nextId = null;
      if (node.next) {
        if (typeof node.next === 'string') {
          const match = node.next.match(/id=([a-fA-F0-9]+)/);
          nextId = match ? match[1] : node.next;
        } else if (node.next.refId) {
          nextId = node.next.refId;
        } else {
          nextId = String(node.next);
        }
      }
      currId = nextId;
    }
    return { arr, lastId: currId, hasCycle: currId ? visited.has(currId) : false };
  }, [rootRefId, nodes]);

  const cycleTargetIdx = useMemo(() => {
    if (!chain.hasCycle || !chain.lastId) return -1;
    return chain.arr.findIndex(node => node.refId === chain.lastId);
  }, [chain]);

  const distanceBack = useMemo(() => {
    if (cycleTargetIdx === -1) return 0;
    const stepsBack = (chain.arr.length - 1) - cycleTargetIdx;
    return stepsBack * 128; // w-16 (64px) + gap-16 (64px) = 128px per step
  }, [chain.arr.length, cycleTargetIdx]);

  // Group variable pointers pointing to each node
  const pointersByRef = useMemo(() => {
    const map: Record<string, string[]> = {};
    Object.entries(variables).forEach(([key, val]) => {
      if (key === 'args') return;
      if (typeof val === 'string') {
        const match = val.match(/id=([a-fA-F0-9]+)/);
        if (match) {
          const refId = match[1];
          if (!map[refId]) map[refId] = [];
          map[refId].push(key);
        }
      }
    });
    return map;
  }, [variables]);

  const getPointerColor = (ptrName: string) => {
    switch (ptrName.toLowerCase()) {
      case 'slow':
        return 'bg-cyan-500 text-slate-950 border-cyan-400';
      case 'fast':
        return 'bg-rose-500 text-slate-50 border-rose-400';
      case 'head':
        return 'bg-indigo-500 text-slate-50 border-indigo-400';
      case 'curr':
      case 'current':
        return 'bg-amber-500 text-slate-950 border-amber-400';
      default:
        return 'bg-slate-700 text-slate-200 border-slate-600';
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4 border-b border-slate-200/60 pb-2">
        <span className="text-sm font-semibold text-indigo-600 flex items-center gap-1.5 font-mono">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          linkedlist {name} [{chain.arr.length} nodes]
          {chain.hasCycle && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 animate-pulse font-sans font-bold">
              ⚠️ Loop Cycle Detected!
            </span>
          )}
        </span>
      </div>

      {/* Viewbox wrapper */}
      <div
        id={`list-scroll-${rootRefId}`}
        className="w-full overflow-x-auto py-10 px-8 flex justify-start items-center min-h-[200px] select-none scrollbar-thin"
      >
        <div className="flex items-center gap-16 relative">
          {chain.arr.map((node, idx) => {
            const isActive = node.refId === activeNodeId;
            const ptrs = pointersByRef[node.refId] || [];
            const isLast = idx === chain.arr.length - 1;

            return (
              <div
                key={node.refId}
                id={`node-${rootRefId}-${node.refId}`}
                className="flex items-center relative z-10"
              >
                {/* Node circle & pointer labels */}
                <div className="flex flex-col items-center relative w-16">
                  {ptrs.length > 0 && (
                    <ContextBubble
                      message={getNodeOverlayText(ptrs, node.val)}
                      variant={ptrs.includes('fast') ? 'action' : ptrs.includes('slow') ? 'success' : 'info'}
                      animation="pop"
                      position="top"
                      className="absolute top-[-65px] left-1/2 transform -translate-x-1/2"
                    />
                  )}
                  {/* Floating pointer labels */}
                  <div className="absolute top-[-36px] flex flex-col gap-1 items-center h-8 justify-end">
                    {ptrs.map((ptr, pIdx) => (
                      <motion.span
                        key={ptr}
                        layoutId={`ptr-${ptr}`}
                        className={`pointer-tag-label pointer-tag-${ptr.toLowerCase()} px-2 py-0.5 rounded text-[9px] font-extrabold font-mono border shadow-sm uppercase tracking-wider ${getPointerColor(
                          ptr
                        )}`}
                        style={{ zIndex: 10 + pIdx }}
                      >
                        {ptr}
                      </motion.span>
                    ))}
                  </div>

                  {/* Circular Node Bubble */}
                  <motion.div
                    layout
                    whileHover={{ scale: 1.1 }}
                    className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center font-bold font-mono transition-all duration-300 relative ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-4 ring-indigo-500/15 shadow-md shadow-indigo-500/5'
                        : 'border-slate-200 bg-white text-slate-800 shadow-sm'
                    }`}
                  >
                    <span className="text-sm">{node.val}</span>
                    <span className="text-[9px] text-slate-400 font-normal mt-0.5">id:{node.refId}</span>
                  </motion.div>
                </div>

                {/* SVG Pointer Arrow to next node */}
                {!isLast && (
                  <div className="absolute left-14 w-16 h-8 flex items-center pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 64 32" fill="none">
                      <motion.path
                        initial={{ strokeDasharray: "100 100", strokeDashoffset: 100 }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ duration: 0.5 }}
                        d="M0 16 H 56"
                        stroke={isActive ? "#4f46e5" : "#94a3b8"}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M48 10 L 56 16 L 48 22"
                        stroke={isActive ? "#4f46e5" : "#94a3b8"}
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}

                {/* Cycle Arrow looping back to target node */}
                {isLast && chain.hasCycle && cycleTargetIdx !== -1 && (
                  <div className="absolute left-8 w-[240px] h-[100px] pointer-events-none z-0">
                    <svg className="w-full h-full overflow-visible" fill="none">
                      {/* Curving dashed line looping back */}
                      <motion.path
                        initial={{ strokeDasharray: "8, 8", strokeDashoffset: 100 }}
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

          {/* Null pointer box at the end (only if no loop cycle) */}
          {!chain.hasCycle && (
            <motion.div
              layout
              className="w-12 h-10 border border-dashed border-slate-200 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center font-mono text-xs uppercase"
            >
              null
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
