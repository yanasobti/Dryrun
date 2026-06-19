import React from 'react';
import type { MethodInfo } from '../../types';

const getParameterTip = (name: string, type: string) => {
  const nameLower = name.toLowerCase();
  const typeLower = type.toLowerCase();
  
  if (typeLower.includes('treenode') || nameLower === 'root') {
    return {
      placeholder: "e.g. 3, 9, 20, null, null, 15, 7",
      tip: "Level-order tree nodes representation. Use 'null' to skip children slots."
    };
  }
  if (typeLower.startsWith('list<') || typeLower.startsWith('arraylist<')) {
    if (typeLower.includes('string')) {
      return {
        placeholder: 'Example: neet,code,love,you  or  ["neet","code","love","you"]',
        tip: "List of strings. Provide comma-separated values or JSON array list format."
      };
    }
    return {
      placeholder: 'Example: 1,2,3,4  or  [1,2,3,4]',
      tip: "List of elements. Provide comma-separated values or JSON array list format."
    };
  }
  if (typeLower.includes('listnode') || nameLower === 'head') {
    return {
      placeholder: "e.g. 3, 2, 0, -4; pos=1",
      tip: "Comma-separated values to build list. Append '; pos=X' to form a cycle back to index X (e.g. pos=1)."
    };
  }
  if (nameLower === 'nums') {
    return {
      placeholder: "e.g. 2, 7, 11, 15",
      tip: "Array integers to search, filter, or combine."
    };
  }
  if (nameLower === 'prices') {
    return {
      placeholder: "e.g. 7, 1, 5, 3, 6, 4",
      tip: "Consecutive daily market stock ticker prices."
    };
  }
  if (nameLower === 'target') {
    return {
      placeholder: "e.g. 9",
      tip: "Target value the algorithm is trying to evaluate."
    };
  }
  if (typeLower.includes('[][]')) {
    return {
      placeholder: "e.g. [[1,1,1,1,0],\n [1,1,0,1,0],\n [1,1,0,0,0],\n [0,0,0,0,0]]",
      tip: "JSON-style 2D matrix array. Enter each row on a new line."
    };
  }
  if (typeLower.includes('[]')) {
    return {
      placeholder: "e.g. 1, 2, 3, 4",
      tip: "Comma-separated elements for array parameter input."
    };
  }
  return {
    placeholder: "e.g. 0",
    tip: "Provide value matching parameter type signature."
  };
};

interface SetupSimulationModalProps {
  showPromptModal: boolean;
  preset: any;
  questionDetails: any;
  detectedMethods: MethodInfo[];
  selectedMethodIdx: number;
  paramInputs: Record<string, string>;
  setParamInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  code: string;
  stdinInput: string;
  setStdinInput: (val: string) => void;
  handleStartSimulation: () => void;
  setShowPromptModal: (show: boolean) => void;
}

export const SetupSimulationModal: React.FC<SetupSimulationModalProps> = ({
  showPromptModal,
  preset,
  questionDetails,
  detectedMethods,
  selectedMethodIdx,
  paramInputs,
  setParamInputs,
  code,
  stdinInput,
  setStdinInput,
  handleStartSimulation,
  setShowPromptModal
}) => {
  if (!showPromptModal) return null;

  const handleLoadExample = () => {
    if (questionDetails && questionDetails.inputs) {
      setParamInputs(questionDetails.inputs);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 flex flex-col gap-4 shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 font-sans-premium">
              Setup Simulation Parameters
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Provide argument inputs to dry-run this question.
            </p>
          </div>
          {questionDetails?.inputs && (
            <button
              type="button"
              onClick={handleLoadExample}
              className="text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1.5 rounded-xl border border-indigo-200/30 transition-all cursor-pointer hover:scale-[1.02]"
            >
              📥 Load Example
            </button>
          )}
        </div>

        {preset && (
          <div className="bg-indigo-50/50 border border-indigo-100/30 rounded-xl p-3 text-xs text-slate-655 font-semibold text-left select-text">
            <span className="text-[9px] font-black uppercase text-indigo-600 block mb-1 font-mono">
              Problem Description
            </span>
            {questionDetails?.description || preset.title}
          </div>
        )}

        <div className="flex flex-col gap-3 text-left">
          {detectedMethods[selectedMethodIdx]?.params.map(p => {
            const tipMeta = getParameterTip(p.name, p.type);
            const isMatrix = p.type.includes('[][]');
            return (
              <div key={p.name} className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
                  {p.name} ({p.type})
                </label>
                {isMatrix ? (
                  <textarea
                    rows={4}
                    value={paramInputs[p.name] || ""}
                    onChange={(e) => setParamInputs(prev => ({ ...prev, [p.name]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-slate-800"
                    placeholder={tipMeta.placeholder}
                  />
                ) : (
                  <input
                    type="text"
                    value={paramInputs[p.name] || ""}
                    onChange={(e) => setParamInputs(prev => ({ ...prev, [p.name]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-slate-800"
                    placeholder={tipMeta.placeholder}
                  />
                )}
                <span className="text-[9.5px] text-slate-400 font-semibold italic mt-0.5 pl-1 block">
                  {tipMeta.tip}
                </span>
              </div>
            );
          })}

          {/* Show Stdin Input field if Scanner/System.in is detected or in custom code mode */}
          {(!preset || code.includes('Scanner') || code.includes('System.in')) && (
            <div className="flex flex-col gap-1 mt-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
                Standard Input (stdin)
              </label>
              <textarea
                rows={3}
                value={stdinInput}
                onChange={(e) => setStdinInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-205 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-slate-800 font-mono"
                placeholder={"e.g. 5\n1 2 3 4 5\n3"}
              />
              <span className="text-[9.5px] text-slate-400 font-semibold italic mt-0.5 pl-1 block">
                Values passed to Scanner / System.in during execution.
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={handleStartSimulation}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-xs font-bold transition-all shadow-md shadow-indigo-655/15 cursor-pointer hover:scale-[1.01]"
          >
            Start Tracing
          </button>
          <button
            onClick={() => setShowPromptModal(false)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-855 text-xs font-bold transition-all cursor-pointer hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
