import React from 'react';
import { motion } from 'framer-motion';

/**
 * RoadmapStepProps
 * Configuration for each roadmap step
 */
export interface RoadmapStepProps {
  num: number;
  active: boolean;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

/**
 * RoadmapStep
 * Individual step component for the "How It Works" roadmap timeline
 * Displays alternating left/right layout with animated opacity and scale
 */
export const RoadmapStep: React.FC<RoadmapStepProps> = ({ num, active, title, desc, icon }) => {
  const alignLeft = num % 2 !== 0;
  
  return (
    <div className={`w-full flex flex-col md:flex-row items-center md:justify-between relative ${
      alignLeft ? '' : 'md:flex-row-reverse'
    }`}>
      
      {/* Node Bullet Point */}
      <div className="absolute left-[24px] md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border bg-white flex items-center justify-center text-[10px] font-bold z-10 transition-all duration-500"
        style={{
          borderColor: active ? 'var(--color-primary)' : '#cbd5e1',
          color: active ? 'var(--color-primary)' : '#64748b',
          boxShadow: active ? '0 0 10px rgba(99, 102, 241, 0.3)' : 'none'
        }}
      >
        {num}
      </div>

      {/* Card Block */}
      <motion.div 
        animate={{ opacity: active ? 1 : 0.3, scale: active ? 1 : 0.96 }}
        transition={{ duration: 0.4 }}
        className={`w-full md:w-[44%] ml-14 md:ml-0 bg-white border rounded-3xl p-6 shadow-xs flex flex-col gap-3 text-left transition-all ${
          active ? 'border-indigo-150' : 'border-slate-150'
        }`}
      >
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
          active ? 'bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-sm' : 'bg-slate-50 border border-slate-200 text-slate-400'
        }`}>
          {icon}
        </div>
        <h4 className="font-extrabold text-sm text-slate-800 font-satoshi-premium">{title}</h4>
        <p className="text-[11px] text-slate-455 leading-relaxed font-semibold">{desc}</p>
      </motion.div>

      {/* Empty visual column space placeholder for layout grid alignment */}
      <div className="hidden md:block w-[44%]" />

    </div>
  );
};
