import React from 'react';

interface TimelineControllerProps {
  frames: any[];
  currentFrameIndex: number;
  setCurrentFrameIndex: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  speed: number;
  setSpeed: (speed: 0.5 | 1 | 1.5 | 2) => void;
}

export const TimelineController: React.FC<TimelineControllerProps> = ({
  frames,
  currentFrameIndex,
  setCurrentFrameIndex,
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-4 shadow-sm select-none z-10 shrink-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <span className="text-[10px] font-extrabold text-slate-555 uppercase tracking-wider font-mono">
            Timeline
          </span>
          <div className="flex items-center gap-1.5 flex-1 max-w-lg relative">
            <div className="absolute left-3 right-3 h-0.5 bg-slate-100 top-1/2 -translate-y-1/2 z-0" />
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
              let isActive = false;
              let isCompleted = false;
              if (frames.length > 0) {
                const activeCircle = Math.min(9, Math.round((currentFrameIndex / (frames.length - 1 || 1)) * 8) + 1);
                isActive = num === activeCircle;
                isCompleted = num < activeCircle;
              }
              return (
                <div
                  key={num}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold border transition-all z-10 ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-550/20 scale-110 animate-pulse-step'
                      : isCompleted
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  {num}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-wider">
            Step:
          </span>
          <span className="text-xs font-bold text-slate-700 font-mono">
            {frames.length > 0 ? `${currentFrameIndex + 1} / ${frames.length}` : '0 / 0'}
          </span>
        </div>
      </div>

      {/* Play/Speed control block */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentFrameIndex(0)}
            disabled={frames.length === 0}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
            title="Go to Start"
          >
            <svg className="w-3.5 h-3.5 stroke-slate-555 stroke-2 fill-none" viewBox="0 0 24 24">
              <polygon points="11 19 2 12 11 5 11 19"/>
              <polygon points="22 19 13 12 22 5 22 19"/>
            </svg>
          </button>

          <button
            onClick={() => setCurrentFrameIndex((prev) => Math.max(0, prev - 1))}
            disabled={frames.length === 0 || currentFrameIndex === 0}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
            title="Step Backward"
          >
            <svg className="w-3.5 h-3.5 fill-slate-555 stroke-none" viewBox="0 0 24 24">
              <polygon points="19,4 9,12 19,20" />
              <rect x="5" y="4" width="2" height="16" />
            </svg>
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={frames.length === 0}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shadow-md ${
              isPlaying
                ? 'bg-indigo-50 border border-indigo-200 text-indigo-650 hover:bg-indigo-100/60'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/10'
            }`}
          >
            {isPlaying ? (
              <svg className="w-4.5 h-4.5 fill-indigo-600 stroke-none" viewBox="0 0 24 24">
                <rect x="4" y="4" width="4" height="16"/>
                <rect x="16" y="4" width="4" height="16"/>
              </svg>
            ) : (
              <svg className="w-4.5 h-4.5 fill-white stroke-none ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <button
            onClick={() => setCurrentFrameIndex((prev) => Math.min(frames.length - 1, prev + 1))}
            disabled={frames.length === 0 || currentFrameIndex === frames.length - 1}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <svg className="w-3.5 h-3.5 fill-slate-555 stroke-none" viewBox="0 0 24 24">
              <polygon points="5,4 15,12 5,20" />
              <rect x="17" y="4" width="2" height="16" />
            </svg>
          </button>
        </div>

        {/* Speed selection pills */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 p-1 rounded-xl">
          {([0.5, 1, 1.5, 2] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black font-mono transition-all uppercase cursor-pointer ${
                speed === s
                  ? 'bg-white text-indigo-655 border border-slate-200/80 shadow-xs'
                  : 'text-slate-450 hover:text-slate-700'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Range slider timeline tracker */}
      <div className="flex items-center gap-3 w-full mt-2 relative">
        <input
          type="range"
          min={0}
          max={Math.max(0, frames.length - 1)}
          value={currentFrameIndex}
          onChange={(e) => {
            setCurrentFrameIndex(parseInt(e.target.value));
            setIsPlaying(false);
          }}
          disabled={frames.length === 0}
          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
      </div>
    </div>
  );
};
