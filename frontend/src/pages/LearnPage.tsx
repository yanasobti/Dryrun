import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';

// Custom components
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { VisualizerContainer } from '../components/visualizers/VisualizerContainer';
import { ArrayVisualizer } from '../components/visualizers/ArrayVisualizer';
import { LinkedListVisualizer } from '../components/visualizers/LinkedListVisualizer';
import { TreeVisualizer } from '../components/visualizers/TreeVisualizer';
import { HashMapVisualizer } from '../components/visualizers/HashMapVisualizer';
import { HashSetVisualizer } from '../components/visualizers/HashSetVisualizer';
import { RecursionVisualizer } from '../components/visualizers/RecursionVisualizer';

// Hook & Service & DBs
import { useVisualizerState } from '../hooks/useVisualizerState';
import { getVisualEvents } from '../utils/visualEvent';
import { NEETCODE_150 } from '../data/neetcode150';
import { QUESTION_DATA_DB } from '../data/questions';
import { getDifficultyStyle } from './ExplorePage';
import {
  cleanJdbIds,
  parseMethods,
  generateBSTConstruction,
  generateListConstruction,
  cleanValRep,
  getEnclosingClassForMethod
} from '../utils/jdbUtils';
import type { MethodInfo } from '../types';

import './LearnPage.css';

import { SetupSimulationModal } from '../components/workspace/SetupSimulationModal';
import { TimelineController } from '../components/workspace/TimelineController';
import { WorkspaceToolbar } from '../components/workspace/WorkspaceToolbar';



