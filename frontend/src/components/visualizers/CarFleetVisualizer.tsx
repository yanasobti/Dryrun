import React, { useMemo } from 'react';

interface CarFleetVisualizerProps {
  visualizerState: any;
}

export const CarFleetVisualizer: React.FC<CarFleetVisualizerProps> = ({
  visualizerState
}) => {
  const variables = visualizerState?.variables || {};

  // Retrieve arrays and target
  const target = variables.target !== undefined ? Number(variables.target) : 12;
  const positionArray = visualizerState?.arrays?.find((a: any) => a.name === 'position');
  const speedArray = visualizerState?.arrays?.find((a: any) => a.name === 'speed');

  const positions = positionArray ? positionArray.values : [];
  const speeds = speedArray ? speedArray.values : [];

  // Reconstruct sorted cars list
  const cars = useMemo(() => {
    if (positions.length === 0 || speeds.length === 0) return [];
    const list = positions.map((pos: number, idx: number) => {
      const spd = speeds[idx];
      const time = spd > 0 ? (target - pos) / spd : 0;
      return {
        id: idx,
        position: pos,
        speed: spd,
        time: Number(time.toFixed(2))
      };
    });
    // Sort descending by position
    return list.sort((a: any, b: any) => b.position - a.position);
  }, [positions, speeds, target]);

  // Current iteration variables
  const loopIndex = variables.i !== undefined ? Number(variables.i) : -1;
  const currentTime = variables.time !== undefined ? Number(variables.time) : null;

  // Active stack of arrival times
  const activeStack = useMemo(() => {
    if (visualizerState?.stacks && visualizerState.stacks.length > 0) {
      return visualizerState.stacks[0];
    }
    return null;
  }, [visualizerState?.stacks]);
  const stackValues = activeStack?.values || [];

  return (
    <div className="flex flex-col gap-5 w-full max-w-2xl mx-auto p-2">
      {/* Tiny Strategy Header */}
      <div className="text-center border-b border-slate-100 pb-2.5 mb-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Stack • Car Fleet Simulation
        </span>
      </div>

      {/* Whiteboard Workspace */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs flex flex-col gap-6 min-h-[220px] overflow-visible w-full">
        
        {/* 1. Road Simulation Track */}
        <div className="flex flex-col gap-1.5 w-full bg-slate-50/50 border border-slate-150 rounded-xl p-4 font-mono select-none">
          <div className="flex justify-between items-center text-[9.5px] font-black text-slate-450 uppercase tracking-wider mb-2">
            <span>Road (Target = {target} miles)</span>
            <span className="text-indigo-600 font-extrabold">Destination ➔</span>
          </div>

          <div className="relative h-14 bg-slate-200 border-y-2 border-slate-350 rounded flex items-center px-2">
            {/* Lane dividers */}
            <div className="absolute inset-x-0 h-0.5 border-t border-dashed border-white/60 top-1/2 -translate-y-1/2" />

            {/* Target line */}
            <div className="absolute right-12 top-0 bottom-0 w-1 bg-red-500/80 border-x border-red-650 flex items-center justify-center">
              <span className="absolute -top-4 text-[8px] font-black text-red-600 bg-white px-1 border border-red-200 rounded">
                Target
              </span>
            </div>

            {/* Render Cars on Track */}
            {cars.map((car: any, index: number) => {
              const leftPercent = Math.min(90, (car.position / target) * 85);
              const isActive = index === loopIndex;
              const inStack = stackValues.map(Number).includes(car.time);

              return (
                <div
                  key={car.id}
                  className={`absolute transition-all duration-500 flex flex-col items-center`}
                  style={{ left: `${leftPercent}%` }}
                >
                  <div
                    className={`px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1 border shadow-2xs ${
                      isActive
                        ? 'bg-amber-450 border-amber-550 text-indigo-950 scale-110 ring-2 ring-amber-500/30 z-20'
                        : inStack
                        ? 'bg-indigo-600 border-indigo-700 text-white z-10'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    🚗 {car.position}mi
                  </div>
                  <span className="text-[7.5px] font-bold text-slate-450 mt-0.5">
                    {car.speed}mph
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Side-by-side Table & Explanation Context */}
        <div className="flex flex-col md:flex-row gap-6 w-full items-stretch">
          
          {/* Cars List Ordered by Position DESC */}
          <div className="flex-1 border border-slate-200 rounded-lg overflow-hidden bg-white flex flex-col font-mono text-xs shadow-2xs select-none">
            <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200 font-black text-[9px] text-slate-500 uppercase tracking-wider py-1.5 text-center">
              <div>Pos</div>
              <div>Speed</div>
              <div>Time</div>
              <div>Status</div>
            </div>
            <div className="flex flex-col divide-y divide-slate-100">
              {cars.map((car: any, index: number) => {
                const isActive = index === loopIndex;
                const isProcessed = index < loopIndex;
                const isLeadCar = stackValues.map(Number).includes(car.time);

                let statusText = "Pending";
                let statusClass = "text-slate-400";
                if (isActive) {
                  statusText = "Scanning";
                  statusClass = "text-amber-600 font-black bg-amber-50";
                } else if (isLeadCar) {
                  statusText = "Lead Fleet";
                  statusClass = "text-indigo-600 font-extrabold bg-indigo-50/50";
                } else if (isProcessed) {
                  statusText = "Joins Fleet";
                  statusClass = "text-slate-500 font-medium";
                }

                return (
                  <div
                    key={car.id}
                    className={`grid grid-cols-4 py-1.5 text-center items-center transition-all ${
                      isActive ? 'bg-amber-50/30 border-y border-amber-200/50 font-black' : ''
                    }`}
                  >
                    <div className="font-extrabold">{car.position}mi</div>
                    <div>{car.speed}mph</div>
                    <div className="font-bold text-slate-600">{car.time}h</div>
                    <div className={`text-[9.5px] px-1 rounded ${statusClass}`}>{statusText}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floating Context Bubble explaining decision */}
          <div className="w-full md:w-[220px] flex items-center justify-center shrink-0">
            {loopIndex !== -1 && cars[loopIndex] && (
              <div className="w-full relative bg-slate-50 border border-slate-250 text-slate-800 p-3.5 rounded-xl shadow-xs font-sans text-xs font-semibold flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                <span className="text-[9px] font-black text-indigo-650 uppercase tracking-wider border-b border-slate-200 pb-0.5 font-mono">
                  💬 Evaluation Insight
                </span>
                <p className="text-slate-700 leading-relaxed text-[11px] font-bold">
                  Evaluating car at pos <strong>{cars[loopIndex].position}mi</strong> with arrival time <strong>{cars[loopIndex].time}h</strong>.
                </p>
                <p className="text-slate-500 leading-snug text-[10px] font-medium border-t border-slate-150/50 pt-1">
                  {stackValues.length === 0
                    ? `Stack is empty, so this car becomes the lead of a new fleet.`
                    : currentTime !== null && Number(stackValues[stackValues.length - 1]) >= currentTime
                    ? `Time (${currentTime}h) ≤ lead car's time (${stackValues[stackValues.length - 1]}h). It catches up and joins the fleet!`
                    : `Time (${currentTime}h) > lead car's time (${stackValues[stackValues.length - 1]}h). It cannot catch up, starting a new fleet.`}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default CarFleetVisualizer;
