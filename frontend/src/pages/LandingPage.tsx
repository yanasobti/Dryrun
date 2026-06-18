import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LandingPage.css';

// Component imports
import { DriftingAlgorithmsBackground } from '../components/background/DriftingAlgorithmsBackground';
import {
  ArraysCardVisualizer,
  TreesCardVisualizer,
  HashMapCardVisualizer,
  LinkedListsCardVisualizer,
  RecursionCardVisualizer
} from '../components/cards/VisualizerCards';
import { RoadmapStep } from '../components/roadmap/RoadmapStep';

// ==========================================
// Algorithm Steps Data for Hero Visualizer
// ==========================================

const SLIDING_WINDOW_STEPS = [
  { line: 2, left: 0, right: 0, sum: 2, ans: 0, msg: "Initialize bounds: left = 0, right = 0" },
  { line: 4, left: 0, right: 1, sum: 3, ans: 0, msg: "Expand window right: add nums[1] (1), sum is 3" },
  { line: 4, left: 0, right: 2, sum: 8, ans: 0, msg: "Expand window right: add nums[2] (5), sum is 8" },
  { line: 6, left: 1, right: 2, sum: 6, ans: 0, msg: "Sum 8 > target 7. Shrink left: subtract nums[0] (2)" },
  { line: 8, left: 1, right: 2, sum: 6, ans: 6, msg: "Update maximum answer answer = max(0, 6) = 6" },
  { line: 4, left: 1, right: 3, sum: 8, ans: 6, msg: "Expand window right: add nums[3] (2), sum is 8" },
  { line: 6, left: 2, right: 3, sum: 7, ans: 6, msg: "Sum 8 > target 7. Shrink left: subtract nums[1] (1)" },
  { line: 8, left: 2, right: 3, sum: 7, ans: 7, msg: "Target met! Update maximum answer = 7", success: true }
];

const TWO_SUM_STEPS = [
  { line: 2, i: 0, val: 2, comp: 7, map: {}, found: false, msg: "Complement target - 2 = 7. Check if 7 is in map: No" },
  { line: 8, i: 0, val: 2, comp: 7, map: { 2: 0 }, found: false, msg: "Add nums[0] (2) at index 0 to map" },
  { line: 4, i: 1, val: 7, comp: 2, map: { 2: 0 }, found: true, msg: "Complement target - 7 = 2. Check if 2 is in map: Yes!" },
  { line: 6, i: 1, val: 7, comp: 2, map: { 2: 0 }, found: true, success: true, msg: "Return matching pair: index [0, 1]" }
];

