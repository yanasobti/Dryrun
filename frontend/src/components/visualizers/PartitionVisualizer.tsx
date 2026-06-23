import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface PartitionVisualizerProps {
  visualizerState: any;
}

export const PartitionVisualizer: React.FC<PartitionVisualizerProps> = ({
  visualizerState
}) => {
  const currentVars = visualizerState?.variables || {};

  // Retrieve arrays nums1 and nums2
  const nums1Array = useMemo(() => {
    return visualizerState?.arrays?.find((a: any) => a.name === 'nums1')?.values || [];
  }, [visualizerState]);

  const nums2Array = useMemo(() => {
    return visualizerState?.arrays?.find((a: any) => a.name === 'nums2')?.values || [];
  }, [visualizerState]);

  // Extract variables
  const left = currentVars.left !== undefined ? Number(currentVars.left) : -1;
  const right = currentVars.right !== undefined ? Number(currentVars.right) : -1;
  const i = currentVars.i !== undefined ? Number(currentVars.i) : -1;
  const j = currentVars.j !== undefined ? Number(currentVars.j) : -1;

  const m = nums1Array.length;
  const n = nums2Array.length;

  // Reconstruct boundary values from current frame
  const A_left = useMemo(() => {
    if (i === -1) return null;
    return i === 0 ? -Infinity : Number(nums1Array[i - 1]);
  }, [i, nums1Array]);

  const A_right = useMemo(() => {
    if (i === -1) return null;
    return i === m ? Infinity : Number(nums1Array[i]);
  }, [i, m, nums1Array]);

  const B_left = useMemo(() => {
    if (j === -1) return null;
    return j === 0 ? -Infinity : Number(nums2Array[j - 1]);
  }, [j, nums2Array]);

  const B_right = useMemo(() => {
    if (j === -1) return null;
    return j === n ? Infinity : Number(nums2Array[j]);
  }, [j, n, nums2Array]);

  // Check invariants
  const cond1 = A_left !== null && B_right !== null ? A_left <= B_right : null;
  const cond2 = B_left !== null && A_right !== null ? B_left <= A_right : null;
  const isValidPartition = cond1 && cond2;

  // Render a single array with a clear partition line indicator
  const renderArrayWithPartition = (
    name: string,
    arr: any[],
    partIndex: number,
    leftLabel: string,
    rightLabel: string
  ) => {
    const cellWidth = 56;
    const gap = 8;
    const stepWidth = cellWidth + gap;

    return (
      <div className="flex flex-col items-start gap-1 w-full font-mono select-none">
        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
          Array {name} (size {arr.length})
        </span>

        <div className="relative flex items-center py-2 min-h-[72px]">
          {arr.map((val, idx) => {
            const isLeftBoundary = idx === partIndex - 1;
            const isRightBoundary = idx === partIndex;
            
            let highlightClass = 'border-slate-200 bg-slate-50 text-slate-800';
            if (isLeftBoundary) {
              highlightClass = 'border-cyan-300 bg-cyan-50 text-cyan-800 ring-2 ring-cyan-200 shadow-2xs font-extrabold';
            } else if (isRightBoundary) {
              highlightClass = 'border-indigo-300 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-200 shadow-2xs font-extrabold';
            }

            return (
              <div
                key={idx}
                className="flex flex-col items-center relative"
                style={{ width: `${cellWidth}px`, marginRight: `${gap}px` }}
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-xs transition-all ${highlightClass}`}>
                  {val}
                </div>
                <span className="text-[9px] text-slate-400 mt-1">idx {idx}</span>

                {/* Boundary labels */}
                {isLeftBoundary && (
                  <span className="absolute -top-4 text-[8px] font-black text-cyan-600 bg-cyan-50 px-1 border border-cyan-200 rounded uppercase">
                    {leftLabel}
                  </span>
                )}
                {isRightBoundary && (
                  <span className="absolute -top-4 text-[8px] font-black text-indigo-650 bg-indigo-50/80 px-1 border border-indigo-200 rounded uppercase">
                    {rightLabel}
                  </span>
                )}
              </div>
            );
          })}

          {/* Partition split line indicator */}
          {partIndex >= 0 && partIndex <= arr.length && (
            <motion.div
              initial={false}
              animate={{ left: partIndex * stepWidth - 4 }}
              transition={{ type: "spring", stiffness: 220, damping: 25 }}
              className="absolute top-0 bottom-0 w-1 bg-rose-500 z-10 flex flex-col items-center justify-between"
              style={{ height: '56px' }}
            >
              <div className="w-2.5 h-2.5 bg-rose-500 rounded-full -mt-1 shadow-sm" />
              <div className="w-0.5 h-full bg-rose-500" />
              <div className="w-2.5 h-2.5 bg-rose-500 rounded-full -mb-1 shadow-sm" />
              <span className="absolute top-12 text-[7.5px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-0.5 rounded uppercase whitespace-nowrap">
                Split {partIndex}
              </span>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-4xl mx-auto p-2">
      {/* Strategy Header */}
      <div className="text-center border-b border-slate-100 pb-2.5 mb-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Binary Search • Median of Two Sorted Arrays
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs flex flex-col gap-6">
        
        {/* Array Stack Visualizer Panel */}
        <div className="flex flex-col gap-6 bg-slate-50/50 border border-slate-150 rounded-xl p-5">
          {renderArrayWithPartition('nums1 (A)', nums1Array, i, 'A_left', 'A_right')}
          <div className="border-t border-dashed border-slate-200 my-1" />
          {renderArrayWithPartition('nums2 (B)', nums2Array, j, 'B_left', 'B_right')}
        </div>

        {/* Verification Check & Math dashboard */}
        <div className="flex flex-col md:flex-row gap-6 w-full items-stretch">
          
          {/* Comparison table */}
          <div className="flex-1 border border-slate-200 rounded-lg overflow-hidden bg-white flex flex-col font-mono text-xs shadow-2xs select-none">
            <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 font-black text-[9px] text-slate-500 uppercase tracking-wider py-2 text-center">
              <div>Invariant Check</div>
              <div>Values</div>
              <div>Status</div>
            </div>
            
            <div className="flex flex-col divide-y divide-slate-100">
              <div className="grid grid-cols-3 py-2.5 text-center items-center">
                <div className="font-semibold">A_left ≤ B_right</div>
                <div className="font-bold text-slate-650">
                  {A_left === -Infinity ? '-∞' : A_left} ≤ {B_right === Infinity ? '∞' : B_right}
                </div>
                <div>
                  {cond1 === null ? (
                    <span className="text-slate-400">-</span>
                  ) : cond1 ? (
                    <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-black border border-emerald-100">PASS ✓</span>
                  ) : (
                    <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-black border border-rose-100">FAIL ✕</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 py-2.5 text-center items-center">
                <div className="font-semibold">B_left ≤ A_right</div>
                <div className="font-bold text-slate-650">
                  {B_left === -Infinity ? '-∞' : B_left} ≤ {A_right === Infinity ? '∞' : A_right}
                </div>
                <div>
                  {cond2 === null ? (
                    <span className="text-slate-400">-</span>
                  ) : cond2 ? (
                    <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-black border border-emerald-100">PASS ✓</span>
                  ) : (
                    <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-black border border-rose-100">FAIL ✕</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Description & Actions */}
          <div className="w-full md:w-[260px] shrink-0">
            {i !== -1 && j !== -1 && (
              <div className="w-full relative bg-slate-50 border border-slate-200 text-slate-800 p-4 rounded-xl shadow-xs font-sans text-xs font-semibold flex flex-col gap-2">
                <span className="text-[9px] font-black text-indigo-650 uppercase tracking-wider border-b border-slate-200 pb-1 font-mono flex justify-between">
                  <span>💬 Partition Insight</span>
                  <span>i={i}, j={j}</span>
                </span>

                <div className="text-slate-650 leading-relaxed font-semibold text-[11px] mt-1 flex flex-col gap-1.5">
                  <p>
                    Targeting partition size index <strong>{i}</strong> in `nums1`. This automatically sets partition index in `nums2` to <strong>{j}</strong>.
                  </p>
                  
                  <div className="border-t border-slate-200 pt-2 font-mono text-[9px] font-bold text-slate-500">
                    Search Range for i: [{left !== -1 ? left : 0}, {right !== -1 ? right : m}]
                  </div>

                  <div className="mt-1 border-t border-slate-200/80 pt-2 font-sans text-[10.5px] font-medium text-slate-500">
                    {isValidPartition ? (
                      <span className="text-emerald-700 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 block">
                        🎉 Both conditions satisfied! We have successfully partitioned the arrays. The median is computed based on boundary values.
                      </span>
                    ) : A_left !== null && B_right !== null && A_left > B_right ? (
                      <span className="text-rose-700 bg-rose-50/50 p-2 rounded-lg border border-rose-150 block">
                        ⚠️ <strong>A_left &gt; B_right</strong>. The partition line in `nums1` is too far to the right. We must shift the search range left: <strong>right = i - 1</strong> ({i - 1}).
                      </span>
                    ) : (
                      <span className="text-rose-700 bg-rose-50/50 p-2 rounded-lg border border-rose-150 block">
                        ⚠️ <strong>B_left &gt; A_right</strong>. The partition line in `nums1` is too far to the left. We must shift the search range right: <strong>left = i + 1</strong> ({i + 1}).
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default PartitionVisualizer;
