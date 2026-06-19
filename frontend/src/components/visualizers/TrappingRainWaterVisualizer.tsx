import React from 'react';
import { motion } from 'framer-motion';
import { VisualizerProps } from '@/types';

const TrappingRainWaterVisualizer: React.FC<VisualizerProps> = ({ data, currentStep }) => {
  if (!data || !data.steps || data.steps.length === 0) {
    return <div>No data available for visualization.</div>;
  }

  const step = data.steps[currentStep];
  const { array, left, right, leftMax, rightMax, totalWater } = step.variables;

  const maxVal = Math.max(...array, 0);

  return (
    <div className="flex flex-col items-center p-4 bg-gray-900 text-white rounded-lg">
      <div className="flex justify-around w-full mb-4 text-sm">
        <span>Left: {left}</span>
        <span>Right: {right}</span>
        <span>Left Max: {leftMax}</span>
        <span>Right Max: {rightMax}</span>
        <span>Total Water: {totalWater}</span>
      </div>
      <div className="flex items-end h-64">
        {array.map((height: number, index: number) => {
          const barHeight = (height / maxVal) * 100;
          const waterHeight = Math.max(0, Math.min(leftMax, rightMax) - height);
          const waterDisplayHeight = (waterHeight / maxVal) * 100;

          return (
            <div key={index} className="relative mx-0.5" style={{ width: '30px' }}>
              {waterHeight > 0 && (
                <motion.div
                  className="absolute bottom-0 bg-blue-500"
                  style={{
                    height: `${barHeight}%`,
                    bottom: `${barHeight}%`,
                    width: '100%',
                    opacity: 0.5,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${waterDisplayHeight}%` }}
                  transition={{ duration: 0.5 }}
                />
              )}
              <div
                className="bg-gray-700"
                style={{ height: `${barHeight}%` }}
              ></div>
              <div className="absolute -bottom-6 text-center w-full text-xs">{height}</div>
              {(index === left || index === right) && (
                <div
                  className={`absolute -top-6 text-xs px-1 rounded ${
                    index === left ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {index === left ? 'L' : 'R'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrappingRainWaterVisualizer;

