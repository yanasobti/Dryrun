import React, { useMemo } from 'react';

interface MergeKListsVisualizerProps {
  visualizerState: any;
  frames: any[];
  currentFrameIndex: number;
}

export const MergeKListsVisualizer: React.FC<MergeKListsVisualizerProps> = ({
  visualizerState,
  frames = [],
  currentFrameIndex = 0
}) => {
  const heapObjects = visualizerState?.heapObjects || {};

  // Helper to find the most recently seen reference value of a variable (persisting state across lambda scopes)
  const getMostRecentVar = (varName: string): string | null => {
    for (let i = currentFrameIndex; i >= 0; i--) {
      const f = frames[i];
      if (f && f.variables && f.variables[varName] !== undefined) {
        const val = f.variables[varName];
        if (typeof val === 'string') {
          const match = val.match(/id=([a-fA-F0-9]+)/);
          if (match) return match[1];
        }
      }
    }
    return null;
  };

  // Reconstruct original input lists from Frame 0 so they remain complete/intact visually
  const originalInputLists = useMemo(() => {
    const lists: any[][] = [];
    const firstFrame = frames[0];
    if (!firstFrame) return lists;

    let listsRefId = null;
    if (firstFrame.variables && firstFrame.variables.lists) {
      const match = firstFrame.variables.lists.match(/id=([a-fA-F0-9]+)/);
      listsRefId = match ? match[1] : firstFrame.variables.lists;
    }

    const firstHeap = firstFrame.objects || {};
    if (!listsRefId || !firstHeap[listsRefId]) return lists;

    const arrObj = firstHeap[listsRefId];
    const len = Number(arrObj.length || 0);

    for (let i = 0; i < len; i++) {
      const fieldVal = arrObj[i] || arrObj[`[${i}]`] || arrObj[String(i)];
      if (fieldVal) {
        const match = String(fieldVal).match(/id=([a-fA-F0-9]+)/);
        const headId = match ? match[1] : String(fieldVal);

        const sublist: any[] = [];
        let currId = headId;
        const visited = new Set<string>();

        while (currId && firstHeap[currId] && !visited.has(currId)) {
          visited.add(currId);
          sublist.push({ refId: currId, ...firstHeap[currId] });

          let nextId = null;
          if (firstHeap[currId].next) {
            const matchN = String(firstHeap[currId].next).match(/id=([a-fA-F0-9]+)/);
            nextId = matchN ? matchN[1] : firstHeap[currId].next;
          }
          currId = nextId;
        }
        lists.push(sublist);
      } else {
        lists.push([]);
      }
    }
    return lists;
  }, [frames]);

  // Read current active list head pointers from the current state array
  const currentHeads = useMemo(() => {
    const heads: string[] = [];
    const listsRefId = getMostRecentVar('lists');
    if (!listsRefId || !heapObjects[listsRefId]) return heads;

    const arrObj = heapObjects[listsRefId];
    const len = Number(arrObj.length || 0);

    for (let i = 0; i < len; i++) {
      const fieldVal = arrObj[i] || arrObj[`[${i}]`] || arrObj[String(i)];
      if (fieldVal) {
        const match = String(fieldVal).match(/id=([a-fA-F0-9]+)/);
        const headId = match ? match[1] : String(fieldVal);
        if (headId) heads.push(headId);
      }
    }
    return heads;
  }, [frames, currentFrameIndex, heapObjects]);

  // Resolve Min-Heap queue elements
  const heapElements = useMemo(() => {
    const elems: { val: number; refId: string }[] = [];
    
    // Find priority queue reference
    const qRefId = getMostRecentVar('queue');
    if (!qRefId || !heapObjects[qRefId]) return elems;

    // Read PriorityQueue's backing array field: "queue"
    const qObj = heapObjects[qRefId];
    let backingArrRef = null;
    if (qObj.queue) {
      const match = String(qObj.queue).match(/id=([a-fA-F0-9]+)/);
      backingArrRef = match ? match[1] : String(qObj.queue);
    }

    if (!backingArrRef || !heapObjects[backingArrRef]) return elems;

    const arrObj = heapObjects[backingArrRef];
    const size = Number(qObj.size || 0);

    for (let i = 0; i < size; i++) {
      const nodeRefStr = arrObj[i] || arrObj[`[${i}]`] || arrObj[String(i)];
      if (nodeRefStr) {
        const matchNode = String(nodeRefStr).match(/id=([a-fA-F0-9]+)/);
        const nodeRefId = matchNode ? matchNode[1] : String(nodeRefStr);
        if (nodeRefId && heapObjects[nodeRefId]) {
          elems.push({
            val: Number(heapObjects[nodeRefId].val),
            refId: nodeRefId
          });
        }
      }
    }

    return elems.sort((a, b) => a.val - b.val); // Sort by value to represent min-heap order
  }, [frames, currentFrameIndex, heapObjects]);

  // Resolve merged output list starting from dummy
  const mergedList = useMemo(() => {
    const list: any[] = [];
    const dummyRefId = getMostRecentVar('dummy');
    if (!dummyRefId || !heapObjects[dummyRefId]) return list;

    let currId = heapObjects[dummyRefId].next;
    const visited = new Set<string>();

    while (currId) {
      const matchN = String(currId).match(/id=([a-fA-F0-9]+)/);
      const nextRefId = matchN ? matchN[1] : String(currId);

      if (!nextRefId || !heapObjects[nextRefId] || visited.has(nextRefId)) break;
      visited.add(nextRefId);

      list.push({ refId: nextRefId, ...heapObjects[nextRefId] });
      currId = heapObjects[nextRefId].next;
    }

    return list;
  }, [frames, currentFrameIndex, heapObjects]);

  // Find active node pointers
  const activeNodeId = useMemo(() => {
    for (const name of ['node', 'a', 'b']) {
      const val = getMostRecentVar(name);
      if (val) return val;
    }
    return null;
  }, [frames, currentFrameIndex]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-1 font-sans">
      <div className="text-center border-b border-slate-100 pb-2.5">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Merge k Sorted Lists • Min Heap Pattern
        </span>
      </div>

      {/* Side-by-Side: Input Lists (Left) and Min Heap (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Left Column: Input Sorted Lists */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <span className="text-[10px] text-slate-400 font-black uppercase font-mono tracking-wider">
            Input Sorted Lists
          </span>
          <div className="flex flex-col gap-4">
            {originalInputLists.length === 0 ? (
              <div className="text-xs text-slate-400 font-mono italic py-8 text-center border border-dashed border-slate-200 rounded-xl">
                Please click 'Simulate DryRun' to generate lists.
              </div>
            ) : (
              originalInputLists.map((sublist, sIdx) => (
                <div key={sIdx} className="flex flex-col gap-1.5 p-3 rounded-xl border border-slate-100 bg-slate-50/20 relative">
                  <span className="text-[9px] font-black text-slate-400 font-mono">List {sIdx + 1}</span>
                  {sublist.length === 0 ? (
                    <span className="text-[10.5px] font-mono italic text-slate-400">Empty list</span>
                  ) : (
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {sublist.map((node, nIdx) => {
                        const isHead = currentHeads.includes(node.refId);
                        const isNodeActive = node.refId === activeNodeId;
                        const isHeapElement = heapElements.some(e => e.refId === node.refId);

                        return (
                          <div key={node.refId} className="flex items-center gap-2 flex-shrink-0 relative pt-6 pb-2">
                            {/* Floating Pointer Arrow for Head Node */}
                            {isHead && (
                              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                                <span className="text-[8px] font-black bg-amber-500 text-slate-950 px-1 py-0.2 rounded font-mono uppercase tracking-wider scale-90 border border-amber-400 shadow-sm leading-none">
                                  HEAD
                                </span>
                                <span className="text-amber-500 text-[10px] leading-none mt-0.5">↓</span>
                              </div>
                            )}

                            <div
                              className={`w-9 h-9 rounded-full border-2 flex flex-col items-center justify-center font-mono transition-all duration-150 ${
                                isNodeActive
                                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-4 ring-indigo-500/10 font-black scale-105 shadow-sm'
                                  : isHead
                                  ? 'border-amber-500 bg-amber-50 text-amber-800 font-black scale-105 shadow-sm'
                                  : isHeapElement
                                  ? 'border-cyan-400 bg-cyan-50 text-cyan-750 font-bold'
                                  : 'border-slate-200 bg-white text-slate-600'
                              }`}
                            >
                              <span className="text-xs">{node.val}</span>
                            </div>
                            {nIdx < sublist.length - 1 && <span className="text-slate-350 font-bold font-mono">&rarr;</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Min Heap State */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <span className="text-[10px] text-slate-400 font-black uppercase font-mono tracking-wider">
            Min Heap (Priority Queue) State
          </span>
          {heapElements.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-mono italic py-8 border border-dashed border-slate-200 rounded-xl">
              Heap is empty.
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="flex flex-wrap gap-4 justify-center items-center py-2 px-1 max-w-sm">
                {heapElements.map((elem, idx) => {
                  const isNodeActive = elem.refId === activeNodeId;
                  const isMin = idx === 0;

                  return (
                    <div
                      key={elem.refId}
                      className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border-2 transition-all duration-150 ${
                        isMin
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-4 ring-emerald-500/10 font-black scale-105'
                          : isNodeActive
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-850 ring-4 ring-indigo-500/10 font-black'
                          : 'border-cyan-300 bg-cyan-50/20 text-cyan-800'
                      }`}
                    >
                      <span className="text-[7.5px] font-black text-slate-400 font-mono leading-none">#{idx + 1}</span>
                      <span className="text-xs font-black mt-0.5">{elem.val}</span>
                      {isMin && <span className="text-[6.5px] font-black text-emerald-650 uppercase tracking-wider leading-none mt-0.5">Min</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Transition Arrow down to Merged Output List */}
      <div className="flex flex-col items-center justify-center -my-2 select-none">
        <div className="text-[9px] font-black uppercase font-mono tracking-widest text-slate-400">Extract Smallest &amp; Append to Merged List</div>
        <svg className="w-5 h-5 text-indigo-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 13l-7 7-7-7" />
        </svg>
      </div>

      {/* Section 3: Merged Output List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
        <span className="text-[10px] text-slate-400 font-black uppercase font-mono tracking-wider">
          Merged Output List
        </span>
        {mergedList.length === 0 ? (
          <div className="text-xs text-slate-400 font-mono italic p-6 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            Output list has not started merging yet.
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto py-2">
            {mergedList.map((node, idx) => {
              const isNodeActive = node.refId === activeNodeId;
              const isLast = idx === mergedList.length - 1;

              return (
                <div key={node.refId} className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className={`w-11 h-11 rounded-full border-2 flex flex-col items-center justify-center font-mono transition-all duration-150 ${
                      isNodeActive
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-4 ring-indigo-500/15 shadow-md shadow-indigo-500/5'
                        : 'border-slate-200 bg-white text-slate-700 shadow-sm'
                    }`}
                  >
                    <span className="text-xs font-black">{node.val}</span>
                    <span className="text-[7.5px] text-slate-400 font-medium">id:{node.refId}</span>
                  </div>
                  {!isLast && <span className="text-slate-350 font-black font-mono">&rarr;</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MergeKListsVisualizer;
