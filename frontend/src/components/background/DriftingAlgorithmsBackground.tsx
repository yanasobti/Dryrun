import React from 'react';
import { motion } from 'framer-motion';
import {
  GlassCubeWidget,
  GlassTorusWidget,
  GlassSphereWidget,
  VectorSwirlWidget
} from './GlassWidgets';
import {
  BackgroundArrayWidget,
  BackgroundBinaryTreeWidget,
  BackgroundHashMapWidget,
  BackgroundLinkedListWidget,
  BackgroundRecursionStackWidget,
  BackgroundPointerArrowWidget
} from './BackgroundAlgorithmWidgets';

/**
 * DriftingAlgorithmsBackground
 * 
 * A complex layered background component featuring:
 * - 3D glass shapes (cubes, toruses, spheres) with glassmorphism effects
 * - Vector swirl paths with gradient fills
 * - Educational algorithm visualizations (arrays, trees, hash maps, stacks)
 * - Smooth animations with varying durations and easing functions
 * 
 * The component is divided into two main layers:
 * 1. 3D Art Layer (45-80% opacity) - Glass shapes and vector swirls
 * 2. Educational Algorithm Layer (15% opacity) - Subtle algorithm visualizations
 */
export const DriftingAlgorithmsBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none w-full h-full">
      
      {/* ──────── 3D ART BACKGROUND LAYER (High Intensity: 45% - 80% Opacity) ──────── */}
      
      {/* 1. Torus 1 (Top Center-Left) */}
      <motion.div 
        animate={{ x: [0, -12, 12, 0], y: [0, 15, -15, 0], rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        className="absolute top-[4%] left-[28%] opacity-[0.9] scale-90"
      >
        <GlassTorusWidget />
      </motion.div>

      {/* 2. Vector Swirl 1 (Hero Left) */}
      <motion.div 
        animate={{ x: [0, 6, -6, 0], y: [0, -10, 10, 0] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
        className="absolute top-[8%] left-[-5%] opacity-[0.7]"
      >
        <VectorSwirlWidget color="#818cf8" />
      </motion.div>

      {/* 3. Glass Cube 1 (Hero Lower Left) */}
      <motion.div 
        animate={{ x: [0, 12, -12, 0], y: [0, -12, 12, 0], rotate: [0, 55, -55, 0] }}
        transition={{ repeat: Infinity, duration: 24, ease: "easeInOut" }}
        className="absolute top-[15%] left-[34%] opacity-[0.95] scale-95"
      >
        <GlassCubeWidget />
      </motion.div>

      {/* 4. Glass Sphere 1 (Hero Right) */}
      <motion.div 
        animate={{ x: [0, -15, 15, 0], y: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
        className="absolute top-[18%] right-[2%] opacity-[0.95] scale-110"
      >
        <GlassSphereWidget />
      </motion.div>

      {/* 5. Glass Torus 2 (Upper Mid Center) */}
      <motion.div 
        animate={{ x: [0, 15, -15, 0], y: [0, -12, 12, 0], rotate: [0, -360] }}
        transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
        className="absolute top-[26%] left-[45%] opacity-[0.9] scale-90"
      >
        <GlassTorusWidget />
      </motion.div>

      {/* 6. Vector Swirl 2 (Upper Mid Right) */}
      <motion.div 
        animate={{ x: [0, -6, 6, 0], y: [0, 12, -12, 0] }}
        transition={{ repeat: Infinity, duration: 22, ease: "easeInOut" }}
        className="absolute top-[32%] right-[-10%] opacity-[0.65] scale-110"
      >
        <VectorSwirlWidget color="#c084fc" />
      </motion.div>

      {/* 7. Glass Cube 2 (Why DryRun Right) */}
      <motion.div 
        animate={{ x: [0, 10, -10, 0], y: [0, 12, -12, 0], rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 28, ease: "easeInOut" }}
        className="absolute top-[38%] right-[8%] opacity-[0.95] scale-75"
      >
        <GlassCubeWidget />
      </motion.div>

      {/* 8. Glass Sphere 2 (Visualizers Mid Left) */}
      <motion.div 
        animate={{ x: [0, 10, -10, 0], y: [0, -15, 15, 0] }}
        transition={{ repeat: Infinity, duration: 26, ease: "easeInOut" }}
        className="absolute top-[46%] left-[10%] opacity-[0.95] scale-95"
      >
        <GlassSphereWidget />
      </motion.div>

      {/* 9. Vector Swirl 3 (Visualizers Center) */}
      <motion.div 
        animate={{ x: [0, 10, -10, 0], y: [0, -10, 10, 0] }}
        transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
        className="absolute top-[54%] left-[15%] opacity-[0.6]"
      >
        <VectorSwirlWidget color="#38bdf8" />
      </motion.div>

      {/* 10. Glass Torus 3 (Pattern Coach Right) */}
      <motion.div 
        animate={{ x: [0, 12, -12, 0], y: [0, -12, 12, 0], rotate: [360, 0] }}
        transition={{ repeat: Infinity, duration: 32, ease: "linear" }}
        className="absolute top-[64%] right-[5%] opacity-[0.9] scale-90"
      >
        <GlassTorusWidget />
      </motion.div>

      {/* 11. Vector Swirl 4 (Pattern Coach Left) */}
      <motion.div 
        animate={{ x: [0, -7.5, 7.5, 0], y: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 24, ease: "easeInOut" }}
        className="absolute top-[72%] left-[-5%] opacity-[0.65]"
      >
        <VectorSwirlWidget color="#818cf8" />
      </motion.div>

      {/* 12. Glass Cube 3 (Timeline Center-Left) */}
      <motion.div 
        animate={{ x: [0, -15, 15, 0], y: [0, 12, -12, 0], rotate: [0, -360] }}
        transition={{ repeat: Infinity, duration: 27, ease: "easeInOut" }}
        className="absolute top-[78%] left-[22%] opacity-[0.95] scale-95"
      >
        <GlassCubeWidget />
      </motion.div>

      {/* 13. Glass Sphere 3 (Timeline Right) */}
      <motion.div 
        animate={{ x: [0, 10, -10, 0], y: [0, -15, 15, 0] }}
        transition={{ repeat: Infinity, duration: 29, ease: "easeInOut" }}
        className="absolute top-[85%] right-[18%] opacity-[0.95] scale-110"
      >
        <GlassSphereWidget />
      </motion.div>

      {/* 14. Vector Swirl 5 (Bottom CTA Right) */}
      <motion.div 
        animate={{ x: [0, 8, -8, 0], y: [0, 8, -8, 0] }}
        transition={{ repeat: Infinity, duration: 23, ease: "easeInOut" }}
        className="absolute top-[92%] right-[-8%] opacity-[0.75] scale-110"
      >
        <VectorSwirlWidget color="#c084fc" />
      </motion.div>

      {/* 15. Glass Torus 4 (Footer Left) */}
      <motion.div 
        animate={{ x: [0, -8, 8, 0], y: [0, 8, -8, 0], rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
        className="absolute top-[96%] left-[12%] opacity-[1] scale-70"
      >
        <GlassTorusWidget />
      </motion.div>

      {/* 16. Glass Cube 4 (Top Right) */}
      <motion.div 
        animate={{ x: [0, -10, 10, 0], y: [0, -15, 15, 0], rotate: [0, -360] }}
        transition={{ repeat: Infinity, duration: 26, ease: "easeInOut" }}
        className="absolute top-[12%] right-[15%] opacity-[0.85] scale-85"
      >
        <GlassCubeWidget />
      </motion.div>

      {/* 17. Vector Swirl 6 (Mid Left) */}
      <motion.div 
        animate={{ x: [0, 12, -12, 0], y: [0, 8, -8, 0] }}
        transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
        className="absolute top-[40%] left-[-8%] opacity-[0.65]"
      >
        <VectorSwirlWidget color="#38bdf8" />
      </motion.div>

      {/* 18. Glass Sphere 4 (Mid Center) */}
      <motion.div 
        animate={{ x: [0, 15, -15, 0], y: [0, -10, 10, 0] }}
        transition={{ repeat: Infinity, duration: 31, ease: "easeInOut" }}
        className="absolute top-[55%] right-[25%] opacity-[0.9] scale-100"
      >
        <GlassSphereWidget />
      </motion.div>

      {/* 19. Glass Torus 5 (Lower Mid) */}
      <motion.div 
        animate={{ x: [0, -12, 12, 0], y: [0, 12, -12, 0], rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 34, ease: "linear" }}
        className="absolute top-[70%] left-[35%] opacity-[0.85] scale-80"
      >
        <GlassTorusWidget />
      </motion.div>

      {/* 20. Vector Swirl 7 (Bottom Right) */}
      <motion.div 
        animate={{ x: [0, 10, -10, 0], y: [0, -12, 12, 0] }}
        transition={{ repeat: Infinity, duration: 21, ease: "easeInOut" }}
        className="absolute top-[88%] right-[12%] opacity-[0.7]"
      >
        <VectorSwirlWidget color="#c084fc" />
      </motion.div>

      {/* 21. Glass Cube 5 (Mid Right) */}
      <motion.div 
        animate={{ x: [0, 15, -15, 0], y: [0, -12, 12, 0], rotate: [0, 180, 360] }}
        transition={{ repeat: Infinity, duration: 29, ease: "easeInOut" }}
        className="absolute top-[50%] right-[8%] opacity-[0.85] scale-80"
      >
        <GlassCubeWidget />
      </motion.div>

      {/* 22. Vector Swirl 8 (Top Left Center) */}
      <motion.div 
        animate={{ x: [0, -8, 8, 0], y: [0, 15, -15, 0] }}
        transition={{ repeat: Infinity, duration: 19, ease: "easeInOut" }}
        className="absolute top-[20%] left-[5%] opacity-[0.6]"
      >
        <VectorSwirlWidget color="#818cf8" />
      </motion.div>

      {/* 23. Glass Sphere 5 (Lower Center) */}
      <motion.div 
        animate={{ x: [0, -10, 10, 0], y: [0, 12, -12, 0] }}
        transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
        className="absolute top-[75%] left-[60%] opacity-[0.9] scale-85"
      >
        <GlassSphereWidget />
      </motion.div>

      {/* 24. Glass Torus 6 (Right Mid Lower) */}
      <motion.div 
        animate={{ x: [0, 10, -10, 0], y: [0, -15, 15, 0], rotate: [360, 0] }}
        transition={{ repeat: Infinity, duration: 36, ease: "linear" }}
        className="absolute top-[62%] right-[2%] opacity-[0.8] scale-75"
      >
        <GlassTorusWidget />
      </motion.div>

      {/* 25. Vector Swirl 9 (Center) */}
      <motion.div 
        animate={{ x: [0, 12, -12, 0], y: [0, -10, 10, 0] }}
        transition={{ repeat: Infinity, duration: 23, ease: "easeInOut" }}
        className="absolute top-[48%] left-[50%] opacity-[0.55]"
      >
        <VectorSwirlWidget color="#38bdf8" />
      </motion.div>


      {/* ──────── EDUCATIONAL ALGORITHM LAYER (Very High Intensity: 35% Opacity) ──────── */}
      <div className="absolute inset-0 opacity-[0.35]">
        {/* 1. Array (Hero Top Left) */}
        <motion.div 
          animate={{ x: [0, 15, -15, 0], y: [0, -20, 20, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
          className="absolute top-[3%] left-[5%] scale-80"
        >
          <BackgroundArrayWidget />
        </motion.div>

        {/* 2. Binary Tree (Hero Top Right) */}
        <motion.div 
          animate={{ x: [0, -15, 15, 0], y: [0, 25, -25, 0] }}
          transition={{ repeat: Infinity, duration: 28, ease: "easeInOut" }}
          className="absolute top-[7%] right-[8%] scale-85"
        >
          <BackgroundBinaryTreeWidget />
        </motion.div>

        {/* 3. Pointer Arrow (Hero Mid Left) */}
        <motion.div 
          animate={{ x: [0, 20, -20, 0], y: [0, -15, 15, 0] }}
          transition={{ repeat: Infinity, duration: 24, ease: "easeInOut" }}
          className="absolute top-[12%] left-[8%] scale-85"
        >
          <BackgroundPointerArrowWidget />
        </motion.div>

        {/* 4. HashMap (Hero Lower Right) */}
        <motion.div 
          animate={{ x: [0, -15, 15, 0], y: [0, 20, -20, 0] }}
          transition={{ repeat: Infinity, duration: 26, ease: "easeInOut" }}
          className="absolute top-[18%] right-[6%] scale-85"
        >
          <BackgroundHashMapWidget />
        </motion.div>

        {/* 5. Call Stack (Why DryRun Left) */}
        <motion.div 
          animate={{ x: [0, 15, -10, 0], y: [0, -20, 20, 0] }}
          transition={{ repeat: Infinity, duration: 26, ease: "easeInOut" }}
          className="absolute top-[24%] left-[7%] scale-85"
        >
          <BackgroundRecursionStackWidget />
        </motion.div>

        {/* 6. Linked List (Why DryRun Right) */}
        <motion.div 
          animate={{ x: [0, -15, 15, 0], y: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 27, ease: "easeInOut" }}
          className="absolute top-[30%] right-[8%] scale-85"
        >
          <BackgroundLinkedListWidget />
        </motion.div>

        {/* 7. Array (Visualizers Left) */}
        <motion.div 
          animate={{ x: [0, 20, -20, 0], y: [0, -20, 20, 0] }}
          transition={{ repeat: Infinity, duration: 28, ease: "easeInOut" }}
          className="absolute top-[36%] left-[5%] scale-80"
        >
          <BackgroundArrayWidget />
        </motion.div>

        {/* 8. Tree (Visualizers Right) */}
        <motion.div 
          animate={{ x: [0, -15, 15, 0], y: [0, 25, -25, 0] }}
          transition={{ repeat: Infinity, duration: 29, ease: "easeInOut" }}
          className="absolute top-[44%] right-[6%] scale-85"
        >
          <BackgroundBinaryTreeWidget />
        </motion.div>

        {/* 9. Pointer Arrow (Visualizers Mid Left) */}
        <motion.div 
          animate={{ x: [0, 20, -20, 0], y: [0, -15, 15, 0] }}
          transition={{ repeat: Infinity, duration: 24, ease: "easeInOut" }}
          className="absolute top-[52%] left-[8%] scale-85"
        >
          <BackgroundPointerArrowWidget />
        </motion.div>

        {/* 10. HashMap (Pattern Coach Right) */}
        <motion.div 
          animate={{ x: [0, 15, -10, 0], y: [0, -20, 20, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
          className="absolute top-[58%] right-[6%] scale-85"
        >
          <BackgroundHashMapWidget />
        </motion.div>

        {/* 11. Linked List (Pattern Coach Left) */}
        <motion.div 
          animate={{ x: [0, 15, -15, 0], y: [0, -25, 25, 0] }}
          transition={{ repeat: Infinity, duration: 30, ease: "easeInOut" }}
          className="absolute top-[63%] left-[6%] scale-85"
        >
          <BackgroundLinkedListWidget />
        </motion.div>

        {/* 12. Call Stack (Timeline Right) */}
        <motion.div 
          animate={{ x: [0, -20, 20, 0], y: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 27, ease: "easeInOut" }}
          className="absolute top-[70%] right-[8%] scale-85"
        >
          <BackgroundRecursionStackWidget />
        </motion.div>

        {/* 13. Array (Timeline Left) */}
        <motion.div 
          animate={{ x: [0, 20, -20, 0], y: [0, -20, 20, 0] }}
          transition={{ repeat: Infinity, duration: 28, ease: "easeInOut" }}
          className="absolute top-[76%] left-[5%] scale-80"
        >
          <BackgroundArrayWidget />
        </motion.div>

        {/* 14. Tree (Bottom CTA Right) */}
        <motion.div 
          animate={{ x: [0, -15, 15, 0], y: [0, 25, -25, 0] }}
          transition={{ repeat: Infinity, duration: 29, ease: "easeInOut" }}
          className="absolute top-[83%] right-[6%] scale-85"
        >
          <BackgroundBinaryTreeWidget />
        </motion.div>

        {/* 15. HashMap (Bottom CTA Left) */}
        <motion.div 
          animate={{ x: [0, 15, -10, 0], y: [0, -20, 20, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
          className="absolute top-[89%] left-[8%] scale-85"
        >
          <BackgroundHashMapWidget />
        </motion.div>

        {/* 16. Linked List (Footer Right) */}
        <motion.div 
          animate={{ x: [0, -15, 15, 0], y: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 27, ease: "easeInOut" }}
          className="absolute top-[94%] right-[8%] scale-85"
        >
          <BackgroundLinkedListWidget />
        </motion.div>

        {/* 17. Pointer Arrow (Footer Left) */}
        <motion.div 
          animate={{ x: [0, -10, 10, 0], y: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 23, ease: "easeInOut" }}
          className="absolute top-[98%] left-[10%] scale-85"
        >
          <BackgroundPointerArrowWidget />
        </motion.div>

        {/* 18. Array (Top Right) */}
        <motion.div 
          animate={{ x: [0, 15, -15, 0], y: [0, -20, 20, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
          className="absolute top-[10%] right-[12%] scale-80"
        >
          <BackgroundArrayWidget />
        </motion.div>

        {/* 19. Tree (Mid Right) */}
        <motion.div 
          animate={{ x: [0, -15, 15, 0], y: [0, 25, -25, 0] }}
          transition={{ repeat: Infinity, duration: 28, ease: "easeInOut" }}
          className="absolute top-[28%] right-[14%] scale-85"
        >
          <BackgroundBinaryTreeWidget />
        </motion.div>

        {/* 20. Pointer Arrow (Right Mid) */}
        <motion.div 
          animate={{ x: [0, 20, -20, 0], y: [0, -15, 15, 0] }}
          transition={{ repeat: Infinity, duration: 24, ease: "easeInOut" }}
          className="absolute top-[40%] right-[12%] scale-85"
        >
          <BackgroundPointerArrowWidget />
        </motion.div>

        {/* 21. HashMap (Lower Left) */}
        <motion.div 
          animate={{ x: [0, 15, -10, 0], y: [0, -20, 20, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
          className="absolute top-[50%] left-[12%] scale-85"
        >
          <BackgroundHashMapWidget />
        </motion.div>

        {/* 22. Linked List (Mid Center) */}
        <motion.div 
          animate={{ x: [0, -15, 15, 0], y: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 27, ease: "easeInOut" }}
          className="absolute top-[38%] left-[45%] scale-85"
        >
          <BackgroundLinkedListWidget />
        </motion.div>

        {/* 23. Call Stack (Right Lower) */}
        <motion.div 
          animate={{ x: [0, -20, 20, 0], y: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 27, ease: "easeInOut" }}
          className="absolute top-[72%] right-[20%] scale-85"
        >
          <BackgroundRecursionStackWidget />
        </motion.div>

        {/* 24. Array (Center) */}
        <motion.div 
          animate={{ x: [0, 20, -20, 0], y: [0, -20, 20, 0] }}
          transition={{ repeat: Infinity, duration: 28, ease: "easeInOut" }}
          className="absolute top-[60%] left-[45%] scale-80"
        >
          <BackgroundArrayWidget />
        </motion.div>

        {/* 25. Pointer Arrow (Top Center) */}
        <motion.div 
          animate={{ x: [0, -15, 15, 0], y: [0, -20, 20, 0] }}
          transition={{ repeat: Infinity, duration: 24, ease: "easeInOut" }}
          className="absolute top-[5%] left-[50%] scale-80"
        >
          <BackgroundPointerArrowWidget />
        </motion.div>

        {/* 26. Binary Tree (Right Center) */}
        <motion.div 
          animate={{ x: [0, 20, -20, 0], y: [0, -15, 15, 0] }}
          transition={{ repeat: Infinity, duration: 31, ease: "easeInOut" }}
          className="absolute top-[35%] right-[2%] scale-80"
        >
          <BackgroundBinaryTreeWidget />
        </motion.div>

        {/* 27. HashMap (Top Left) */}
        <motion.div 
          animate={{ x: [0, -12, 12, 0], y: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 26, ease: "easeInOut" }}
          className="absolute top-[8%] left-[2%] scale-80"
        >
          <BackgroundHashMapWidget />
        </motion.div>

        {/* 28. Recursion Stack (Center Bottom) */}
        <motion.div 
          animate={{ x: [0, 15, -15, 0], y: [0, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 28, ease: "easeInOut" }}
          className="absolute top-[82%] left-[48%] scale-85"
        >
          <BackgroundRecursionStackWidget />
        </motion.div>

        {/* 29. Linked List (Lower Right) */}
        <motion.div 
          animate={{ x: [0, -20, 20, 0], y: [0, 20, -20, 0] }}
          transition={{ repeat: Infinity, duration: 29, ease: "easeInOut" }}
          className="absolute top-[78%] right-[4%] scale-80"
        >
          <BackgroundLinkedListWidget />
        </motion.div>

        {/* 30. Array (Top Right) */}
        <motion.div 
          animate={{ x: [0, 15, -15, 0], y: [0, -25, 25, 0] }}
          transition={{ repeat: Infinity, duration: 27, ease: "easeInOut" }}
          className="absolute top-[2%] right-[8%] scale-75"
        >
          <BackgroundArrayWidget />
        </motion.div>

        {/* 31. Tree (Lower Left) */}
        <motion.div 
          animate={{ x: [0, -15, 15, 0], y: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 30, ease: "easeInOut" }}
          className="absolute top-[88%] left-[2%] scale-80"
        >
          <BackgroundBinaryTreeWidget />
        </motion.div>

        {/* 32. Pointer Arrow (Mid Right) */}
        <motion.div 
          animate={{ x: [0, 20, -20, 0], y: [0, -18, 18, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
          className="absolute top-[42%] right-[16%] scale-80"
        >
          <BackgroundPointerArrowWidget />
        </motion.div>

        {/* 33. HashMap (Center) */}
        <motion.div 
          animate={{ x: [0, -18, 18, 0], y: [0, 20, -20, 0] }}
          transition={{ repeat: Infinity, duration: 28, ease: "easeInOut" }}
          className="absolute top-[50%] left-[25%] scale-80"
        >
          <BackgroundHashMapWidget />
        </motion.div>

        {/* 34. Array (Right Mid) */}
        <motion.div 
          animate={{ x: [0, 15, -15, 0], y: [0, -20, 20, 0] }}
          transition={{ repeat: Infinity, duration: 26, ease: "easeInOut" }}
          className="absolute top-[55%] right-[2%] scale-75"
        >
          <BackgroundArrayWidget />
        </motion.div>

        {/* 35. Linked List (Center Top) */}
        <motion.div 
          animate={{ x: [0, -20, 20, 0], y: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 27, ease: "easeInOut" }}
          className="absolute top-[15%] left-[48%] scale-80"
        >
          <BackgroundLinkedListWidget />
        </motion.div>

        {/* 36. Recursion Stack (Top Right) */}
        <motion.div 
          animate={{ x: [0, 18, -18, 0], y: [0, -20, 20, 0] }}
          transition={{ repeat: Infinity, duration: 29, ease: "easeInOut" }}
          className="absolute top-[12%] right-[20%] scale-80"
        >
          <BackgroundRecursionStackWidget />
        </motion.div>

        {/* 37. Pointer Arrow (Center) */}
        <motion.div 
          animate={{ x: [0, -15, 15, 0], y: [0, 18, -18, 0] }}
          transition={{ repeat: Infinity, duration: 24, ease: "easeInOut" }}
          className="absolute top-[52%] left-[8%] scale-85"
        >
          <BackgroundPointerArrowWidget />
        </motion.div>

        {/* 38. Binary Tree (Left Mid) */}
        <motion.div 
          animate={{ x: [0, 20, -20, 0], y: [0, -15, 15, 0] }}
          transition={{ repeat: Infinity, duration: 28, ease: "easeInOut" }}
          className="absolute top-[65%] left-[2%] scale-80"
        >
          <BackgroundBinaryTreeWidget />
        </motion.div>

        {/* 39. HashMap (Right Top) */}
        <motion.div 
          animate={{ x: [0, -15, 15, 0], y: [0, 20, -20, 0] }}
          transition={{ repeat: Infinity, duration: 26, ease: "easeInOut" }}
          className="absolute top-[20%] right-[4%] scale-80"
        >
          <BackgroundHashMapWidget />
        </motion.div>

        {/* 40. Array (Lower Center) */}
        <motion.div 
          animate={{ x: [0, 18, -18, 0], y: [0, -15, 15, 0] }}
          transition={{ repeat: Infinity, duration: 27, ease: "easeInOut" }}
          className="absolute top-[92%] left-[32%] scale-75"
        >
          <BackgroundArrayWidget />
        </motion.div>
      </div>

    </div>
  );
};
