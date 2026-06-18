import React from 'react';
import { motion } from 'framer-motion';

export type BubbleVariant = 'info' | 'success' | 'warning' | 'action';
export type BubbleAnimation = 'pop' | 'pulse' | 'slide';

interface ContextBubbleProps {
  message: string;
  variant?: BubbleVariant;
  animation?: BubbleAnimation;
  className?: string;
  position?: 'top' | 'bottom';
}

export const ContextBubble: React.FC<ContextBubbleProps> = ({
  message,
  variant = 'info',
  animation = 'pop',
  className = '',
  position = 'top'
}) => {
  // Styles for different variants
  const variantStyles = {
    info: 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-500/20',
    success: 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/20',
    warning: 'bg-amber-500 border-amber-400 text-slate-900 shadow-amber-500/20',
    action: 'bg-rose-600 border-rose-500 text-white shadow-rose-500/20'
  };

  const borderStyles = {
    info: 'border-t-indigo-600',
    success: 'border-t-emerald-600',
    warning: 'border-t-amber-500',
    action: 'border-t-rose-600'
  };

  const borderBottomStyles = {
    info: 'border-b-indigo-600',
    success: 'border-b-emerald-600',
    warning: 'border-b-amber-500',
    action: 'border-b-rose-600'
  };

  // Motion variants
  const animationVariants = {
    pop: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: { type: 'spring' as const, stiffness: 300, damping: 20 }
    },
    pulse: {
      initial: { scale: 0.95, opacity: 0.9 },
      animate: { scale: [0.95, 1.05, 0.95], opacity: 1 },
      transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' as const }
    },
    slide: {
      initial: { y: position === 'top' ? 10 : -10, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      transition: { duration: 0.3 }
    }
  };

  const chosenAnimation = animationVariants[animation];

  return (
    <div className={`flex flex-col items-center z-30 select-none ${className}`}>
      {position === 'bottom' && (
        <div className={`border-b-[4px] ${borderBottomStyles[variant]} border-x-[3.5px] border-x-transparent`} />
      )}
      <motion.div
        initial={chosenAnimation.initial}
        animate={chosenAnimation.animate}
        transition={chosenAnimation.transition}
        className={`border text-[10px] font-black px-2.5 py-1.5 rounded-xl shadow-lg flex flex-col items-center text-center font-mono max-w-[180px] break-words whitespace-normal leading-tight ${variantStyles[variant]}`}
      >
        {message}
      </motion.div>
      {position === 'top' && (
        <div className={`border-t-[4px] ${borderStyles[variant]} border-x-[3.5px] border-x-transparent`} />
      )}
    </div>
  );
};
