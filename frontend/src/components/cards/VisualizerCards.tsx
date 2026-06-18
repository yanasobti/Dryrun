import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CardVisualizerProps {
  onCardMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onCardMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * ArraysCardVisualizer
 * Mini visualizer showing array iteration with moving pointer
 */
export const ArraysCardVisualizer: React.FC<CardVisualizerProps> = ({ onCardMouseMove, onCardMouseLeave }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s + 1) % 4);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      onMouseMove={onCardMouseMove}
      onMouseLeave={onCardMouseLeave}
      className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col gap-5 shadow-xs text-left cursor-pointer select-none group min-h-[170px]"
    >
      <div className="h-16 flex flex-col items-center justify-center bg-slate-50 border border-slate-150 rounded-xl relative p-2 overflow-hidden">
        {/* Array grid */}
        <div className="flex gap-1.5 relative z-10">
          {[4, 2, 7, 1].map((val, idx) => (
            <div key={idx} className={`w-7 h-7 rounded border flex items-center justify-center transition-all duration-300 font-mono text-[9px] font-bold ${
              idx === step ? 'bg-indigo-50 border-indigo-400 text-indigo-600 shadow-sm' : 'bg-white border-slate-200 text-slate-500'
            }`}>
              {val}
            </div>
          ))}
        </div>
        
        {/* Bouncing pointer underneath active node */}
        <div className="w-full max-w-[120px] relative h-4 text-indigo-600 font-bold text-[9px] text-center z-10">
          <motion.div 
            animate={{ x: step * 31.5 - 47 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="absolute left-1/2"
          >
            ↑
          </motion.div>
        </div>
      </div>
      <div>
        <h4 className="font-extrabold text-[12px] text-slate-800 font-satoshi-premium group-hover:text-indigo-650 transition-colors">Arrays Card</h4>
        <p className="text-[10px] text-slate-450 leading-relaxed font-semibold mt-1">
          Pointer bounces cells in search targets or boundaries index.
        </p>
      </div>
    </div>
  );
};

/**
 * TreesCardVisualizer
 * Mini visualizer showing tree traversal with DFS highlighting
 */
export const TreesCardVisualizer: React.FC<CardVisualizerProps> = ({ onCardMouseMove, onCardMouseLeave }) => {
  const [step, setStep] = useState(0); // 0 (root), 1 (left), 2 (right)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s + 1) % 3);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      onMouseMove={onCardMouseMove}
      onMouseLeave={onCardMouseLeave}
      className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col gap-5 shadow-xs text-left cursor-pointer select-none group min-h-[170px]"
    >
      <div className="h-16 flex items-center justify-center bg-slate-50 border border-slate-150 rounded-xl relative p-1">
        <svg className="w-32 h-14" viewBox="0 0 100 50">
          <line x1="50" y1="12" x2="30" y2="38" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="50" y1="12" x2="70" y2="38" stroke="#cbd5e1" strokeWidth="1.5" />

          {/* Root node */}
          <circle 
            cx="50" cy="12" r="6.5" 
            className="transition-all duration-300"
            fill={step === 0 ? '#e0e7ff' : '#ffffff'} 
            stroke={step === 0 ? '#4f46e5' : '#cbd5e1'} 
            strokeWidth="1.5" 
          />
          <text x="50" y="14.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={step === 0 ? '#4338ca' : '#64748b'} fontFamily="monospace">5</text>

          {/* Left node */}
          <circle 
            cx="30" cy="38" r="6.5" 
            className="transition-all duration-300"
            fill={step === 1 ? '#e0e7ff' : '#ffffff'} 
            stroke={step === 1 ? '#4f46e5' : '#cbd5e1'} 
            strokeWidth="1.5" 
          />
          <text x="30" y="40.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={step === 1 ? '#4338ca' : '#64748b'} fontFamily="monospace">3</text>

          {/* Right node */}
          <circle 
            cx="70" cy="38" r="6.5" 
            className="transition-all duration-300"
            fill={step === 2 ? '#e0e7ff' : '#ffffff'} 
            stroke={step === 2 ? '#4f46e5' : '#cbd5e1'} 
            strokeWidth="1.5" 
          />
          <text x="70" y="40.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={step === 2 ? '#4338ca' : '#64748b'} fontFamily="monospace">8</text>
        </svg>
      </div>
      <div>
        <h4 className="font-extrabold text-[12px] text-slate-800 font-satoshi-premium group-hover:text-indigo-650 transition-colors">Trees Card</h4>
        <p className="text-[10px] text-slate-450 leading-relaxed font-semibold mt-1">
          DFS recursive highlight path updates on node branches.
        </p>
      </div>
    </div>
  );
};

/**
 * HashMapCardVisualizer
 * Mini visualizer showing hash map key insertions
 */
