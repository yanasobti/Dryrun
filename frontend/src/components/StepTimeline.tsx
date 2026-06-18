import React from 'react';

interface FrameDetail {
  line: number;
  explanation?: string;
}

interface StepTimelineProps {
  currentFrame: number;
  totalFrames: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (frameIndex: number) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  frames?: FrameDetail[];
}

export const StepTimeline: React.FC<StepTimelineProps> = ({
  currentFrame,
  totalFrames,
  isPlaying,
  onPlayPause,
  onPrev,
  onNext,
  onSeek,
  speed,
  onSpeedChange,
  frames = []
}) => {
  const progressPercent = totalFrames > 1 ? (currentFrame / (totalFrames - 1)) * 100 : 0;

  // Simple helper to cap explanations
  const getExplanation = (index: number) => {
    if (frames && frames[index] && frames[index].explanation) {
      return frames[index].explanation;
    }
    return `Step ${index + 1}`;
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/5 px-6 py-4 flex flex-col gap-4 select-none">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Playback Button Controls */}
        <div className="flex items-center gap-2">
          {/* Step Back */}
          <button
            onClick={onPrev}
            disabled={currentFrame <= 0}
            className="w-9 h-9 rounded-xl border border-white/5 hover:bg-white/5 flex items-center justify-center text-slate-300 hover:text-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Step Back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            onClick={onPlayPause}
            className="w-12 h-12 rounded-xl bg-cyan-600 hover:bg-cyan-500 flex items-center justify-center text-slate-950 font-bold transition-all shadow-[0_4px_16px_rgba(6,182,212,0.3)] hover:scale-105 cursor-pointer"
            title={isPlaying ? 'Pause' : 'Auto Play'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6 fill-slate-950 stroke-none" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-6 h-6 fill-slate-950 stroke-none translate-x-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Step Forward */}
          <button
            onClick={onNext}
            disabled={currentFrame >= totalFrames - 1}
            className="w-9 h-9 rounded-xl border border-white/5 hover:bg-white/5 flex items-center justify-center text-slate-300 hover:text-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Step Forward"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Scrubbing slider & progress bar */}
        <div className="flex-1 w-full flex items-center gap-4">
          <span className="font-mono text-xs text-slate-400 shrink-0 w-16 text-right">
            Step {currentFrame + 1} / {totalFrames}
          </span>

          <div className="flex-1 relative group h-6 flex items-center">
            {/* Background slider track */}
            <div className="absolute left-0 right-0 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-cyan-500 rounded-full transition-all duration-150"
              />
            </div>

            {/* Slider input */}
            <input
              type="range"
              min={0}
              max={totalFrames - 1 || 0}
              value={currentFrame}
              onChange={(e) => onSeek(parseInt(e.target.value))}
              className="absolute left-0 right-0 w-full h-full opacity-0 cursor-pointer accent-cyan-500"
            />

            {/* Custom scrubber thumb (pure CSS visuals) */}
            <div
              style={{ left: `calc(${progressPercent}% - 6px)` }}
              className="absolute pointer-events-none w-3.5 h-3.5 bg-cyan-400 rounded-full border border-slate-950 shadow-md group-hover:scale-125 transition-transform"
            />
          </div>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-900/60 border border-white/5 rounded-xl p-1">
          {([0.5, 1, 1.5, 2] as const).map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                speed === s
                  ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* active frame short explanation subtitle */}
      {frames.length > 0 && frames[currentFrame] && (
        <div className="border-t border-white/5 pt-3 text-sm text-slate-300 font-medium line-clamp-1 flex items-center gap-2">
          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>{getExplanation(currentFrame)}</span>
        </div>
      )}
    </div>
  );
};
