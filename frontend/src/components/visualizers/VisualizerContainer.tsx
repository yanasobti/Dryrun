import React, { useState } from 'react';

interface VisualizerContainerProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  activeElementCount?: number;
}

export const VisualizerContainer: React.FC<VisualizerContainerProps> = ({
  title,
  subtitle,
  icon,
  children,
  actions,
  activeElementCount
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`glass-panel rounded-2xl flex flex-col transition-all duration-300 relative ${
        isFullscreen
          ? 'fixed inset-4 z-50 bg-white shadow-2xl border-indigo-500/20'
          : 'w-full flex-1 min-h-[280px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 select-none shrink-0">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              {title}
              {activeElementCount !== undefined && activeElementCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
                  {activeElementCount} items
                </span>
              )}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 leading-none">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {actions}
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Main Body content wrapper */}
      <div className="flex-1 overflow-auto p-4 flex flex-col justify-start min-h-0 bg-slate-50/50 rounded-b-2xl relative">
        {children}
      </div>
    </div>
  );
};