const BINARY_SEARCH_STEPS = [
  { line: 2, low: 0, high: 7, mid: -1, msg: "Set initial low = 0, high = 7" },
  { line: 4, low: 0, high: 7, mid: 3, val: 7, msg: "Calculate mid = (0 + 7) / 2 = 3 (val 7)" },
  { line: 6, low: 0, high: 7, mid: 3, val: 7, msg: "Target 13 > 7. Shrink search space: low = mid + 1" },
  { line: 6, low: 4, high: 7, mid: 3, val: 7, msg: "Low updated to 4. Left half [1..7] eliminated" },
  { line: 4, low: 4, high: 7, mid: 5, val: 11, msg: "Calculate mid = (4 + 7) / 2 = 5 (val 11)" },
  { line: 6, low: 4, high: 7, mid: 5, val: 11, msg: "Target 13 > 11. Shrink search space: low = mid + 1" },
  { line: 6, low: 6, high: 7, mid: 5, val: 11, msg: "Low updated to 6. Left half [9..11] eliminated" },
  { line: 4, low: 6, high: 7, mid: 6, val: 13, msg: "Calculate mid = (6 + 7) / 2 = 6 (val 13)" },
  { line: 5, low: 6, high: 7, mid: 6, val: 13, success: true, msg: "Match found: nums[6] == 13! Return index 6" }
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const worksContainerRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------
  // Navbar Scroll Trigger
  // ----------------------------------------
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ----------------------------------------
  // How it Works: Scroll progress
  // ----------------------------------------
  useEffect(() => {
    const handleWorksScroll = () => {
      if (!worksContainerRef.current) return;
      const rect = worksContainerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const elementHeight = rect.height;
      const start = windowHeight - rect.top; // Distance from entering viewport
      const totalDist = elementHeight + 200;
      const progress = Math.min(Math.max(start / totalDist, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleWorksScroll);
    window.addEventListener('resize', handleWorksScroll);
    return () => {
      window.removeEventListener('scroll', handleWorksScroll);
      window.removeEventListener('resize', handleWorksScroll);
    };
  }, []);

  // ----------------------------------------
  // Hero Visualizer Mode Sync
  // ----------------------------------------
  const [activeAlgo, setActiveAlgo] = useState<'sliding-window' | 'two-sum' | 'binary-search'>('sliding-window');
  const [algoStep, setAlgoStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [confidence, setConfidence] = useState(0);

  // Mode loop every 7s
  useEffect(() => {
    const modeInterval = setInterval(() => {
      setIsAnalyzing(true);
      setActiveAlgo(prev => {
        if (prev === 'sliding-window') return 'two-sum';
        if (prev === 'two-sum') return 'binary-search';
        return 'sliding-window';
      });
    }, 7000);
    return () => clearInterval(modeInterval);
  }, []);

  // Step loop & analyzing reset
  useEffect(() => {
    setAlgoStep(0);
    setConfidence(0);
    
    // Simulate analyzing pulse, then fade in results
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
      // Trigger target confidence load
      const targetConfidence = activeAlgo === 'sliding-window' ? 94 : activeAlgo === 'two-sum' ? 98 : 96;
      let start = 0;
      const interval = setInterval(() => {
        start += 5;
        if (start >= targetConfidence) {
          setConfidence(targetConfidence);
          clearInterval(interval);
        } else {
          setConfidence(start);
        }
      }, 20);
    }, 800);

    return () => clearTimeout(timer);
  }, [activeAlgo]);

  // Advance steps of active algorithm every 1.1s
  useEffect(() => {
    if (isAnalyzing) return;
    let maxSteps = 1;
    if (activeAlgo === 'sliding-window') maxSteps = SLIDING_WINDOW_STEPS.length;
    else if (activeAlgo === 'two-sum') maxSteps = TWO_SUM_STEPS.length;
    else if (activeAlgo === 'binary-search') maxSteps = BINARY_SEARCH_STEPS.length;

    const stepInterval = setInterval(() => {
      setAlgoStep(s => (s + 1) % maxSteps);
    }, 1100);

    return () => clearInterval(stepInterval);
  }, [activeAlgo, isAnalyzing]);

  // Get current active step object
  const currentStepObj = () => {
    if (activeAlgo === 'sliding-window') return SLIDING_WINDOW_STEPS[algoStep] || SLIDING_WINDOW_STEPS[0];
    if (activeAlgo === 'two-sum') return TWO_SUM_STEPS[algoStep] || TWO_SUM_STEPS[0];
    return BINARY_SEARCH_STEPS[algoStep] || BINARY_SEARCH_STEPS[0];
  };

  // ----------------------------------------
  // Pattern Coach Circular Diagram Active State
  // ----------------------------------------
  const [hoveredClue, setHoveredClue] = useState<number>(0);

  // Clues dictionary
  const COACH_CLUES = [
    {
      title: "Contiguous Subarray Range",
      clue: "At most K / shrinkable window bounds",
      complexity: "O(n) Time | O(1) Space",
      whyFits: "Expanding elements dynamic right pointer, shrinking left pointer when bounds are violated avoids secondary nested loops.",
      avoid: "Double loops checking every subsegment sequence."
    },
    {
      title: "Complement Partner Search",
      clue: "Pair summing to target value",
      complexity: "O(n) Time | O(n) Space",
      whyFits: "A dictionary tracking previously inspected values lets you immediately lookup partner items in a single scan.",
      avoid: "Sorting the array first (which increases time complexity to O(N log N))."
    },
    {
      title: "Sorted Space Halving",
      clue: "Ordered index logarithmic search",
      complexity: "O(log n) Time | O(1) Space",
      whyFits: "Sorted numbers allow narrowing possibilities. The midpoint index eliminates half of remaining items instantly.",
      avoid: "Linear scanners scanning values one-by-one."
    },
    {
      title: "Self-dependent Frames",
      clue: "Call stack recursion depth",
      complexity: "O(2^n) Time | O(n) Space",
      whyFits: "Smaller subproblem results feed back into parent functions. Call stacks track frames in strict LIFO order.",
      avoid: "Deep iterative code blocks requiring manual stacks."
    }
  ];

  // ----------------------------------------
  // Microinteraction Helpers
  // ----------------------------------------
  const handleMouseMoveMagnetic = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    btn.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    btn.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const handleMouseLeaveMagnetic = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    btn.style.transform = `translate(0px, 0px)`;
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (y / (rect.height / 2)) * -4; // Tilt max 4 degrees
    const rotateY = (x / (rect.width / 2)) * 4;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    card.style.boxShadow = `0 12px 24px rgba(79, 70, 229, 0.04), 0 4px 12px rgba(15, 23, 42, 0.03)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    card.style.boxShadow = `0 1px 3px rgba(15, 23, 42, 0.05)`;
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative overflow-x-hidden">
      
      {/* Drifting Algorithm Floating Ornaments */}
      <DriftingAlgorithmsBackground />

      {/* 1. Header Navigation Bar */}
      <header className={`fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-6 md:px-12 select-none transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-xs' 
          : 'bg-transparent border-b border-transparent'
      }`}>
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-slate-800 cursor-pointer" onClick={() => navigate('/explore')}>
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="font-cabinet text-md font-bold tracking-tight text-slate-850">
            DryRun
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <a href="#features" className="hover:text-slate-900 transition-colors">Why DryRun</a>
          <a href="#visualizers" className="hover:text-slate-900 transition-colors">Visualizations</a>
          <a href="#coach" className="hover:text-slate-900 transition-colors">Pattern Coach</a>
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
        </nav>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/explore')} 
            className="text-[11px] font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors cursor-pointer px-3 py-2"
          >
            Explore
          </button>
          <button 
            onClick={() => navigate('/explore')} 
            onMouseMove={handleMouseMoveMagnetic}
            onMouseLeave={handleMouseLeaveMagnetic}
            className="magnetic-glow bg-slate-900 hover:bg-slate-950 text-white px-4.5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="pt-24 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 justify-between relative z-10">
        
        {/* Left Side: Copy */}
        <div className="flex-1 flex flex-col gap-6 max-w-xl text-left">
          <div className="inline-flex items-center gap-2 self-start bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 text-[9px] font-bold text-indigo-655 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            Visual Algorithm Execution
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight font-cabinet">
            Watch Algorithms <br />
            <span className="bg-gradient-to-r from-indigo-500 to-indigo-700 bg-clip-text text-transparent relative">
              Think.
              <span className="absolute bottom-1 left-0 right-0 h-[3px] bg-indigo-500/20 rounded-full" />
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-500 leading-relaxed font-normal">
            DryRun isn't standard documentation. It parses real code to animate pointers, nodes, and arrays live, visualizing how solutions process data.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 select-none">
            <button 
              onClick={() => navigate('/explore')} 
              onMouseMove={handleMouseMoveMagnetic}
              onMouseLeave={handleMouseLeaveMagnetic}
              className="magnetic-glow bg-indigo-600 hover:bg-indigo-700 text-white px-5.5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs cursor-pointer transition-all"
            >
              Start Visualizing Now
              <svg className="w-3.5 h-3.5 stroke-white stroke-2 fill-none ml-0.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('how-it-works');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-5.5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs cursor-pointer transition-all"
            >
              Learn Roadmap
            </button>
          </div>

          <div className="flex items-center gap-4 border-t border-slate-100 pt-6 mt-4 select-none">
            <div className="flex -space-x-1.5">
              <span className="w-7 h-7 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[9px] font-bold">DS</span>
              <span className="w-7 h-7 rounded-full bg-indigo-100 border border-white flex items-center justify-center text-[9px] font-bold text-indigo-650">LC</span>
              <span className="w-7 h-7 rounded-full bg-sky-100 border border-white flex items-center justify-center text-[9px] font-bold text-sky-600">NC</span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase">
              Designed for visual algorithm thinkers
            </p>
          </div>
        </div>

        {/* Right Side: Unified Code + Viz Rotator Demo */}
        <div className="flex-1 w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-5 shadow-lg flex flex-col gap-4 relative select-none">
          
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            
            {/* Typing Code Editor Pane */}
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 font-mono text-[9.5px] text-slate-400 relative min-w-0">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[8px] uppercase font-bold text-slate-500 font-mono tracking-wider">Solution.cpp</span>
                <span className="text-[8.5px] text-indigo-400 font-bold bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-900/50">CPP</span>
              </div>
              
              <div className="leading-5 overflow-hidden whitespace-nowrap min-h-[160px] flex flex-col justify-center">
                {activeAlgo === 'sliding-window' && (
                  <>
                    <div className={currentStepObj().line === 1 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">1</span><span className="text-indigo-400">int</span> <span className="text-sky-300">maxSum</span>(vector&lt;<span className="text-indigo-400">int</span>&gt;&amp; arr, <span className="text-indigo-400">int</span> k) &#123;</div>
                    <div className={currentStepObj().line === 2 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">2</span>  <span className="text-indigo-400">int</span> left = <span className="text-amber-400">0</span>, sum = <span className="text-amber-400">0</span>, ans = <span className="text-amber-400">0</span>;</div>
                    <div className={currentStepObj().line === 3 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">3</span>  <span className="text-indigo-400">for</span> (<span className="text-indigo-400">int</span> right = <span className="text-amber-400">0</span>; right &lt; n; right++) &#123;</div>
                    <div className={currentStepObj().line === 4 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">4</span>    sum += arr[right];</div>
                    <div className={currentStepObj().line === 5 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">5</span>    <span className="text-indigo-400">while</span> (sum &gt; k) &#123;</div>
                    <div className={currentStepObj().line === 6 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">6</span>      sum -= arr[left++];</div>
                    <div className={currentStepObj().line === 7 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">7</span>    &#125;</div>
                    <div className={currentStepObj().line === 8 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">8</span>    ans = max(ans, sum);</div>
                    <div className={currentStepObj().line === 9 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">9</span>  &#125;</div>
                    <div className={currentStepObj().line === 10 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">10</span>  <span className="text-indigo-400">return</span> ans;</div>
                    <div><span className="text-slate-600 pr-2">11</span>&#125;</div>
                  </>
                )}
                {activeAlgo === 'two-sum' && (
                  <>
                    <div className={currentStepObj().line === 1 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">1</span>vector&lt;<span className="text-indigo-400">int</span>&gt; <span className="text-sky-300">twoSum</span>(vector&lt;<span className="text-indigo-400">int</span>&gt;&amp; nums, <span className="text-indigo-400">int</span> target) &#123;</div>
                    <div className={currentStepObj().line === 2 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">2</span>  unordered_map&lt;<span className="text-indigo-400">int</span>, <span className="text-indigo-400">int</span>&gt; map;</div>
                    <div className={currentStepObj().line === 3 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">3</span>  <span className="text-indigo-400">for</span> (<span className="text-indigo-400">int</span> i = <span className="text-amber-400">0</span>; i &lt; nums.size(); i++) &#123;</div>
                    <div className={currentStepObj().line === 4 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">4</span>    <span className="text-indigo-400">int</span> complement = target - nums[i];</div>
                    <div className={currentStepObj().line === 5 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">5</span>    <span className="text-indigo-400">if</span> (map.count(complement)) &#123;</div>
                    <div className={currentStepObj().line === 6 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">6</span>      <span className="text-indigo-400">return</span> &#123;map[complement], i&#125;;</div>
                    <div className={currentStepObj().line === 7 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">7</span>    &#125;</div>
                    <div className={currentStepObj().line === 8 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">8</span>    map[nums[i]] = i;</div>
                    <div className={currentStepObj().line === 9 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">9</span>  &#125;</div>
                    <div className={currentStepObj().line === 10 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">10</span>  <span className="text-indigo-400">return</span> &#123;&#125;;</div>
                    <div><span className="text-slate-600 pr-2">11</span>&#125;</div>
                  </>
                )}
                {activeAlgo === 'binary-search' && (
                  <>
                    <div className={currentStepObj().line === 1 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">1</span><span className="text-indigo-400">int</span> <span className="text-sky-300">binarySearch</span>(vector&lt;<span className="text-indigo-400">int</span>&gt;&amp; nums, <span className="text-indigo-400">int</span> target) &#123;</div>
                    <div className={currentStepObj().line === 2 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">2</span>  <span className="text-indigo-400">int</span> low = <span className="text-amber-400">0</span>, high = nums.size() - <span className="text-amber-400">1</span>;</div>
                    <div className={currentStepObj().line === 3 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">3</span>  <span className="text-indigo-400">while</span> (low &lt;= high) &#123;</div>
                    <div className={currentStepObj().line === 4 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">4</span>    <span className="text-indigo-400">int</span> mid = low + (high - low) / <span className="text-amber-400">2</span>;</div>
                    <div className={currentStepObj().line === 5 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">5</span>    <span className="text-indigo-400">if</span> (nums[mid] == target) <span className="text-indigo-400">return</span> mid;</div>
                    <div className={currentStepObj().line === 6 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">6</span>    <span className="text-indigo-400">else</span> <span className="text-indigo-400">if</span> (nums[mid] &lt; target) low = mid + <span className="text-amber-400">1</span>;</div>
                    <div className={currentStepObj().line === 7 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">7</span>    <span className="text-indigo-400">else</span> high = mid - <span className="text-amber-400">1</span>;</div>
                    <div className={currentStepObj().line === 8 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">8</span>  &#125;</div>
                    <div className={currentStepObj().line === 9 ? 'bg-indigo-900/30 text-white font-semibold' : ''}><span className="text-slate-600 pr-2">9</span>  <span className="text-indigo-400">return</span> -<span className="text-amber-400">1</span>;</div>
                    <div><span className="text-slate-600 pr-2">10</span>&#125;</div>
                  </>
                )}
              </div>
            </div>

            {/* Pattern Card (Sits on the Right) */}
            <div className="w-full md:w-52 flex flex-col gap-3 shrink-0">
              
              {/* Pattern box with confidence loader */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2.5 shadow-inner min-h-[110px] justify-between">
                <div>
                  <span className="text-[8px] uppercase font-bold text-slate-400 font-mono tracking-wider">Pattern Detected</span>
                  
                  {isAnalyzing ? (
                    <div className="mt-2 flex flex-col gap-2">
                      <div className="w-24 h-4 rounded skeleton-pulse" />
                      <div className="w-16 h-3 rounded skeleton-pulse" />
                    </div>
                  ) : (
                    <div className="mt-1.5 flex flex-col">
                      <span className="font-extrabold text-[12px] text-slate-800 tracking-tight font-satoshi-premium">
                        {activeAlgo === 'sliding-window' ? 'Sliding Window' : activeAlgo === 'two-sum' ? 'HashMap Lookup' : 'Binary Search'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold font-mono">
                        {confidence}% Confidence
                      </span>
                    </div>
                  )}
                </div>

                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${confidence}%` }}
                    transition={{ duration: 0.4 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-650 rounded-full" 
                  />
                </div>
              </div>

              {/* Time/Space Complexity Status */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2 shadow-inner">
                <span className="text-[8px] uppercase font-bold text-slate-400 font-mono tracking-wider">Complexity Details</span>
                <div className="flex flex-col gap-2 mt-1 select-none">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-slate-400 font-bold">Time</span>
                    <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      {activeAlgo === 'sliding-window' ? 'O(n)' : activeAlgo === 'two-sum' ? 'O(n)' : 'O(log n)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-slate-400 font-bold">Space</span>
                    <span className="font-mono font-bold text-indigo-650 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                      {activeAlgo === 'sliding-window' ? 'O(1)' : activeAlgo === 'two-sum' ? 'O(n)' : 'O(1)'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Live Dynamic Visualizer Canvas */}
          <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-4 flex flex-col gap-3 min-h-[170px] justify-between">
            <div className="flex justify-between items-center">
              <span className="text-[8px] uppercase font-bold text-slate-450 font-mono tracking-wider">Visual Workspace</span>
              <span className="text-[9.5px] font-semibold text-slate-500 max-w-[280px] text-right truncate">
                {currentStepObj()?.msg}
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center py-4 bg-white rounded-xl border border-slate-100 relative overflow-hidden">
              
              {/* SKELETON LOADER STATE */}
              {isAnalyzing ? (
                <div className="flex flex-col items-center gap-3 w-full px-8">
                  <div className="flex gap-2.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="w-8 h-8 rounded-lg skeleton-pulse" />
                    ))}
                  </div>
                  <div className="w-1/2 h-2 rounded skeleton-pulse" />
                </div>
              ) : (
                <>
                  {/* 1. SLIDING WINDOW CANVAS */}
                  {activeAlgo === 'sliding-window' && (
                    <div className="flex flex-col items-center w-full">
                      {/* Indices */}
                      <div className="flex gap-2 mb-1 text-[8px] font-bold font-mono text-slate-300">
                        {[2, 1, 5, 2, 8].map((_, idx) => (
                          <span key={idx} className="w-8 text-center">{idx}</span>
                        ))}
                      </div>

                      {/* Array cells row */}
                      <div className="flex gap-2 relative z-10">
                        {[2, 1, 5, 2, 8].map((val, idx) => {
                          const stepObj = currentStepObj() as any;
                          const isInWindow = idx >= stepObj.left && idx <= stepObj.right;
                          return (
                            <div
                              key={idx}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold border transition-all duration-300 ${
                                isInWindow
                                  ? stepObj.success 
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-655 scale-105 shadow-sm'
                                    : 'bg-indigo-50 border-indigo-500 text-indigo-650 scale-105 shadow-sm'
                                  : 'bg-white border-slate-150 text-slate-400'
                              }`}
                            >
                              {val}
                            </div>
                          );
                        })}
                      </div>

                      {/* Custom Pointers */}
                      <div className="w-full max-w-[190px] h-6 mt-2 relative z-10 font-mono text-[8px] text-indigo-650 font-bold">
                        {/* Left Pointer */}
                        <div 
                          className="absolute flex flex-col items-center transition-all duration-300"
                          style={{ left: `${(currentStepObj() as any).left * 40 + 6}px` }}
                        >
                          <span>↑</span>
                          <span>L</span>
                        </div>
                        {/* Right Pointer */}
                        <div 
                          className="absolute flex flex-col items-center transition-all duration-300"
                          style={{ left: `${(currentStepObj() as any).right * 40 + 6}px` }}
                        >
                          <span>↑</span>
                          <span>R</span>
                        </div>
                      </div>

                      {/* Metrics Overlay */}
                      <div className="absolute right-4 top-2 text-[9px] font-semibold text-slate-450 flex flex-col gap-0.5 text-right">
                        <div>Sum: <span className="font-mono font-bold text-slate-800 bg-slate-50 px-1 py-0.25 rounded border border-slate-100">{(currentStepObj() as any).sum}</span></div>
                        <div>Max Ans: <span className="font-mono font-bold text-indigo-650 bg-indigo-50 px-1 py-0.25 rounded border border-indigo-100">{(currentStepObj() as any).ans}</span></div>
                      </div>
                    </div>
                  )}

                  {/* 2. TWO SUM CANVAS */}
                  {activeAlgo === 'two-sum' && (
                    <div className="flex flex-col items-center w-full px-6 gap-3">
                      {/* Array elements visual */}
                      <div className="flex gap-2">
                        {[2, 7, 11, 15].map((val, idx) => {
                          const stepObj = currentStepObj() as any;
                          const isActive = idx === stepObj.i;
                          const isMatch = stepObj.success && (idx === 0 || idx === 1);
                          return (
                            <div
                              key={idx}
                              className={`w-9 h-8 rounded-lg flex flex-col items-center justify-center font-mono text-xs font-bold border transition-all duration-300 ${
                                isMatch 
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-655 scale-105 shadow-sm'
                                  : isActive
                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-655 scale-105 shadow-sm'
                                    : 'bg-white border-slate-150 text-slate-400'
                              }`}
                            >
                              <span className="text-[10px]">{val}</span>
                              <span className="text-[6.5px] text-slate-350">idx:{idx}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* HashMap visualizer bucket */}
                      <div className="flex flex-col bg-slate-50 border border-slate-150 rounded-lg p-2.5 w-full max-w-[220px]">
                        <span className="text-[7.5px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-1">HashMap Slots</span>
                        <div className="flex flex-col gap-1 min-h-[45px] justify-center">
                          {Object.keys((currentStepObj() as any).map).length === 0 ? (
                            <span className="text-[8.5px] text-slate-400 italic text-center font-mono py-1">empty map (0 keys)</span>
                          ) : (
                            Object.entries((currentStepObj() as any).map).map(([k, v]) => (
                              <div key={k} className="flex justify-between items-center text-[9px] font-mono bg-white border border-slate-100 rounded px-2 py-0.5">
                                <span className="text-slate-400 font-bold">Key {k}</span>
                                <span className="text-slate-300">➔</span>
                                <span className="text-indigo-600 font-extrabold">Index {v as number}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. BINARY SEARCH CANVAS */}
                  {activeAlgo === 'binary-search' && (
                    <div className="flex flex-col items-center w-full px-4">
                      {/* Array elements row */}
                      <div className="flex gap-1.5 relative z-10 scale-95">
                        {[1, 3, 5, 7, 9, 11, 13, 15].map((val, idx) => {
                          const stepObj = currentStepObj() as any;
                          const isEliminated = idx < stepObj.low || idx > stepObj.high;
                          const isMid = idx === stepObj.mid;
                          const isMatch = stepObj.success && isMid;
                          
                          return (
                            <div
                              key={idx}
                              className={`w-7.5 h-8 rounded-lg flex flex-col items-center justify-center font-mono text-[10.5px] font-bold border transition-all duration-300 ${
                                isMatch 
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-655 scale-105 shadow-sm'
                                  : isMid
                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-650 scale-105 shadow-sm'
                                    : isEliminated
                                      ? 'bg-slate-100/50 border-slate-150 text-slate-300 opacity-35'
                                      : 'bg-white border-slate-150 text-slate-655'
                              }`}
                            >
                              <span>{val}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Custom Pointers (Low, High, Mid) */}
                      <div className="w-full max-w-[260px] h-6 mt-2 relative z-10 font-mono text-[8px] font-bold">
                        {/* Low pointer */}
                        <div 
                          className="absolute flex flex-col items-center transition-all duration-300 text-slate-500"
                          style={{ left: `${(currentStepObj() as any).low * 31.5 + 4}px` }}
                        >
                          <span>↑</span>
                          <span>L</span>
                        </div>
                        {/* High pointer */}
                        <div 
                          className="absolute flex flex-col items-center transition-all duration-300 text-slate-500"
                          style={{ left: `${(currentStepObj() as any).high * 31.5 + 4}px` }}
                        >
                          <span>↑</span>
                          <span>H</span>
                        </div>
                        {/* Mid pointer */}
                        {(currentStepObj() as any).mid !== -1 && (
                          <div 
                            className="absolute flex flex-col items-center transition-all duration-300 text-indigo-600"
                            style={{ left: `${(currentStepObj() as any).mid * 31.5 + 4}px` }}
                          >
                            <span>↑</span>
                            <span>M</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Simulated debugger timeline tracker */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10.5px] select-none gap-3 text-slate-400">
              <span className="font-semibold uppercase font-mono tracking-wider text-[8px]">Debugger Timeline</span>
              <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${isAnalyzing ? 0 : ((algoStep + 1) / (activeAlgo === 'sliding-window' ? SLIDING_WINDOW_STEPS.length : activeAlgo === 'two-sum' ? TWO_SUM_STEPS.length : BINARY_SEARCH_STEPS.length)) * 100}%` }}
                />
              </div>
              <span className="font-mono font-bold whitespace-nowrap">
                Step {isAnalyzing ? '...' : algoStep + 1} / {activeAlgo === 'sliding-window' ? SLIDING_WINDOW_STEPS.length : activeAlgo === 'two-sum' ? TWO_SUM_STEPS.length : BINARY_SEARCH_STEPS.length}
              </span>
            </div>

          </div>
        </div>

      </main>

      {/* 3. Why DryRun Exists Section */}
      <section id="features" className="py-20 border-t border-slate-200/50 select-none relative z-10 bg-transparent">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="relative flex items-center justify-center mb-16">
            <div className="absolute left-0 right-0 h-px bg-slate-200/60" />
            <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400 bg-white px-6 relative z-10 font-cabinet">
              Why DryRun Exists
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 md:gap-4">
            
            {/* The Traditional Way */}
            <div 
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="tilt-card flex-1 bg-white border border-slate-200 rounded-3xl p-8 flex flex-col gap-4 text-center items-center shadow-xs"
            >
              <span className="text-[9px] font-bold text-rose-500 bg-rose-50 border border-rose-100/50 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                The Traditional Way
              </span>
              
              <h3 className="text-lg font-bold text-slate-800 font-satoshi-premium mt-2">Frustrated Scanning</h3>
              <p className="text-xs text-slate-450 leading-relaxed font-semibold max-w-[280px]">
                Tracing array boundaries on notebooks, struggling with recursive call trees in your head, and debugging static lines of text.
              </p>
              
              <div className="flex items-center gap-1.5 mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                <span>Read Text</span>
                <span>⋯</span>
                <span>Draw Nodes</span>
                <span>⋯</span>
                <span>Get Lost</span>
              </div>
            </div>

            {/* VS Circle */}
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-inner self-center z-10">
              VS
            </div>

            {/* The DryRun Way */}
            <div 
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="tilt-card flex-1 bg-white border border-indigo-200 rounded-3xl p-8 flex flex-col gap-4 text-center items-center shadow-xs relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-3 py-1 rounded-full uppercase tracking-wider font-mono relative z-10">
                The DryRun Way
              </span>
              
              <h3 className="text-lg font-bold text-indigo-650 font-satoshi-premium mt-2">Visual Instancy</h3>
              <p className="text-xs text-slate-450 leading-relaxed font-semibold max-w-[280px]">
                Paste your solution code, instantly identify algorithm patterns, and watch indices, maps, and pointers step visually across canvases.
              </p>

              <div className="flex items-center gap-1.5 mt-4 text-[9px] font-bold text-indigo-650 uppercase tracking-tight">
                <span>Paste Code</span>
                <span className="text-indigo-200">⋯</span>
                <span>Pattern Match</span>
                <span className="text-indigo-200">⋯</span>
                <span className="text-indigo-700">See It Think</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Learn Through Visualizations (Live Mini-Visualizations) */}
      <section id="visualizers" className="py-20 border-t border-slate-200/50 select-none relative z-10 bg-transparent">
        <div className="max-w-6xl mx-auto px-6 text-center">
          
          <div className="flex flex-col items-center gap-2 mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-cabinet">
              Learn Through Visualizations
            </h2>
            <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">
              No generic cards. Click or hover these real mini structures behavior simulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* 1. Arrays Card (Bouncing pointer) */}
            <ArraysCardVisualizer onCardMouseMove={handleCardMouseMove} onCardMouseLeave={handleCardMouseLeave} />

            {/* 2. Trees Card (DFS node traversal path) */}
            <TreesCardVisualizer onCardMouseMove={handleCardMouseMove} onCardMouseLeave={handleCardMouseLeave} />

            {/* 3. HashMap Card (Key-value inserting values) */}
            <HashMapCardVisualizer onCardMouseMove={handleCardMouseMove} onCardMouseLeave={handleCardMouseLeave} />

            {/* 4. Linked List Card (Traversal pointer sliding) */}
            <LinkedListsCardVisualizer onCardMouseMove={handleCardMouseMove} onCardMouseLeave={handleCardMouseLeave} />

            {/* 5. Recursion Card (Call stack push & pop) */}
            <RecursionCardVisualizer onCardMouseMove={handleCardMouseMove} onCardMouseLeave={handleCardMouseLeave} />

          </div>
        </div>
      </section>

      {/* 5. Pattern Coach Section */}
      <section id="coach" className="py-25 border-t border-slate-200/50 select-none relative z-10 bg-transparent">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            
            {/* Orbiting concentric rings */}
            <div className="flex-1 flex items-center justify-center relative min-h-[350px]">
              <div className="absolute inset-0 bg-indigo-100/20 rounded-full blur-3xl -z-10" />
              
              <div className="w-80 h-80 border border-slate-200/60 rounded-full flex items-center justify-center relative select-none">
                
                {/* Concentric rotating lines */}
                <div className="absolute w-72 h-72 border border-slate-200/50 rounded-full animate-orbit-cw opacity-30" />
                <div className="absolute w-56 h-56 border border-dashed border-indigo-150 rounded-full animate-orbit-ccw opacity-50" />
                <div className="absolute w-40 h-40 border border-indigo-200/50 rounded-full opacity-65" />
                
                {/* Center Core */}
                <div className="w-24 h-24 rounded-full bg-white border border-indigo-200 flex flex-col items-center justify-center shadow-lg relative z-10">
                  <span className="font-cabinet text-xs font-bold text-indigo-650 tracking-tight leading-none">Pattern</span>
                  <span className="font-mono text-[8.5px] font-bold text-slate-400 mt-1 uppercase">Coach</span>
                </div>

                {/* Concentric clues labels around circles */}
                
                {/* Clue 0 */}
                <motion.div 
                  onClick={() => setHoveredClue(0)}
                  onMouseEnter={() => setHoveredClue(0)}
                  className={`absolute top-4 left-1/2 -translate-x-1/2 cursor-pointer z-20 px-2.5 py-1 rounded-full border text-[9.5px] font-bold font-mono transition-all duration-300 shadow-xs ${
                    hoveredClue === 0 
                      ? 'bg-indigo-600 border-indigo-600 text-white scale-105' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-400'
                  }`}
                >
                  Contiguous subarray bounds
                </motion.div>

                {/* Clue 1 */}
                <motion.div 
                  onClick={() => setHoveredClue(1)}
                  onMouseEnter={() => setHoveredClue(1)}
                  className={`absolute right-0 top-1/3 cursor-pointer z-20 px-2.5 py-1 rounded-full border text-[9.5px] font-bold font-mono transition-all duration-300 shadow-xs ${
                    hoveredClue === 1 
                      ? 'bg-indigo-600 border-indigo-600 text-white scale-105' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-400'
                  }`}
                >
                  Pair sum complement
                </motion.div>

                {/* Clue 2 */}
                <motion.div 
                  onClick={() => setHoveredClue(2)}
                  onMouseEnter={() => setHoveredClue(2)}
                  className={`absolute bottom-4 left-1/2 -translate-x-1/2 cursor-pointer z-20 px-2.5 py-1 rounded-full border text-[9.5px] font-bold font-mono transition-all duration-300 shadow-xs ${
                    hoveredClue === 2 
                      ? 'bg-indigo-600 border-indigo-600 text-white scale-105' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-400'
                  }`}
                >
                  Sorted search space
                </motion.div>

                {/* Clue 3 */}
                <motion.div 
                  onClick={() => setHoveredClue(3)}
                  onMouseEnter={() => setHoveredClue(3)}
                  className={`absolute left-0 top-1/3 cursor-pointer z-20 px-2.5 py-1 rounded-full border text-[9.5px] font-bold font-mono transition-all duration-300 shadow-xs ${
                    hoveredClue === 3 
                      ? 'bg-indigo-600 border-indigo-600 text-white scale-105' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-400'
                  }`}
                >
                  Call stack base case
                </motion.div>

                {/* Mini orbiting complexity label node */}
                <div className="absolute top-[80px] right-[40px] w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-mono text-[7.5px] font-bold shadow-xs">
                  O(N)
                </div>
                <div className="absolute bottom-[80px] left-[40px] w-8 h-6 rounded-full bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center font-mono text-[7.5px] font-bold shadow-xs">
                  O(logN)
                </div>
              </div>
            </div>

            {/* Pattern Coach Content Details */}
            <div className="flex-1 flex flex-col gap-6 text-left">
              <div>
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-0.5 uppercase tracking-wider font-mono">
                  Analysis Explanation
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-cabinet mt-2">
                  Pattern Coach Insights
                </h2>
                <p className="text-xs text-slate-450 font-bold uppercase mt-1 tracking-wider">
                  Hover clues on the orbit to understand algorithm selections.
                </p>
              </div>

              {/* Explanatory pane */}
              <div className="explanation-card bg-white border border-indigo-200 rounded-3xl p-6 shadow-xs min-h-[190px] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                    <span className="font-extrabold text-sm text-slate-800 font-satoshi-premium">
                      {COACH_CLUES[hoveredClue].title}
                    </span>
                    <span className="font-mono text-[8.5px] font-extrabold text-indigo-650 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                      {COACH_CLUES[hoveredClue].complexity}
                    </span>
                  </div>
                  <p className="text-[11.5px] font-semibold text-slate-500 font-mono tracking-tight leading-relaxed mb-3">
                    Clue spotted: "{COACH_CLUES[hoveredClue].clue}"
                  </p>
                  <p className="text-[11.5px] text-slate-500 leading-relaxed font-normal">
                    {COACH_CLUES[hoveredClue].whyFits}
                  </p>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 text-[10.5px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <span className="text-rose-500 font-bold">Avoid:</span>
                  <span>{COACH_CLUES[hoveredClue].avoid}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. How DryRun Works (Scroll Timeline Guide) */}
      <section id="how-it-works" ref={worksContainerRef} className="py-20 border-t border-slate-200/50 select-none relative z-10 bg-transparent">
        <div className="max-w-5xl mx-auto px-6">
          
          <div className="text-center mb-20 flex flex-col items-center gap-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-cabinet">
              How DryRun Works
            </h2>
            <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">
              Scroll roadmap representation of our visual execution engine
            </p>
          </div>

          <div className="relative flex flex-col gap-16 md:gap-24">
            
            {/* Scroll-Linked Filled Connection Line */}
            <div className="roadmap-line-container">
              <div 
                className="roadmap-line-fill" 
                style={{ height: `${scrollProgress * 100}%` }}
              />
            </div>

            {/* Step 1 */}
            <RoadmapStep 
              num={1}
              active={scrollProgress > 0.15}
              title="Paste Solution Code"
              desc="Drop any Java/C++ solution snippet in our workspace editor. Our engine compiles it in real-time."
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
              }
            />

            {/* Step 2 */}
            <RoadmapStep 
              num={2}
              active={scrollProgress > 0.4}
              title="Static Data Analysis"
              desc="DryRun identifies the variable states, loop iterations, conditional checkpoints, and array bounds."
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              }
            />

            {/* Step 3 */}
            <RoadmapStep 
              num={3}
              active={scrollProgress > 0.65}
              title="Map To Visual Nodes"
              desc="Values are mapped to dynamic UI components: pointers become labels, arrays become cells, tree links grow."
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              }
            />

            {/* Step 4 */}
            <RoadmapStep 
              num={4}
              active={scrollProgress > 0.88}
              title="Step & Debug Visuals"
              desc="Trace pointer jumps on variable states change, see loops move, stack frames pop, and grasp code deeply."
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              }
            />

          </div>
        </div>
      </section>

      {/* 7. Bottom CTA Banner */}
      <section className="py-20 border-t border-slate-200/50 select-none text-center relative z-10 bg-transparent">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between text-left gap-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-50/20 blur-3xl rounded-full -z-10" />
            
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">
                Forget static documentations.
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-none font-cabinet">
                Watch algorithms <span className="text-indigo-650">think.</span>
              </h2>
            </div>

            <button 
              onClick={() => navigate('/explore')} 
              onMouseMove={handleMouseMoveMagnetic}
              onMouseLeave={handleMouseLeaveMagnetic}
              className="magnetic-glow bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer transition-all whitespace-nowrap"
            >
              Get Started Free
              <svg className="w-3.5 h-3.5 stroke-white stroke-2 fill-none ml-1 animate-pulse" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-6 text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">
            <span>No sign-up</span>
            <span>·</span>
            <span>Open Dataset</span>
            <span>·</span>
            <span>Interactive sandbox</span>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-slate-200 bg-transparent py-12 px-6 md:px-12 select-none relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-slate-800">
            <div className="w-6 h-6 rounded-md bg-indigo-650 flex items-center justify-center text-white text-[10px] font-bold">
              D
            </div>
            <span className="font-cabinet text-xs tracking-tight text-slate-700">DryRun</span>
          </div>
          
          <nav className="flex flex-wrap justify-center items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <a href="#features" className="hover:text-slate-800">Why DryRun</a>
            <a href="#visualizers" className="hover:text-slate-800">Visualizations</a>
            <a href="#coach" className="hover:text-slate-800">Pattern Coach</a>
            <a href="#how-it-works" className="hover:text-slate-800">How It Works</a>
          </nav>
        </div>
      </footer>

    </div>
  );
};
