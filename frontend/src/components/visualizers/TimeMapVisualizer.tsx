import React, { useMemo } from 'react';

interface TimeMapVisualizerProps {
  frames: any[];
  currentFrameIndex: number;
  visualizerState: any;
  preset?: any;
  paramInputs?: Record<string, string>;
}

export const TimeMapVisualizer: React.FC<TimeMapVisualizerProps> = ({
  frames,
  currentFrameIndex,
  visualizerState,
  preset,
  paramInputs
}) => {
  const currentVars = visualizerState?.variables || {};

  // Retrieve default or active input arrays across frames with fallback to paramInputs/preset
  const opsArray = useMemo(() => {
    const fromFrames = frames.find(f => f.arrays?.ops)?.arrays?.ops;
    if (fromFrames && fromFrames.length > 0) return fromFrames;
    const rawVal = paramInputs?.ops || preset?.inputs?.ops;
    if (rawVal) {
      return rawVal.split(',').map((x: string) => x.trim().replace(/^["']|["']$/g, ''));
    }
    return [];
  }, [frames, preset, paramInputs]);

  const keysArray = useMemo(() => {
    const fromFrames = frames.find(f => f.arrays?.keys)?.arrays?.keys;
    if (fromFrames && fromFrames.length > 0) return fromFrames;
    const rawVal = paramInputs?.keys || preset?.inputs?.keys;
    if (rawVal) {
      return rawVal.split(',').map((x: string) => x.trim().replace(/^["']|["']$/g, ''));
    }
    return [];
  }, [frames, preset, paramInputs]);

  const valuesArray = useMemo(() => {
    const fromFrames = frames.find(f => f.arrays?.values)?.arrays?.values;
    if (fromFrames && fromFrames.length > 0) return fromFrames;
    const rawVal = paramInputs?.values || preset?.inputs?.values;
    if (rawVal) {
      return rawVal.split(',').map((x: string) => x.trim().replace(/^["']|["']$/g, ''));
    }
    return [];
  }, [frames, preset, paramInputs]);

  const timestampsArray = useMemo(() => {
    const fromFrames = frames.find(f => f.arrays?.timestamps)?.arrays?.timestamps;
    if (fromFrames && fromFrames.length > 0) return fromFrames.map(Number);
    const rawVal = paramInputs?.timestamps || preset?.inputs?.timestamps;
    if (rawVal) {
      return rawVal.split(',').map((x: string) => Number(x.trim()));
    }
    return [];
  }, [frames, preset, paramInputs]);


  // Find the active operation index 'i' in testTimeMap (searching backwards from current frame)
  const activeOpIdx = useMemo(() => {
    for (let idx = currentFrameIndex; idx >= 0; idx--) {
      const vars = frames[idx].variables || {};
      if (vars.i !== undefined) {
        return Number(vars.i);
      }
    }
    return 0;
  }, [frames, currentFrameIndex]);

  // Reconstruct the TimeMap database up to the active operation
  const timeMapDb = useMemo(() => {
    const db: Record<string, { val: string; timestamp: number }[]> = {};
    for (let idx = 0; idx <= activeOpIdx; idx++) {
      const op = opsArray[idx];
      const k = keysArray[idx];
      const v = valuesArray[idx];
      const t = timestampsArray[idx];

      if (!op || !k) continue;

      if (op === 'set') {
        if (!db[k]) {
          db[k] = [];
        }
        if (!db[k].some(item => item.timestamp === t)) {
          db[k].push({ val: v, timestamp: t });
        }
      }
    }
    return db;
  }, [opsArray, keysArray, valuesArray, timestampsArray, activeOpIdx]);

  // Parse active parameters and variables
  const currentOp = opsArray[activeOpIdx] || 'init';
  const currentKey = (currentVars.key !== undefined ? String(currentVars.key).replace(/['"]/g, '') : keysArray[activeOpIdx]) || '';
  const currentVal = valuesArray[activeOpIdx] || '';
  const currentTimestamp = currentVars.timestamp !== undefined ? Number(currentVars.timestamp) : (timestampsArray[activeOpIdx] || 0);

  // Binary search local variables inside get(key, timestamp)
  const left = currentVars.left !== undefined ? Number(currentVars.left) : -1;
  const right = currentVars.right !== undefined ? Number(currentVars.right) : -1;
  const mid = currentVars.mid !== undefined ? Number(currentVars.mid) : -1;
  const resVal = currentVars.res !== undefined ? String(currentVars.res).replace(/['"]/g, '') : null;

  // The queried list of values for the current key
  const queriedList = useMemo(() => {
    if (!currentKey) return [];
    return timeMapDb[currentKey] || [];
  }, [timeMapDb, currentKey]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-1 font-sans">
      {/* Strategy Header */}
      <div className="text-center border-b border-slate-100 pb-2.5">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Binary Search • Time Based Key-Value Store
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch">
        {/* Left Card: Stored History */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center text-xs font-black text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2.5">
            <span className="flex items-center gap-1.5">Stored History</span>
            <span className="text-[10px] text-slate-400 font-mono">
              Op {activeOpIdx + 1}/{opsArray.length}
            </span>
          </div>

          <div className="flex flex-col gap-4 max-h-[360px] overflow-y-auto pr-1">
            {Object.keys(timeMapDb).length === 0 ? (
              <div className="text-xs font-mono text-slate-400 italic py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                TimeMap is empty. Run "set" operations to populate.
              </div>
            ) : (
              Object.entries(timeMapDb).map(([key, list]) => {
                const isTargetKey = key === currentKey;
                return (
                  <div
                    key={key}
                    className={`p-4 rounded-xl border transition-all ${
                      isTargetKey
                        ? 'border-indigo-200 bg-indigo-50/15 shadow-2xs'
                        : 'border-slate-150 bg-slate-50/30'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold font-mono text-slate-800">
                        key: <strong className="text-indigo-650 text-sm">"{key}"</strong>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono font-bold text-slate-500">
                        {list.length} entries
                      </span>
                    </div>

                    {/* Timeline History Track */}
                    <div className="relative flex items-center pt-2 pb-1.5 overflow-x-auto min-h-[48px] select-none">
                      {/* Timeline line */}
                      <div className="absolute left-4 right-4 h-0.5 bg-slate-200 top-1/2 -translate-y-1/2" />
                      
                      <div className="flex justify-between w-full relative z-10 px-2">
                        {list.map((item, idx) => {
                          const isNewInsert = currentOp === 'set' && isTargetKey && item.timestamp === currentTimestamp && item.val === currentVal;
                          return (
                            <div
                              key={idx}
                              className={`flex flex-col items-center bg-white border rounded-lg px-2.5 py-1 text-[10px] font-mono shadow-3xs transition-all ${
                                isNewInsert
                                  ? 'border-emerald-500 bg-emerald-50/30 text-emerald-800 ring-2 ring-emerald-500/20 scale-105 font-bold animate-pulse'
                                  : 'border-slate-200 text-slate-650'
                              }`}
                            >
                              <span className="font-extrabold text-[9px] text-slate-400">t={item.timestamp}</span>
                              <span className="font-bold">"{item.val}"</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Card: Current Search / Inserting Entry */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4 justify-between">
          <div className="flex justify-between items-center text-xs font-black text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2.5">
            <span>
              {currentOp === 'set' ? 'Inserting Entry' : 'Current Search'}
            </span>
            <span className={`px-2 py-0.5 rounded text-[9.5px] font-black font-mono uppercase ${
              currentOp === 'set' 
                ? 'bg-cyan-50 text-cyan-600 border border-cyan-200' 
                : 'bg-emerald-555 text-emerald-600 border border-emerald-200'
            }`}>
              {currentOp}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-between py-1 gap-5">
            {/* Query details */}
            <div className="text-center select-none">
              <span className="text-[9px] text-slate-450 font-black uppercase tracking-wider font-mono">
                {currentOp === 'set' ? 'Active Operation' : 'Active Search Target'}
              </span>
              <div className="text-base font-black text-slate-800 mt-0.5">
                {currentOp === 'set' ? (
                  <>set(<strong className="text-cyan-600 font-mono font-black">"{currentKey}"</strong>, "{currentVal}", <strong className="text-indigo-655 font-mono font-black">{currentTimestamp}</strong>)</>
                ) : (
                  <>get(<strong className="text-indigo-650 font-mono font-black">"{currentKey}"</strong>, <strong className="text-rose-500 font-mono font-black">{currentTimestamp}</strong>)</>
                )}
              </div>
            </div>

            {queriedList.length > 0 ? (
              <div className="flex flex-col gap-6 w-full">
                {/* Timeline with Query Pin and L/M/R labels */}
                <div className="relative bg-slate-50/50 border border-slate-150 rounded-2xl px-6 py-10 flex flex-col items-center select-none">
                  {/* Horizontal Line connecting nodes */}
                  <div className="absolute left-10 right-10 h-0.5 bg-slate-300 top-[40px]" />

                  {/* Query Pin/Arrow Indicator */}
                  {currentOp === 'get' && (() => {
                    const listLen = queriedList.length;
                    let pinPercent = 50;

                    // Find where target timestamp falls to place the query indicator line
                    const firstT = queriedList[0].timestamp;
                    const lastT = queriedList[listLen - 1].timestamp;

                    if (currentTimestamp < firstT) {
                      pinPercent = 10;
                    } else if (currentTimestamp >= lastT) {
                      pinPercent = 90;
                    } else {
                      // Find index interval
                      for (let idx = 0; idx < listLen - 1; idx++) {
                        const t1 = queriedList[idx].timestamp;
                        const t2 = queriedList[idx + 1].timestamp;
                        if (currentTimestamp >= t1 && currentTimestamp < t2) {
                          const intervalStartPercent = 20 + idx * (60 / (listLen - 1 || 1));
                          const intervalEndPercent = 20 + (idx + 1) * (60 / (listLen - 1 || 1));
                          const ratio = (currentTimestamp - t1) / (t2 - t1);
                          pinPercent = intervalStartPercent + ratio * (intervalEndPercent - intervalStartPercent);
                          break;
                        }
                      }
                    }

                    return (
                      <div
                        className="absolute bottom-6 top-10 w-0.5 border-l-2 border-dashed border-rose-500 z-10 flex justify-center"
                        style={{ left: `${pinPercent}%` }}
                      >
                        <div className="absolute -top-7 flex flex-col items-center select-none font-sans whitespace-nowrap">
                          <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded shadow-3xs">
                            Query = {currentTimestamp}
                          </span>
                          <span className="text-rose-500 font-extrabold text-[10px] leading-none mt-0.5">▼</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Timeline Nodes */}
                  <div className="flex justify-between w-full relative z-10 px-4">
                    {queriedList.map((item, idx) => {
                      const isMid = currentOp === 'get' && idx === mid;
                      const isLeft = currentOp === 'get' && idx === left;
                      const isRight = currentOp === 'get' && idx === right;
                      const isSelectedCandidate = currentOp === 'get' && resVal === item.val;
                      const isNewInsert = currentOp === 'set' && item.timestamp === currentTimestamp && item.val === currentVal;

                      return (
                        <div key={idx} className="flex flex-col items-center w-14 relative">
                          {/* Node Bubble */}
                          <div
                            className={`w-10 h-10 rounded-full border flex flex-col items-center justify-center shadow-3xs transition-all ${
                              isMid
                                ? 'bg-amber-450 border-amber-550 text-indigo-950 scale-110 ring-2 ring-amber-500/20 font-black'
                                : isSelectedCandidate
                                ? 'bg-emerald-555 border-emerald-600 text-white font-extrabold'
                                : isNewInsert
                                ? 'bg-cyan-50 border-cyan-500 text-cyan-800 ring-2 ring-cyan-500/20 scale-105 font-bold'
                                : 'bg-white border-slate-350 text-slate-700'
                            }`}
                          >
                            <span className="text-[10px] font-black font-mono leading-none">{item.timestamp}</span>
                            <span className={`text-[7.5px] truncate max-w-[34px] leading-none mt-0.5 opacity-80 ${isSelectedCandidate ? 'text-white' : isNewInsert ? 'text-cyan-700' : 'text-slate-500'}`}>
                              {item.val}
                            </span>
                          </div>

                          {/* L/M/R Pointer tag directly under node */}
                          {currentOp === 'get' && (
                            <div className="h-6 flex items-center justify-center mt-2.5 font-mono text-[9px] font-extrabold uppercase">
                              {isLeft && <span className="text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-150 shadow-3xs mr-0.5">L</span>}
                              {isMid && <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-150 shadow-3xs mr-0.5">M</span>}
                              {isRight && <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-150 shadow-3xs">R</span>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tutor Lesson Box */}
                <div className="bg-indigo-50/30 border border-indigo-150/60 rounded-xl p-4 flex flex-col gap-1.5 text-xs font-sans">
                  <span className="text-[9px] font-black text-indigo-650 uppercase font-mono tracking-wider border-b border-indigo-100/50 pb-0.5">
                    Lesson explanation
                  </span>
                  {currentOp === 'set' ? (
                    <p className="text-slate-750 font-bold leading-normal">
                      Store <strong className="text-indigo-650">"{currentVal}"</strong> at timestamp <strong className="text-indigo-650">{currentTimestamp}</strong> under key <strong className="text-indigo-650">"{currentKey}"</strong>.
                    </p>
                  ) : (
                    <>
                      <p className="text-slate-750 font-bold leading-normal">
                        We're searching for the latest timestamp that does not exceed <strong className="text-rose-500 font-mono">{currentTimestamp}</strong>.
                      </p>
                      
                      {mid !== -1 && queriedList[mid] && (
                        <p className="text-slate-600 font-medium leading-relaxed border-t border-slate-150/40 pt-2 mt-1 select-text">
                          {queriedList[mid].timestamp <= currentTimestamp ? (
                            <span>
                              Checked index <strong>{mid}</strong> (timestamp = <strong>{queriedList[mid].timestamp}</strong>). Since <strong>{queriedList[mid].timestamp} ≤ {currentTimestamp}</strong>, this timestamp is valid! We record <strong className="text-emerald-600">"{queriedList[mid].val}"</strong> as our current candidate and search to the right (move left boundary to <strong>mid + 1</strong>) to see if we can find a later valid timestamp.
                            </span>
                          ) : (
                            <span>
                              Checked index <strong>{mid}</strong> (timestamp = <strong>{queriedList[mid].timestamp}</strong>). Since <strong>{queriedList[mid].timestamp} &gt; {currentTimestamp}</strong>, it is in the future. This timestamp is invalid, so we search to the left (move right boundary to <strong>mid - 1</strong>).
                            </span>
                          )}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-mono italic text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                {currentOp === 'set' 
                  ? `Initializing key "${currentKey}" with entry ("${currentVal}", ${currentTimestamp}).` 
                  : 'Key not found in history. Returning "".'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeMapVisualizer;
