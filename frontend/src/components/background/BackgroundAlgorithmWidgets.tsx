import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * BackgroundArrayWidget
 * Displays an animated array with a moving pointer indicator
 */
export const BackgroundArrayWidget: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % 4);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1 font-mono text-[9px] text-slate-500 font-bold select-none">
      <div className="flex gap-1">
        {[4, 7, 2, 9].map((val, idx) => (
          <div 
            key={idx} 
            className={`w-7 h-7 rounded border flex items-center justify-center transition-colors duration-300 ${
              idx === activeIdx 
                ? 'bg-indigo-50 border-indigo-400 text-indigo-600 shadow-xs' 
                : 'bg-transparent border-slate-200 text-slate-350'
            }`}
          >
            {val}
          </div>
        ))}
      </div>
      <div className="relative w-full h-3">
        <motion.span 
          animate={{ x: activeIdx * 32 + 10 }} 
          transition={{ type: "spring", stiffness: 100 }}
          className="absolute text-indigo-500 text-[10px]"
        >
          ↑
        </motion.span>
      </div>
    </div>
  );
};

/**
 * BackgroundBinaryTreeWidget
 * Displays a binary tree with DFS traversal animation
 */
export const BackgroundBinaryTreeWidget: React.FC = () => {
  const [dfsStep, setDfsStep] = useState(0); // 0 = Root, 1 = Left, 2 = Right
  useEffect(() => {
    const interval = setInterval(() => {
      setDfsStep(prev => (prev + 1) % 3);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg className="w-24 h-16" viewBox="0 0 100 60">
      <line x1="50" y1="12" x2="25" y2="40" stroke={dfsStep === 1 ? '#6366f1' : '#cbd5e1'} strokeWidth={dfsStep === 1 ? '1.5' : '1'} className="transition-all duration-500" />
      <line x1="50" y1="12" x2="75" y2="40" stroke={dfsStep === 2 ? '#6366f1' : '#cbd5e1'} strokeWidth={dfsStep === 2 ? '1.5' : '1'} className="transition-all duration-500" />
      
      <circle cx="50" cy="12" r="6" fill={dfsStep === 0 ? '#e0e7ff' : '#ffffff'} stroke={dfsStep === 0 ? '#4f46e5' : '#cbd5e1'} strokeWidth="1" className="transition-all duration-500" />
      <circle cx="25" cy="40" r="6" fill={dfsStep === 1 ? '#e0e7ff' : '#ffffff'} stroke={dfsStep === 1 ? '#4f46e5' : '#cbd5e1'} strokeWidth="1" className="transition-all duration-500" />
      <circle cx="75" cy="40" r="6" fill={dfsStep === 2 ? '#e0e7ff' : '#ffffff'} stroke={dfsStep === 2 ? '#4f46e5' : '#cbd5e1'} strokeWidth="1" className="transition-all duration-500" />
    </svg>
  );
};

/**
 * BackgroundHashMapWidget
 * Displays a hash map with cycling key-value pairs
 */
export const BackgroundHashMapWidget: React.FC = () => {
  const [activeKey, setActiveKey] = useState(0); // 0 = key 2, 1 = key 7, 2 = key 11
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveKey(prev => (prev + 1) % 3);
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  const entries = [
    { k: 2, v: 0 },
    { k: 7, v: 1 },
    { k: 11, v: 2 }
  ];

  return (
    <div className="flex flex-col gap-1 font-mono text-[8.5px] font-bold select-none text-slate-500">
      {entries.map((entry, idx) => {
        const isActive = idx === activeKey;
        return (
          <div 
            key={idx} 
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors duration-300 ${
              isActive 
                ? 'bg-indigo-50 border-indigo-400 text-indigo-600 shadow-xs' 
                : 'bg-transparent border-slate-150 text-slate-300'
            }`}
          >
            <span>{entry.k}</span>
            <span>➔</span>
            <span>{entry.v}</span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * BackgroundLinkedListWidget
 * Displays a linked list with animated pointer traversal
 */
export const BackgroundLinkedListWidget: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % 4);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1 font-mono text-[9px] text-slate-500 font-bold select-none">
      {[1, 2, 3, 4].map((val, idx) => {
        const isActive = idx === activeIdx;
        return (
          <React.Fragment key={idx}>
            <div 
              className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors duration-300 ${
                isActive 
                  ? 'bg-indigo-50 border-indigo-400 text-indigo-650 scale-105 shadow-xs' 
                  : 'bg-transparent border-slate-200 text-slate-300'
              }`}
            >
              {val}
            </div>
            {idx < 3 && <span className="text-[7.5px] text-slate-300">➔</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/**
 * BackgroundRecursionStackWidget
 * Displays a call stack with push/pop animation for recursion
 */
export const BackgroundRecursionStackWidget: React.FC = () => {
  const [step, setStep] = useState(0); // 0 -> 1 -> 2 -> 3 (push), 4 -> 5 -> 6 (pop)
  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev + 1) % 6);
    }, 1250);
    return () => clearInterval(interval);
  }, []);

  const stackStates = [
    [],
    ['fact(4)'],
    ['fact(3)', 'fact(4)'],
    ['fact(2)', 'fact(3)', 'fact(4)'],
    ['fact(3)', 'fact(4)'],
    ['fact(4)']
  ];

  const currentStack = stackStates[step] || [];

  return (
    <div className="w-20 h-16 flex flex-col justify-end bg-transparent border-x border-b border-slate-200/60 rounded-b p-1 gap-1">
      <AnimatePresence>
        {currentStack.map(frame => (
          <motion.div 
            key={frame}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="h-4 rounded border border-indigo-200/50 bg-indigo-50/20 text-[7px] text-indigo-500 font-mono font-bold flex items-center justify-center shadow-xs"
          >
            {frame}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * BackgroundPointerArrowWidget
 * Displays a rotating arrow pointer for demonstrations
 */
export const BackgroundPointerArrowWidget: React.FC = () => {
  const [dir, setDir] = useState(0); // 0: up, 1: right, 2: down, 3: left
  useEffect(() => {
    const interval = setInterval(() => {
      setDir(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const angles = [0, 90, 180, 270];

  return (
    <div className="flex flex-col items-center gap-0.5 select-none font-mono text-[7.5px] font-bold text-slate-350">
      <motion.div 
        animate={{ rotate: angles[dir] }}
        transition={{ type: "spring", stiffness: 100 }}
        className="text-indigo-400"
      >
        <svg className="w-6 h-6 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18" />
        </svg>
      </motion.div>
      <span>ptr</span>
    </div>
  );
};
