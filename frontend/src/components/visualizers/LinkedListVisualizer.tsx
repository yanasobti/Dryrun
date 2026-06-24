import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface LinkedListVisualizerProps {
  name: string;
  rootRefId: string;
  nodes: Record<string, any>;
  variables: Record<string, any>;
  codeLine?: string;
  strategy?: string;
  size?: 'normal' | 'small';
}

export const LinkedListVisualizer: React.FC<LinkedListVisualizerProps> = ({
  name,
  rootRefId,
  nodes,
  variables,
  strategy,
  size = 'normal'
}) => {
  // Extract node pointer ids from variables

  // Extract node pointer ids from variables
  const activeNodeId = useMemo(() => {
    const priority = ['curr', 'current', 'slow', 'fast', 'node', 'temp', 'nexttemp', 'prev', 'head'];
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
      
      // Resolve random pointer if it exists
      let randomId = null;
      if (node.random) {
        if (typeof node.random === 'string') {
          const match = node.random.match(/id=([a-fA-F0-9]+)/);
          randomId = match ? match[1] : node.random;
        } else if (node.random.refId) {
          randomId = node.random.refId;
        } else {
          randomId = String(node.random);
        }
      }

      arr.push({ ...node, randomId });
      
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

  const activeKGroup = useMemo(() => {
    if (strategy !== 'reverse_k_group' || !variables.k) return null;
    const k = parseInt(String(variables.k), 10);
    if (isNaN(k) || k <= 0) return null;
    
    let headNodeId = null;
    if (variables.head) {
      if (typeof variables.head === 'string') {
        const match = variables.head.match(/id=([a-fA-F0-9]+)/);
        headNodeId = match ? match[1] : variables.head;
      }
    }
    if (!headNodeId) return null;
    
    const headIdx = chain.arr.findIndex(n => n.refId === headNodeId);
    if (headIdx === -1) return null;
    
    const indices = [];
    for (let i = 0; i < k && headIdx + i < chain.arr.length; i++) {
      indices.push(chain.arr[headIdx + i].refId);
    }
    return indices;
  }, [strategy, variables, chain.arr]);

  const cycleTargetIdx = useMemo(() => {
    if (!chain.hasCycle || !chain.lastId) return -1;
    return chain.arr.findIndex(node => node.refId === chain.lastId);
  }, [chain]);

  const distanceBack = useMemo(() => {
    if (cycleTargetIdx === -1) return 0;
    const stepsBack = (chain.arr.length - 1) - cycleTargetIdx;
    const stepSize = size === 'small' ? 80 : 128;
    return stepsBack * stepSize;
  }, [chain.arr.length, cycleTargetIdx, size]);

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

  const stepSize = size === 'small' ? 80 : 128;
  const centerOffset = size === 'small' ? 20 : 28;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2 border-b border-slate-200/60 pb-1.5">
        <span className="text-xs font-semibold text-indigo-650 flex items-center gap-1.5 font-mono">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {name} [{chain.arr.length} nodes]
          {chain.hasCycle && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 animate-pulse font-sans font-bold">
              ⚠️ Loop Cycle Detected!
            </span>
          )}
        </span>
      </div>
      <div
        id={`list-scroll-${rootRefId}`}
        className={`w-full overflow-x-auto ${size === 'small' ? 'pt-6 pb-20 px-4 min-h-[140px]' : 'pt-10 pb-24 px-8 min-h-[200px]'} flex justify-start items-center select-none scrollbar-thin`}
      >
        <div className={`flex items-center ${size === 'small' ? 'gap-10' : 'gap-16'} relative`}>
          {/* SVG Overlay for Random Pointers */}
          {strategy === 'random_pointer_copy' && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
              {chain.arr.map((node, idx) => {
                if (!node.randomId) return null;
                const targetIdx = chain.arr.findIndex(n => n.refId === node.randomId);
                if (targetIdx === -1) return null;
                
                const xSource = idx * stepSize + centerOffset;
                const xTarget = targetIdx * stepSize + centerOffset;
                
                if (idx === targetIdx) {
                  return (
                    <path
                      key={`random-self-${idx}`}
                      d={`M ${xSource - 10} -10 C ${xSource - 20} -40, ${xSource + 20} -40, ${xSource + 10} -10`}
                      stroke="#8b5cf6"
                      strokeWidth="2"
                      fill="none"
                    />
                  );
                }
                
                const distance = Math.abs(targetIdx - idx);
                const curveHeight = 30 + distance * 12;
                const nodeBubbleY = size === 'small' ? 40 : 56;
                const pathD = `M ${xSource} ${nodeBubbleY} C ${xSource} ${nodeBubbleY + curveHeight}, ${xTarget} ${nodeBubbleY + curveHeight}, ${xTarget} ${nodeBubbleY}`;
                
                return (
                  <g key={`random-group-${idx}`}>
                    <path
                      d={pathD}
                      stroke="#8b5cf6"
                      strokeWidth="2"
                      strokeDasharray="4, 4"
                      fill="none"
                    />
                    <path
                      d={`M ${xTarget - 4} ${nodeBubbleY + 8} L ${xTarget} ${nodeBubbleY} L ${xTarget + 4} ${nodeBubbleY + 8}`}
                      fill="#8b5cf6"
                    />
                  </g>
                );
              })}
            </svg>
          )}

          {chain.arr.map((node, idx) => {
            const isActive = node.refId === activeNodeId;
            const ptrs = pointersByRef[node.refId] || [];
            const isLast = idx === chain.arr.length - 1;
            const inKGroup = activeKGroup && activeKGroup.includes(node.refId);

            return (
              <div
                key={node.refId}
                id={`node-${rootRefId}-${node.refId}`}
                className="flex items-center relative z-10"
              >
                <div className={`flex flex-col items-center relative ${size === 'small' ? 'w-10' : 'w-16'}`}>
                  {/* Floating pointer labels */}

                  <div className="absolute top-[-36px] flex flex-col gap-1 items-center h-8 justify-end">
                    {ptrs.map((ptr, pIdx) => (
                      <motion.span
                        key={ptr}
                        layoutId={`ptr-${ptr}`}
                        className={`pointer-tag-label pointer-tag-${ptr.toLowerCase()} px-1.5 py-0.5 rounded text-[8.5px] font-extrabold font-mono border shadow-sm uppercase tracking-wider ${getPointerColor(
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
                    className={`${
                      size === 'small' ? 'w-10 h-10 border' : 'w-14 h-14 border-2'
                    } rounded-full flex flex-col items-center justify-center font-bold font-mono transition-all duration-300 relative ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-4 ring-indigo-500/15 shadow-md shadow-indigo-500/5'
                        : inKGroup
                        ? 'border-purple-500 bg-purple-50 text-purple-800 ring-4 ring-purple-500/15 shadow-md shadow-purple-500/5'
                        : 'border-slate-200 bg-white text-slate-800 shadow-sm'
                    }`}
                  >
                    <span className={size === 'small' ? 'text-xs' : 'text-sm'}>{node.val}</span>
                    <span className={`${size === 'small' ? 'text-[7px]' : 'text-[9px]'} text-slate-450 font-normal mt-0.5 font-mono`}>id:{node.refId}</span>
                  </motion.div>
                </div>

                {/* SVG Pointer Arrow to next node */}
                {!isLast && (
                  <div className={`absolute ${size === 'small' ? 'left-10 w-10' : 'left-14 w-16'} h-8 flex items-center pointer-events-none`}>
                    <svg className="w-full h-full" viewBox={size === 'small' ? "0 0 40 32" : "0 0 64 32"} fill="none">
                      <motion.path
                        initial={{ strokeDasharray: "100 100", strokeDashoffset: 100 }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ duration: 0.5 }}
                        d={size === 'small' ? "M0 16 H 32" : "M0 16 H 56"}
                        stroke={isActive ? "#4f46e5" : "#94a3b8"}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <path
                        d={size === 'small' ? "M24 10 L 32 16 L 24 22" : "M48 10 L 56 16 L 48 22"}
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
                  <div className={`absolute ${size === 'small' ? 'left-6 w-[160px]' : 'left-8 w-[240px]'} h-[100px] pointer-events-none z-0`}>
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
              className={`${
                size === 'small' ? 'w-10 h-8 text-[10px]' : 'w-12 h-10 text-xs'
              } border border-dashed border-slate-200 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center font-mono uppercase`}
            >
              null
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