export const HashMapCardVisualizer: React.FC<CardVisualizerProps> = ({ onCardMouseMove, onCardMouseLeave }) => {
  const [step, setStep] = useState(0); // 0 (empty), 1 (insert 2->0), 2 (insert 7->1), 3 (flash both)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s + 1) % 4);
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      onMouseMove={onCardMouseMove}
      onMouseLeave={onCardMouseLeave}
      className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col gap-5 shadow-xs text-left cursor-pointer select-none group min-h-[170px]"
    >
      <div className="h-16 flex flex-col justify-center items-center bg-slate-50 border border-slate-150 rounded-xl relative p-2 overflow-hidden gap-1 text-[8.5px] font-mono">
        <div className="flex gap-2">
          {/* Key-value pair 1 */}
          <motion.div 
            animate={{ scale: step >= 1 && step <= 3 ? 1 : 0.8 }}
            className={`px-2 py-0.5 rounded border transition-colors ${
              (step === 1 || step === 3) ? 'bg-indigo-50 border-indigo-300 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            2 ➔ 0
          </motion.div>

          {/* Key-value pair 2 */}
          <motion.div 
            animate={{ scale: step >= 2 && step <= 3 ? 1 : 0.8 }}
            className={`px-2 py-0.5 rounded border transition-colors ${
              (step === 2 || step === 3) ? 'bg-indigo-50 border-indigo-300 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            7 ➔ 1
          </motion.div>
        </div>

        {step === 0 && (
          <span className="text-[7.5px] text-slate-400 italic">inserting...</span>
        )}
      </div>
      <div>
        <h4 className="font-extrabold text-[12px] text-slate-800 font-satoshi-premium group-hover:text-indigo-650 transition-colors">HashMap Card</h4>
        <p className="text-[10px] text-slate-450 leading-relaxed font-semibold mt-1">
          Key gets hashed and slides index slots mapping arrays target values.
        </p>
      </div>
    </div>
  );
};

/**
 * LinkedListsCardVisualizer
 * Mini visualizer showing linked list node traversal
 */
export const LinkedListsCardVisualizer: React.FC<CardVisualizerProps> = ({ onCardMouseMove, onCardMouseLeave }) => {
  const [step, setStep] = useState(0); // 0 (A), 1 (B), 2 (C)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s + 1) % 3);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      onMouseMove={onCardMouseMove}
      onMouseLeave={onCardMouseLeave}
      className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col gap-5 shadow-xs text-left cursor-pointer select-none group min-h-[170px]"
    >
      <div className="h-16 flex flex-col justify-center items-center bg-slate-50 border border-slate-150 rounded-xl p-2 relative">
        <div className="flex items-center gap-1.5 relative z-10">
          {['A', 'B', 'C'].map((val, idx) => {
            const isActive = idx === step;
            return (
              <React.Fragment key={idx}>
                <motion.div 
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  className={`w-7 h-7 rounded border flex items-center justify-center transition-all duration-300 font-mono text-[9px] font-bold ${
                    isActive ? 'bg-indigo-50 border-indigo-400 text-indigo-600 shadow-sm' : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  {val}
                </motion.div>
                {idx < 2 && <span className="text-[8px] text-slate-300">→</span>}
              </React.Fragment>
            );
          })}
        </div>
        
        {/* Pointer tracking */}
        <div className="w-full max-w-[100px] relative h-3 text-indigo-600 font-bold text-[8.5px] text-center mt-1">
          <motion.div 
            animate={{ x: step * 31 - 31 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="absolute left-1/2"
          >
            curr
          </motion.div>
        </div>
      </div>
      <div>
        <h4 className="font-extrabold text-[12px] text-slate-800 font-satoshi-premium group-hover:text-indigo-650 transition-colors">Linked Lists Card</h4>
        <p className="text-[10px] text-slate-450 leading-relaxed font-semibold mt-1">
          Pointers reference jumps along node nodes address links.
        </p>
      </div>
    </div>
  );
};

/**
 * RecursionCardVisualizer
 * Mini visualizer showing call stack with push/pop animation
 */
export const RecursionCardVisualizer: React.FC<CardVisualizerProps> = ({ onCardMouseMove, onCardMouseLeave }) => {
  const [step, setStep] = useState(0); // 0 -> 1 -> 2 -> 3 (push), 4 -> 5 (pop)
  const stack = [
    ['fact(3)'],
    ['fact(2)', 'fact(3)'],
    ['fact(1)', 'fact(2)', 'fact(3)'],
    ['fact(2)', 'fact(3)'],
    ['fact(3)'],
    []
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s + 1) % 6);
    }, 850);
    return () => clearInterval(interval);
  }, []);

  const currentStack = stack[step] || [];

  return (
    <div 
      onMouseMove={onCardMouseMove}
      onMouseLeave={onCardMouseLeave}
      className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col gap-5 shadow-xs text-left cursor-pointer select-none group min-h-[170px]"
    >
      <div className="h-16 flex flex-col justify-end items-center bg-slate-50 border border-slate-150 rounded-xl p-2.5 overflow-hidden">
        <div className="flex flex-col gap-1 w-full max-w-[80px]">
          {currentStack.map((frame) => (
            <motion.div 
              key={frame}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-4 rounded border border-indigo-200 bg-indigo-50 text-[7px] text-indigo-600 font-mono font-bold flex items-center justify-center"
            >
              {frame}
            </motion.div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-extrabold text-[12px] text-slate-800 font-satoshi-premium group-hover:text-indigo-650 transition-colors">Recursion Card</h4>
        <p className="text-[10px] text-slate-450 leading-relaxed font-semibold mt-1">
          Stack frames grow on self-call and collapse back returning.
        </p>
      </div>
    </div>
  );
};