export const LearnPage: React.FC = () => {
  const navigate = useNavigate();
  const { questionId } = useParams<{ questionId?: string }>();

  const preset = useMemo(() => {
    return NEETCODE_150.find(q => q.id === questionId);
  }, [questionId]);

  const questionDetails = useMemo(() => {
    if (preset && preset.starterCodeId) {
      return QUESTION_DATA_DB[preset.starterCodeId];
    }
    return null;
  }, [preset]);



  // Sidebar visibility state (starts closed in visualization workstation)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Core Editor & Trace State
  const [code, setCode] = useState(() => {
    if (questionDetails) return questionDetails.code;
    return `public class Solution {
    public void myAlgorithm() {
        // Write or paste your custom Java code here
    }
}`;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState("Tutor System initialized. Press 'Simulate DryRun' to begin visual learning.");
  const [isError, setIsError] = useState(false);

  // Playback Control States
  const [frames, setFrames] = useState<any[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<0.5 | 1 | 1.5 | 2>(0.5);

  // Tutor mode step-by-step overlays (Event Importance Engine)
  const [tutorMode, setTutorMode] = useState(true);
  const [showExplanationModal, setShowExplanationModal] = useState(true);
  const isAnimatingRef = useRef(false);

  const handleContinueStep = () => {
    if (isAnimatingRef.current) return;

    if (currentFrameIndex < frames.length - 1) {
      setShowExplanationModal(false);
      isAnimatingRef.current = true;

      // Animate intermediate steps (TRIVIAL / IMPORTANT) until we hit the next CRITICAL one
      const nextStep = (index: number) => {
        if (index >= frames.length) {
          isAnimatingRef.current = false;
          return;
        }

        setCurrentFrameIndex(index);
        const frame = frames[index];

        if (frame?.explanation?.importance === 'CRITICAL') {
          setTimeout(() => {
            setShowExplanationModal(true);
            isAnimatingRef.current = false;
          }, 600);
          return;
        }

        setTimeout(() => {
          nextStep(index + 1);
        }, 800);
      };

      nextStep(currentFrameIndex + 1);
    } else {
      setShowExplanationModal(false);
    }
  };

  useEffect(() => {
    if (!isAnimatingRef.current) {
      const frame = frames[currentFrameIndex];
      if (frame?.explanation?.importance === 'CRITICAL') {
        setShowExplanationModal(true);
      } else {
        setShowExplanationModal(false);
      }
    }
  }, [currentFrameIndex, frames]);

  // Navigation / Custom Inputs Panel
  const [detectedMethods, setDetectedMethods] = useState<MethodInfo[]>([]);
  const [selectedMethodIdx, setSelectedMethodIdx] = useState(0);
  const [paramInputs, setParamInputs] = useState<Record<string, string>>({});
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [stdinInput, setStdinInput] = useState<string>("");

  // Refs for Editor line decoration highlights
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<any>([]);
  const lineShiftRef = useRef<number>(0);

  // Sync state with questionId / preset changes
  useEffect(() => {
    if (preset && questionDetails) {
      setCode(questionDetails.code);
      setParamInputs(questionDetails.inputs);
    } else {
      setCode(`public class Solution {
    public void myAlgorithm() {
        // Write or paste your custom Java code here
    }
}`);
      setParamInputs({});
    }
    setStdinInput("");
    setFrames([]);
    setIsPlaying(false);
    setCurrentFrameIndex(0);
    setIsError(false);
  }, [questionId, preset, questionDetails]);

  // Hook mappings
  const activeFrame = frames[currentFrameIndex];
  const visualizerState = useVisualizerState(frames, currentFrameIndex);




  


  // Sync editor highlights with active trace frames
  useEffect(() => {
    if (editorRef.current && monacoRef.current && frames.length > 0) {
      let line = frames[currentFrameIndex]?.line;
      if (line) {
        // Adjust for compilation wrapper line shift
        line = Math.max(1, line - lineShiftRef.current);
        decorationsRef.current = editorRef.current.deltaDecorations(
          decorationsRef.current,
          [
            {
              range: new monacoRef.current.Range(line, 1, line, 1),
              options: {
                isWholeLine: true,
                className: 'pencilLineHighlight'
              }
            }
          ]
        );
        // Scroll the editor viewport dynamically
        editorRef.current.revealLineInCenter(line);
      }
    }
  }, [currentFrameIndex, frames]);

  // Auto playback timeline timeline timer loop
  useEffect(() => {
    if (!isPlaying) return;

    // If Tutor Mode is enabled AND the current frame is CRITICAL, pause autoplay
    if (tutorMode && frames[currentFrameIndex]?.explanation?.importance === 'CRITICAL') {
      setIsPlaying(false);
      setShowExplanationModal(true);
      return;
    }

    const intervalTime = 1500 / speed;
    const timer = setInterval(() => {
      setCurrentFrameIndex((prev) => {
        if (prev >= frames.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isPlaying, frames, speed, tutorMode, currentFrameIndex]);

  // Auto scroll/focus on the active visualization element
  useEffect(() => {
    if (frames.length === 0 || !activeFrame) return;
    const timer = setTimeout(() => {
      const rightPanel = document.getElementById('visualizer-right-panel');
      if (!rightPanel) return;

      const code = activeFrame.code || "";
      
      // Identify active variables mentioned in the current code statement
      const potentialVars = ['curr', 'slow', 'fast', 'prev', 'head', 'temp', 'nexttemp', 'node', 'root', 'left', 'right', 'mid', 'low', 'high', 'i', 'j'];
      let activeVar = "";
      
      for (const v of potentialVars) {
        const regex = new RegExp(`\\b${v}\\b`);
        if (regex.test(code)) {
          activeVar = v;
          break;
        }
      }

      // 1. Try to find a pointer tag matching the active variable name
      if (activeVar) {
        const matchedTag = rightPanel.querySelector(`.pointer-tag-${activeVar.toLowerCase()}`);
        if (matchedTag) {
          matchedTag.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
          return;
        }
      }

      // 2. Fallback: Scroll to any highlighted active cell, entry, or node
      const activeElementsSelectors = [
        '[id^="array-cell-"].border-amber-500', // Active array cell
        '[id^="node-"] div[class*="border-indigo-500"]', // Active linkedlist node
        'circle[stroke="#0ea5e9"]', // Active tree node outer ring
        'div[class*="border-indigo-500"][class*="ring-"]', // Active map entries inserting
        'div[class*="border-amber-400"][class*="ring-"]', // Active map entries searching
        'div[class*="border-emerald-500"][class*="ring-"]' // Active map entries matched
      ];

      for (const selector of activeElementsSelectors) {
        const el = rightPanel.querySelector(selector);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
          break;
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [currentFrameIndex, frames, activeFrame]);

  const handleSelectPreset = (presetId: string) => {
    if (presetId) {
      navigate(`/learn/${presetId}`);
    } else {
      navigate('/learn');
    }
  };

  // Check code for main or custom parameters before running compiler
  const handleVerifyCode = () => {
    const cleanCode = code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '');

    const hasMain = /\bpublic\s+static\s+void\s+main\b/.test(cleanCode) || /\bstatic\s+void\s+main\b/.test(cleanCode);

    if (hasMain) {
      lineShiftRef.current = 0;
      executeVisualization(code);
      return;
    }

    const methods = parseMethods(code);
    if (methods.length === 0) {
      lineShiftRef.current = 0;
      executeVisualization(code);
      return;
    }

    setDetectedMethods(methods);
    setSelectedMethodIdx(0);

    // Form parameter input initial states
    const initialInputs: Record<string, string> = {};
    methods[0].params.forEach(p => {
      const typeLower = p.type.toLowerCase();
      if (typeLower.includes('tree')) {
        initialInputs[p.name] = "3, 9, 20, null, null, 15, 7";
      } else if (typeLower.includes('list') || typeLower.includes('node')) {
        initialInputs[p.name] = "3, 2, 0, -4";
      } else if (typeLower.includes('prices')) {
        initialInputs[p.name] = "7, 1, 5, 3, 6, 4";
      } else if (typeLower.includes('nums')) {
        initialInputs[p.name] = "2, 7, 11, 15";
      } else if (typeLower === 'int' || typeLower === 'double' || typeLower === 'float' || typeLower === 'long') {
        initialInputs[p.name] = "9";
      } else {
        initialInputs[p.name] = "0";
      }
    });
    setParamInputs(initialInputs);
    setShowPromptModal(true);
  };

  const handleStartSimulation = () => {
    setShowPromptModal(false);
    const method = detectedMethods[selectedMethodIdx];
    
    let wrappedCode = code;
    // Strip public class flags to prevent compile name mismatch
    wrappedCode = wrappedCode.replace(/\bpublic\s+class\b/g, 'class');

    let bstOrListCode = "";
    const paramCalls: string[] = [];

    method.params.forEach(p => {
      const val = paramInputs[p.name] || "";
      const typeLower = p.type.toLowerCase();
      const isTree = typeLower.includes('tree');
      const isList = typeLower.includes('list') || typeLower.includes('node');
      const isArray = typeLower.includes('[]');

      if (isTree || isList) {
        if (isTree) {
          const numbers = val.split(',').map(x => {
            const clean = x.trim().toLowerCase();
            return clean === 'null' ? null : parseInt(clean);
          });
          bstOrListCode += generateBSTConstruction(numbers, p.type);
          paramCalls.push("root");
        } else {
          const parts = val.split(/;|\+/);
          const numbers = parts[0].split(',').map(x => parseInt(x.trim())).filter(n => !isNaN(n));
          let pos = -1;
          let userSpecifiedPos = false;
          
          const posPart = parts.find(p => p.includes('pos='));
          if (posPart) {
            const parsedPos = parseInt(posPart.split('pos=')[1].trim());
            if (!isNaN(parsedPos)) {
              pos = parsedPos;
              userSpecifiedPos = true;
            }
          }
          
          if (!userSpecifiedPos && pos === -1 && questionId === 'linked-list-cycle' && numbers.join(',') === '3,2,0,-4') {
            pos = 1;
          }

          bstOrListCode += generateListConstruction(numbers, p.type, pos);
          paramCalls.push("head");
        }
      } else if (isArray) {
        const baseType = p.type.replace('[]', '').trim();
        const arrayVals = val.split(',').map(x => x.trim()).join(', ');
        paramCalls.push(`new ${baseType}[]{${arrayVals}}`);
      } else if (typeLower === 'string') {
        paramCalls.push(`"${val}"`);
      } else {
        paramCalls.push(val);
      }
    });

    const paramList = paramCalls.join(', ');
    const targetClassName = getEnclosingClassForMethod(code, method.name);

    const escapeJavaString = (str: string): string => {
      return str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
    };

    let mainBody = "";
    if (stdinInput.trim()) {
      const escapedStdin = escapeJavaString(stdinInput);
      mainBody += `System.setIn(new java.io.ByteArrayInputStream("${escapedStdin}".getBytes()));\n        `;
    }

    if (targetClassName) {
      lineShiftRef.current = 0;
      if (bstOrListCode) {
        mainBody += bstOrListCode + "        ";
      }
      mainBody += `${targetClassName} instance = new ${targetClassName}();\n        `;
      if (method.returnType === 'void') {
        mainBody += `instance.${method.name}(${paramList});`;
      } else if (method.returnType.endsWith('[]')) {
        mainBody += `System.out.println("Result: " + java.util.Arrays.toString(instance.${method.name}(${paramList})));`;
      } else {
        mainBody += `System.out.println("Result: " + instance.${method.name}(${paramList}));`;
      }
      
      wrappedCode = `${wrappedCode}\n\npublic class Main {\n    public static void main(String[] args) {\n        ${mainBody}\n    }\n}`;
    } else {
      lineShiftRef.current = 1;
      if (bstOrListCode) {
        mainBody += bstOrListCode + "        ";
      }
      mainBody += `Main instance = new Main();\n        `;
      if (method.returnType === 'void') {
        mainBody += `instance.${method.name}(${paramList});`;
      } else if (method.returnType.endsWith('[]')) {
        mainBody += `System.out.println("Result: " + java.util.Arrays.toString(instance.${method.name}(${paramList})));`;
      } else {
        mainBody += `System.out.println("Result: " + instance.${method.name}(${paramList}));`;
      }

      wrappedCode = `public class Main {\n    ${code}\n\n    public static void main(String[] args) {\n        ${mainBody}\n    }\n}`;
    }

    executeVisualization(wrappedCode);
  };

  const executeVisualization = async (finalCode: string) => {
    setIsLoading(true);
    setConsoleOutput("Preparing JDB environments... Launching compiler...");
    setIsError(false);
    
    try {
      const codePayload = `import java.util.*;\nimport java.io.*;\nimport java.math.*;\n\n${finalCode}`;

      // 1. POST /run
      const runRes = await fetch("http://localhost:8000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codePayload })
      });

      const runData = await runRes.json();
      let consoleLogs = "";
      if (runData.success) {
        consoleLogs = runData.output;
      } else {
        consoleLogs = runData.error || "Compilation/runtime failure.";
        setIsError(true);
      }

      // 2. POST /visualize
      const vizRes = await fetch("http://localhost:8000/visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: codePayload,
          pattern: preset?.pattern || "Custom",
          questionId
        })
      });

      const vizData = await vizRes.json();
      
      if (Array.isArray(vizData) && vizData.length > 0) {
        const cleanedData = cleanJdbIds(vizData);
        setFrames(cleanedData);
        setCurrentFrameIndex(0);
        setConsoleOutput(consoleLogs || "JDB execution finished successfully. Tracing frames loaded.");
        setIsError(false);
      } else {
        setFrames([]);
        setConsoleOutput(consoleLogs || "No visualization frame data generated.");
        setIsError(true);
      }
    } catch (err) {
      setConsoleOutput("Error: Failed to fetch simulation data from backend. Make sure the Java debug backend is running on port 8000.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFrames([]);
    setCurrentFrameIndex(0);
    setIsPlaying(false);
    setConsoleOutput("Tutor System initialized. Press 'Simulate DryRun' to begin visual learning.");
    setIsError(false);
  };

  // Editor loading
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // Determine which visualizers should render based on metadata or dynamic runtime
  const visualizersToRender = useMemo(() => {
    if (preset && preset.visualizers) {
      if (preset.visualizers.includes('tree')) {
        return preset.visualizers.filter(v => v !== 'recursion');
      }
      return preset.visualizers;
    }
    // Fallback: detect from runtime state
    const detected: string[] = [];
    if (visualizerState.detectedTypes.includes('hashmap')) detected.push('hashmap');
    if (visualizerState.detectedTypes.includes('hashset')) detected.push('hashset');
    if (visualizerState.detectedTypes.includes('linkedlist')) detected.push('linked-list');
    
    if (visualizerState.detectedTypes.includes('tree')) {
      detected.push('tree');
    } else if (visualizerState.detectedTypes.includes('recursion')) {
      detected.push('recursion');
    }
    
    return detected.length > 0 ? detected : ["array"];
  }, [preset, visualizerState.detectedTypes]);

  // Layout wrapper classes
  const visualizerLayoutClass = useMemo(() => {
    const layout = preset ? preset.visualizerLayout : "auto";
    if (layout === "horizontal" || (layout === "auto" && visualizersToRender.length > 1)) {
      return "flex flex-row gap-6 items-stretch justify-start w-full overflow-x-auto flex-1 min-h-0";
    }
    return "flex flex-col gap-6 items-stretch justify-start w-full flex-1 min-h-0";
  }, [preset, visualizersToRender]);

  const renderVisualizer = (type: string) => {
    if (type === 'hashmap') {
      const map = visualizerState.hashMaps[0];
      if (!map) return <div className="text-xs text-slate-400 font-mono italic p-6 text-center">HashMap not initialized yet</div>;
      return (
        <HashMapVisualizer
          name={map.name}
          entries={map.entries}
          variables={visualizerState.variables}
          visualEvents={getVisualEvents(activeFrame, frames[currentFrameIndex - 1])}
          codeLine={activeFrame?.code}
        />
      );
    }
    if (type === 'hashset') {
      const set = visualizerState.hashSets[0];
      if (!set) return <div className="text-xs text-slate-400 font-mono italic p-6 text-center">HashSet not initialized yet</div>;
      return (
        <HashSetVisualizer
          name={set.name}
          values={set.values}
          visualEvents={getVisualEvents(activeFrame, frames[currentFrameIndex - 1])}
        />
      );
    }
    if (type === 'linked-list' || type === 'linkedlist') {
      if (visualizerState.linkedLists.length === 0) {
        return <div className="text-xs text-slate-400 font-mono italic p-6 text-center">Linked List not initialized yet</div>;
      }
      return (
        <div className="flex flex-col gap-6 w-full">
          {visualizerState.linkedLists.map((list, idx) => (
            <LinkedListVisualizer
              key={list.rootRefId + '-' + idx}
              name={list.name}
              rootRefId={list.rootRefId}
              nodes={list.nodes}
              variables={visualizerState.variables}
              codeLine={activeFrame?.code}
            />
          ))}
        </div>
      );
    }
    if (type === 'tree') {
      const tree = visualizerState.trees[0];
      if (!tree) return <div className="text-xs text-slate-400 font-mono italic p-6 text-center">Binary Tree not initialized yet</div>;
      return (
        <TreeVisualizer
          rootRefId={tree.rootRefId}
          nodes={tree.nodes}
          variables={visualizerState.variables}
          frames={frames}
          currentFrameIndex={currentFrameIndex}
        />
      );
    }
    if (type === 'recursion') {
      return (
        <RecursionVisualizer
          stackList={visualizerState.recursion.stack}
          currentFrameIndex={currentFrameIndex}
          frames={frames}
          trees={visualizerState.trees}
        />
      );
    }

    // Default fallback: if we have arrays, show array
    if (visualizerState.arrays.length > 0) {
      return (
        <div className="flex flex-col gap-6 w-full">
          {visualizerState.arrays.map((array, idx) => (
            <ArrayVisualizer
              key={array.name + '-' + idx}
              name={array.name}
              values={array.values}
              variables={visualizerState.variables}
              codeLine={activeFrame?.code}
              visualEvents={getVisualEvents(activeFrame, frames[currentFrameIndex - 1])}
            />
          ))}
        </div>
      );
    }

    // Otherwise, show active variables general visualizer
    const vars = Object.entries(visualizerState.variables).filter(([k]) => k !== 'args');
    if (vars.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <span className="text-xs text-slate-455 font-mono">No active variables in scope</span>
          <p className="text-[10px] text-slate-400 mt-1 italic font-semibold">Step into the method to start tracking state.</p>
        </div>
      );
    }

    return (
      <div className="w-full flex flex-col items-start select-none">
        <div className="w-full flex items-center justify-between mb-4 border-b border-slate-200/60 pb-2">
          <span className="text-sm font-semibold text-indigo-655 flex items-center gap-1.5 font-mono">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Active Variables [{vars.length} items]
          </span>
        </div>
        <div className="w-full flex flex-wrap gap-3.5 justify-start p-1 max-h-[220px] overflow-y-auto">
          {vars.map(([name, val]) => {
            const valStr = cleanValRep(val);
            const isPrimitive = typeof val !== 'object' && !String(val).includes('(#') && !String(val).includes('instance of');
            
            return (
              <motion.div
                key={name}
                layout
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl shadow-xs min-w-[110px] hover:border-slate-350 transition-colors"
              >
                <div className="flex flex-col items-start">
                  <span className="text-[9px] text-slate-400 font-black uppercase font-mono tracking-wider">{name}</span>
                  <span className={`font-mono text-[13px] font-bold mt-0.5 ${isPrimitive ? 'text-indigo-650' : 'text-slate-700'}`}>
                    {valStr}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderVisualizerWorkspace = () => {
    if (frames.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 border border-slate-200/80 bg-slate-50/50 rounded-2xl shadow-xs max-w-md mx-auto text-center animate-fade-in">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 font-bold text-lg">💡</div>
          <span className="text-sm font-extrabold text-slate-700 font-sans-premium">Simulation Not Started</span>
          <p className="text-xs text-slate-450 mt-2 leading-relaxed font-semibold">
            Review the solution code, adjust parameters as needed, and click <strong className="text-indigo-650">Simulate DryRun</strong> to launch the step-by-step trace viewer.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 w-full flex-1 min-h-0">
        <div className={visualizerLayoutClass}>
          {visualizersToRender.map((vizType) => {
            const content = renderVisualizer(vizType);
            if (!content) return null;
            return (
              <div key={vizType} className="flex-1 flex flex-col justify-start min-w-[320px] bg-white p-4 border border-slate-200/80 rounded-2xl shadow-xs relative overflow-hidden">
                <div className="flex-1 flex flex-col justify-start min-h-0 overflow-y-auto">
                  {content}
                </div>
              </div>
            );
          })}
        </div>

        {activeFrame && activeFrame.returnValue !== undefined ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-emerald-50 border border-emerald-250 p-4 rounded-xl flex items-center justify-between shadow-sm select-none z-10 shrink-0"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-extrabold text-sm shadow-emerald-500/10">
                ✓
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-black tracking-wider text-emerald-700 font-mono">
                  Solution Resolved
                </span>
                <span className="text-xs font-bold text-slate-700 mt-0.5">
                  Result: <strong className="text-emerald-600 font-mono text-sm">{activeFrame.returnValue}</strong>
                </span>
              </div>
            </div>
            
            <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/40 border border-emerald-200 px-3 py-1.5 rounded-lg max-w-[60%] text-right font-sans-premium">
              {activeFrame.explanation?.explanation || "All dry-run steps executed successfully."}
            </div>
          </motion.div>
        ) : activeFrame && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-indigo-50/20 border border-indigo-100 p-4 rounded-xl flex items-center justify-between shadow-2xs select-none z-10 shrink-0"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-extrabold text-sm shadow-indigo-500/10">
                💡
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-black tracking-wider text-indigo-600 font-mono">
                  Tutor Lesson
                </span>
                <span className="text-xs font-bold text-slate-755 mt-0.5">
                  {activeFrame.explanation?.title || "Evaluating Current Step"}
                </span>
              </div>
            </div>
            
            <div className="text-[11.5px] font-bold text-indigo-955 bg-indigo-50/60 border border-indigo-150/50 px-3.5 py-2 rounded-xl max-w-[60%] text-right font-sans-premium shadow-2xs leading-relaxed">
              {activeFrame.explanation?.explanation || "Evaluating current statement in simulation scope."}
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  const LegendPanel = (
    <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400 font-mono items-center mt-1 select-none">
      <div className="flex items-center gap-1.5 mr-2 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
        <input
          type="checkbox"
          id="tutor-mode-checkbox"
          checked={tutorMode}
          onChange={(e) => setTutorMode(e.target.checked)}
          className="rounded border-slate-350 accent-indigo-600 w-3 h-3 cursor-pointer"
        />
        <label htmlFor="tutor-mode-checkbox" className="text-indigo-650 cursor-pointer uppercase tracking-wider font-extrabold text-[9px] ml-1">
          🎓 Tutor Mode
        </label>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-sm bg-indigo-100 border border-indigo-300 inline-block" />
        <span>Read Action</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-sm bg-rose-100 border border-rose-300 inline-block" />
        <span>Mutation Write</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-sm bg-amber-50 border border-amber-300 inline-block" />
        <span>Return Statement</span>
      </div>
    </div>
  );

  return (
    <div className="learn-page flex w-screen h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans relative">
      {/* Background glowing decorations */}
      <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-indigo-300/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float-1" />
      <div className="absolute top-[60%] right-[10%] w-[350px] h-[350px] bg-blue-300/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float-2" />
      <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] bg-violet-300/8 rounded-full blur-3xl pointer-events-none -z-10 animate-float-3" />

      {/* 1. Collapsible Sidebar Navigation Drawer */}
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 animate-fade-in" 
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Drawer Wrapper */}
          <div className="fixed inset-y-0 left-0 z-50 shadow-2xl animate-slide-in-left">
            <Sidebar activeItem={preset ? 'explore' : 'custom'} />
            {/* Close Button overlay */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 w-6 h-6 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer z-55 shadow-xs font-bold"
              title="Close Sidebar"
            >
              ✕
            </button>
          </div>
        </>
      )}

      {/* 2. Main Workstation Panel */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <Header />

        {/* Interactive Simulation Workspace View */}
        <div className="flex-1 overflow-hidden min-h-0 relative bg-slate-50/30">
          <div className="flex flex-col h-full overflow-hidden select-none animate-fade-in-up">
            
            <WorkspaceToolbar
              setIsSidebarOpen={setIsSidebarOpen}
              onBackToQuestions={() => navigate('/explore')}
              preset={preset}
              handleSelectPreset={handleSelectPreset}
              handleVerifyCode={handleVerifyCode}
              isLoading={isLoading}
              handleReset={handleReset}
            />

            {/* Workspace core grids */}
            <div className="flex-1 flex min-h-0 overflow-hidden bg-slate-50/50">
              
              {/* Sidebar Left: Monaco compiler & Stack frame details */}
              <div className="w-[380px] shrink-0 border-r border-slate-200 bg-white flex flex-col min-h-0 overflow-hidden">
                
                {/* Solution Header / Description */}
                {preset ? (
                  <div className="px-5 py-4 border-b border-slate-200 shrink-0 flex flex-col gap-1.5 select-none bg-slate-55">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-indigo-600 font-mono uppercase font-bold select-none">
                        {preset.pattern}
                      </span>
                      <span className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getDifficultyStyle(preset.difficulty)}`}>
                        {preset.difficulty}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-800 tracking-tight leading-none mt-1">
                      #{preset.number} {preset.title}
                    </h3>
                    <p className="text-[10.5px] text-slate-555 font-semibold leading-relaxed mt-0.5">
                      {questionDetails?.description || "Select this problem to start executing and learning the core steps."}
                    </p>
                  </div>
                ) : (
                  <div className="px-5 py-3.5 border-b border-slate-200 shrink-0 flex justify-between items-center select-none bg-slate-55">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                      Java Solution Code
                    </span>
                    <span className="text-[10px] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-indigo-600 font-mono uppercase font-bold select-none">
                      Custom Sandbox
                    </span>
                  </div>
                )}

                {/* Monaco code area */}
                <div className="h-[280px] shrink-0 relative border-b border-slate-200/65">
                  <Editor
                    height="100%"
                    language="java"
                    theme="vs"
                    value={code}
                    onChange={(v) => setCode(v || "")}
                    onMount={handleEditorDidMount}
                    options={{
                      readOnly: preset?.visualizationLevel === 'coming-soon',
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 13,
                      fontFamily: "var(--font-code)",
                      lineNumbers: "on",
                      renderLineHighlight: "all",
                      folding: false,
                      lineDecorationsWidth: 10
                    }}
                  />
                  {preset?.visualizationLevel === 'coming-soon' && (
                    <div className="absolute inset-0 bg-slate-50/10 backdrop-blur-[0.5px] pointer-events-none" />
                  )}
                </div>

                {/* Sleek, Thin Global Notification Strip */}
                {frames.length > 0 && activeFrame && (
                  <div className="p-3 border-t border-slate-100 shrink-0 bg-indigo-50/10 select-none">
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                      <div className="flex-1 min-w-0 text-xs">
                        <span className="font-bold text-indigo-650 font-mono text-[11px] mr-1.5 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                          Line {Math.max(1, (activeFrame.line || 0) - lineShiftRef.current)}
                        </span>
                        <span className="font-semibold text-slate-600 select-text">
                          {activeFrame.explanation?.explanation || activeFrame.code?.trim() || "Executing statement..."}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Left tab details section (Console Output logs) */}
                <div className="flex-1 min-h-0 bg-white flex flex-col overflow-hidden p-5 border-t border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-555 uppercase tracking-wider font-mono block mb-2 select-none">
                    Console Output logs
                  </span>
                  <div className={`flex-1 bg-slate-55 border rounded-xl p-3 font-mono text-xs overflow-y-auto select-text ${isError ? 'border-rose-500/30 text-rose-600 bg-rose-50/30' : 'border-slate-200/60 text-slate-700'}`}>
                    {consoleOutput}
                  </div>
                </div>

              </div>

              {/* Right Core visualizer & timeline */}
              <div id="visualizer-right-panel" className="flex-1 min-w-0 flex flex-col bg-slate-100/20 min-h-0 overflow-y-auto p-4 gap-4">
                
                {/* Timeline controller */}
                <TimelineController
                  frames={frames}
                  currentFrameIndex={currentFrameIndex}
                  setCurrentFrameIndex={setCurrentFrameIndex}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  speed={speed}
                  setSpeed={setSpeed}
                />



                {/* Visual Canvas workspace */}
                <div className="flex-1 min-h-0 flex flex-col">
                  <VisualizerContainer
                    title="VISUALIZATION"
                    subtitle={preset?.visualizationLevel === 'coming-soon' ? "Coming soon to DryRun visualizers" : "Watch structural data mutations execute frame-by-frame"}
                    actions={LegendPanel}
                  >
                    <div className="flex-1 flex flex-col justify-start min-h-0 gap-6">
                      {preset?.visualizationLevel === 'coming-soon' ? (
                        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 max-w-md mx-auto text-center animate-fade-in shrink-0">
                          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4 font-bold text-lg">🚀</div>
                          <span className="text-sm font-extrabold text-slate-700 font-sans-premium">Visualization Coming Soon</span>
                          <p className="text-xs text-slate-455 mt-2 leading-relaxed font-semibold">
                            We are actively constructing the visualization pipeline for this problem. You can still open original problem details on LeetCode!
                          </p>
                          <button
                            onClick={() => navigate('/learn')}
                            className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            Explore Custom Sandbox
                          </button>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col justify-start min-h-0 overflow-y-auto relative">
                          {renderVisualizerWorkspace()}
                          
                          {/* Floating Tutor Explanation Card Overlay (CRITICAL events only) */}
                          {tutorMode && showExplanationModal && activeFrame && activeFrame.explanation && activeFrame.explanation.importance === 'CRITICAL' && (
                            <div className="absolute bottom-4 right-4 z-30 w-[360px] animate-slide-in-right">
                              <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="bg-white/95 border border-indigo-100 rounded-2xl shadow-xl p-5 flex flex-col gap-4 select-none relative overflow-hidden backdrop-blur-xs"
                              >
                                {/* Top gradient accent strip */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-500" />
                                
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-150 flex items-center justify-center font-extrabold text-lg shadow-sm">
                                      💡
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[10px] uppercase font-black tracking-wider text-indigo-500 font-mono">
                                        Tutor Insight • Step {currentFrameIndex + 1} of {frames.length}
                                      </span>
                                      <h4 className="font-extrabold text-sm text-slate-800 tracking-tight leading-none mt-1">
                                        {activeFrame.explanation.title || "Algorithm Step"}
                                      </h4>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setShowExplanationModal(false)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors text-xs font-bold font-sans cursor-pointer hover:bg-slate-50 w-6 h-6 rounded-md flex items-center justify-center"
                                  >
                                    ✕
                                  </button>
                                </div>

                                <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-mono select-text flex items-center justify-between">
                                  <span className="text-[10px] font-black text-indigo-650 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                                    Line {Math.max(1, (activeFrame.line || 0) - lineShiftRef.current)}
                                  </span>
                                  <code className="font-semibold text-slate-650 truncate max-w-[70%] text-[11px] text-right">
                                    {activeFrame.code?.trim()}
                                  </code>
                                </div>

                                {activeFrame.explanation.stateVars && activeFrame.explanation.stateVars.length > 0 && (
                                  <div className="grid grid-cols-2 gap-3.5 bg-slate-50/50 border border-slate-150/60 p-3 rounded-xl">
                                    {activeFrame.explanation.stateVars.map((v: any, idx: number) => (
                                      <div key={idx} className="flex flex-col">
                                        <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-400 font-mono leading-none">
                                          {v.name}
                                        </span>
                                        <span className="font-mono text-xs font-bold text-slate-750 mt-1 select-text">
                                          {v.val !== undefined && v.val !== null ? String(v.val) : "undefined"}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="flex flex-col gap-2.5">
                                  <p className="text-[12.5px] font-medium text-slate-700 leading-relaxed font-sans-premium select-text">
                                    {activeFrame.explanation.explanation}
                                  </p>
                                  {activeFrame.explanation.why && (
                                    <p className="text-[11px] font-semibold text-slate-450 italic leading-relaxed font-sans-premium select-text border-l-2 border-indigo-100 pl-3">
                                      {activeFrame.explanation.why}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center justify-between gap-4 mt-2">
                                  <label className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={tutorMode}
                                      onChange={(e) => setTutorMode(e.target.checked)}
                                      className="rounded border-slate-300 accent-indigo-600 w-3.5 h-3.5 cursor-pointer"
                                    />
                                    Tutor Auto-Pause
                                  </label>
                                  
                                  <button
                                    onClick={handleContinueStep}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-500/10 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                  >
                                    {currentFrameIndex < frames.length - 1 ? (
                                      <>
                                        Continue
                                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                          <path d="M8 5v14l11-7z"/>
                                        </svg>
                                      </>
                                    ) : (
                                      "Finish"
                                    )}
                                  </button>
                                </div>
                              </motion.div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </VisualizerContainer>
             

              </div>    </div>

            </div>

          </div>

        </div>

      </div>

      {/* Input Parameters Prompt Modal */}
      <SetupSimulationModal
        showPromptModal={showPromptModal}
        preset={preset}
        questionDetails={questionDetails}
        detectedMethods={detectedMethods}
        selectedMethodIdx={selectedMethodIdx}
        paramInputs={paramInputs}
        setParamInputs={setParamInputs}
        code={code}
        stdinInput={stdinInput}
        setStdinInput={setStdinInput}
        handleStartSimulation={handleStartSimulation}
        setShowPromptModal={setShowPromptModal}
      />
    </div>
  );
};
