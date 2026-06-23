import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ContextBubble } from './ContextBubble';

interface LRUCacheVisualizerProps {
  visualizerState: any;
}

export const LRUCacheVisualizer: React.FC<LRUCacheVisualizerProps> = ({
  visualizerState
}) => {
  const currentVars = visualizerState?.variables || {};
  const heapObjects = visualizerState?.heapObjects || {};
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const explanationObj = visualizerState?.explanation || {};
  const explanationText = explanationObj.explanation || explanationObj.action || "";
  const oneLineExplanation = useMemo(() => {
    if (!explanationText) return "";
    const firstSentence = explanationText.split(/[.\n]/)[0].trim();
    return firstSentence + (firstSentence.endsWith('.') ? '' : '.');
  }, [explanationText]);

  // Find head and tail reference values from JDB variables
  const headRefId = useMemo(() => {
    // Look in objects for the Cache instance, then locate head field
    for (const val of Object.values(heapObjects)) {
      const obj = val as any;
      if (obj.className?.includes('LRUCache') && obj.head) {
        const strVal = String(obj.head);
        const match = strVal.match(/id=([a-fA-F0-9]+)/);
        if (match) return match[1];
        if (/^\d+$/.test(strVal)) return strVal;
      }
    }
    // Fallback: look directly in variables
    for (const [key, val] of Object.entries(currentVars)) {
      if (key === 'head' && typeof val === 'string') {
        const match = val.match(/id=([a-fA-F0-9]+)/);
        if (match) return match[1];
      }
    }
    return null;
  }, [currentVars, heapObjects]);

  // Construct the active doubly linked list starting from head up to tail
  const dllChain = useMemo(() => {
    const list: any[] = [];
    if (!headRefId || !heapObjects[headRefId]) return list;

    let currId: string | null = headRefId;
    const visited = new Set<string>();

    while (currId && heapObjects[currId] && !visited.has(currId)) {
      visited.add(currId);
      const node = heapObjects[currId];
      list.push({ refId: currId, ...node });

      // Resolve next node ID
      let nextId = null;
      if (node.next) {
        const strNext = String(node.next);
        const match = strNext.match(/id=([a-fA-F0-9]+)/);
        nextId = match ? match[1] : strNext;
      }
      currId = nextId;
    }
    return list;
  }, [headRefId, heapObjects]);

  // Find map variable entries
  const mapEntries = useMemo(() => {
    const entries: { key: number; val: number; nodeRefId: string }[] = [];
    // Find the cache's map field
    let mapRefId = null;
    for (const val of Object.values(heapObjects)) {
      const obj = val as any;
      if (obj.className?.includes('LRUCache') && obj.map) {
        const strVal = String(obj.map);
        const match = strVal.match(/id=([a-fA-F0-9]+)/);
        if (match) mapRefId = match[1];
        if (/^\d+$/.test(strVal)) mapRefId = strVal;
      }
    }

    if (!mapRefId) return entries;

    // Traverse the DLL chain and see if any nodes match the map values
    dllChain.forEach(node => {
      // Omit dummy head and tail nodes
      if (Number(node.key) !== -1 && Number(node.val) !== -1) {
        entries.push({
          key: Number(node.key),
          val: Number(node.val),
          nodeRefId: node.refId
        });
      }
    });

    return entries;
  }, [dllChain, heapObjects]);

  // Active operation pointers
  const activeNodeId = useMemo(() => {
    // 1. Direct variable lookup
    for (const [key, val] of Object.entries(currentVars)) {
      if ((key === 'node' || key === 'lru' || key === 'curr') && typeof val === 'string') {
        const match = val.match(/id=([a-fA-F0-9]+)/);
        if (match) return match[1];
      }
    }
    // 2. Key matching fallback
    if (currentVars.key !== undefined) {
      const searchKey = Number(currentVars.key);
      const found = dllChain.find(node => Number(node.key) === searchKey);
      if (found) return found.refId;
    }
    return null;
  }, [currentVars, dllChain]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-1 font-sans">
      <div className="text-center border-b border-slate-100 pb-2.5">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Least Recently Used (LRU) Cache • Unified Data Structures
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-8">
        {/* Top DLL Section */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] text-slate-400 font-black uppercase font-mono tracking-wider">
            Doubly Linked List (DLL) Cache (Most Recent &rarr; Least Recent)
          </span>

          <div className="w-full overflow-x-auto pt-6 pb-20 px-4 flex justify-start items-center min-h-[140px] select-none scrollbar-thin">
            {dllChain.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center py-6 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <span className="text-xs text-slate-450 font-mono">{"{ }"}</span>
                <span className="text-xs text-slate-500 mt-2 font-medium">Cache is empty or not constructed yet. Step forward to start.</span>
              </div>
            ) : (
              <div className="flex items-center gap-12 relative">
                {dllChain.map((node, idx) => {
                  const isDummy = Number(node.key) === -1;
                  const label = isDummy ? (idx === 0 ? "head (dummy)" : "tail (dummy)") : `key: ${node.key}`;
                  const valDisplay = isDummy ? "DUMMY" : `val: ${node.val}`;
                  
                  const isNodeActive = node.refId === activeNodeId;
                  const isHovered = node.refId === hoveredNodeId;
                  const isLast = idx === dllChain.length - 1;

                  return (
                    <div key={node.refId} className="flex items-center relative z-10">
                      <motion.div
                        onMouseEnter={() => !isDummy && setHoveredNodeId(node.refId)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        whileHover={isDummy ? {} : { scale: 1.05 }}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 min-w-[90px] text-center ${
                          isDummy
                            ? 'border-dashed border-slate-200 bg-slate-50 text-slate-400 font-mono text-[10px]'
                            : isNodeActive
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-800 font-bold ring-4 ring-indigo-500/10 shadow-md'
                            : isHovered
                            ? 'border-purple-500 bg-purple-50 text-purple-800 font-bold ring-4 ring-purple-500/10 shadow-md'
                            : 'border-slate-200 bg-white text-slate-700 shadow-sm'
                        }`}
                      >
                        <span className="text-[10px] font-black font-mono tracking-wide">{label}</span>
                        <span className="text-xs font-extrabold mt-1">{valDisplay}</span>
                        <span className="text-[8.5px] text-slate-400 font-mono mt-1 font-semibold">id:{node.refId}</span>
                      </motion.div>

                      {isNodeActive && oneLineExplanation && (
                        <div className="absolute top-[80px] left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
                          <ContextBubble
                            message={oneLineExplanation}
                            variant="info"
                            animation="pop"
                            position="bottom"
                          />
                        </div>
                      )}

                      {/* Double ended arrows */}
                      {!isLast && (
                        <div className="absolute left-[92px] w-12 h-6 flex items-center justify-center pointer-events-none">
                          <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 48 24">
                            <path
                              d="M 4 8 H 44 M 10 4 L 4 8 L 10 12 M 38 4 L 44 8 L 38 12"
                              stroke={(isNodeActive || isHovered) ? "#6366f1" : "#94a3b8"}
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>


        {/* Bottom Map Section */}
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-6">
          <span className="text-[10px] text-slate-400 font-black uppercase font-mono tracking-wider">
            HashMap Mappings (O(1) Node Lookup Table)
          </span>

          {mapEntries.length === 0 ? (
            <div className="text-xs text-slate-400 font-mono italic p-6 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              Cache Map is empty.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {mapEntries.map(entry => {
                const isHovered = entry.nodeRefId === hoveredNodeId;
                const isNodeActive = entry.nodeRefId === activeNodeId;

                return (
                  <motion.div
                    key={entry.key}
                    onMouseEnter={() => setHoveredNodeId(entry.nodeRefId)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    whileHover={{ scale: 1.02 }}
                    className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                      isNodeActive
                        ? 'border-indigo-400 bg-indigo-50/30 ring-2 ring-indigo-500/10'
                        : isHovered
                        ? 'border-purple-400 bg-purple-50/30 ring-2 ring-purple-500/10'
                        : 'border-slate-150 bg-slate-50/20'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">Key</span>
                      <span className="text-xs font-black text-slate-800 font-mono">"{entry.key}"</span>
                    </div>

                    <div className="flex justify-between items-center border-t border-dashed border-slate-200/60 pt-1.5 mt-1.5">
                      <span className="text-[9px] font-bold text-slate-400 font-mono">Node ptr</span>
                      <span className="text-[9.5px] font-black text-indigo-650 font-mono">refId:{entry.nodeRefId}</span>
                    </div>
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

export default LRUCacheVisualizer;
