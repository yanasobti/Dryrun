import React, { useMemo } from 'react';

interface StackVisualizerProps {
  strategy?: string;
  visualizerState: any; // VisualizerState
  data: {
    steps: any[];
  };
  currentStep: number;
}

export const StackVisualizer: React.FC<StackVisualizerProps> = ({
  strategy = 'matching_pairs',
  visualizerState,
  data,
  currentStep
}) => {
  if (!data || !data.steps || data.steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-400 font-mono italic">
        Loading execution trace...
      </div>
    );
  }

  const variables = visualizerState?.variables || {};

  // Get active stack values
  const stackValues = useMemo(() => {
    if (strategy === 'auxiliary_state_stack') {
      const sObj = visualizerState?.stacks?.find((s: any) => s.name === 'stack');
      if (sObj) return sObj.values || [];
    }
    if (visualizerState?.stacks && visualizerState.stacks.length > 0) {
      return visualizerState.stacks[0].values || [];
    }
    return [];
  }, [visualizerState?.stacks, strategy]);

  const minStackValues = useMemo(() => {
    if (strategy === 'auxiliary_state_stack') {
      const sObj = visualizerState?.stacks?.find((s: any) => s.name === 'minStack');
      if (sObj) return sObj.values || [];
    }
    return [];
  }, [visualizerState?.stacks, strategy]);

  // Look up previous step stack to determine the action
  const prevStep = currentStep > 0 ? data.steps[currentStep - 1] : null;
  const prevVariables = prevStep?.variables || {};
  
  // Find stack variable in prevStep variables or state
  const prevStackVal = useMemo(() => {
    if (!prevStep) return [];
    
    // Attempt to get from visualizerState
    const prevVisState = prevStep.visualizerState;
    if (prevVisState?.stacks) {
      if (strategy === 'auxiliary_state_stack') {
        const sObj = prevVisState.stacks.find((s: any) => s.name === 'stack');
        if (sObj) return sObj.values || [];
      } else if (prevVisState.stacks.length > 0) {
        return prevVisState.stacks[0].values || [];
      }
    }

    const entry = Object.entries(prevVariables).find(([k, v]) => {
      if (k === 'args') return false;
      const kLower = k.toLowerCase();
      return kLower.includes('stack') || kLower === 'st' || String(v).includes('Stack') || String(v).includes('Deque') || String(v).includes('ArrayDeque');
    });
    if (entry) {
      const valStr = String(entry[1]);
      if (!valStr || valStr === "null") return [];
      const startIdx = valStr.indexOf('[');
      const endIdx = valStr.lastIndexOf(']');
      if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) return [];
      const inner = valStr.substring(startIdx + 1, endIdx).trim();
      if (!inner) return [];
      return inner.split(',').map(item => item.trim()).filter(Boolean);
    }
    return [];
  }, [prevVariables, prevStep, strategy]);

  // Determine stack action
  const actionInfo = useMemo(() => {
    if (stackValues.length > prevStackVal.length) {
      const added = stackValues[stackValues.length - 1];
      return {
        action: 'PUSH',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        resultDescription: `Push '${added}'`
      };
    } else if (stackValues.length < prevStackVal.length) {
      const removed = prevStackVal[prevStackVal.length - 1];
      return {
        action: 'POP',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
        resultDescription: `Pop '${removed}'`
      };
    }
    return {
      action: 'IGNORE',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      resultDescription: 'No stack change'
    };
  }, [stackValues, prevStackVal]);

  // Map stack index values to actual temperatures if daily-temperatures
  const temperaturesArray = visualizerState?.arrays?.find((a: any) => a.name === 'temperatures');
  const tempValues = temperaturesArray ? temperaturesArray.values : null;

  const getDisplayValue = (val: any) => {
    if (tempValues !== null && !isNaN(Number(val))) {
      const idx = Number(val);
      if (idx >= 0 && idx < tempValues.length) {
        return `${tempValues[idx]}° (at idx ${idx})`;
      }
    }
    return String(val);
  };

  // Get tutor narration string
  const explanationText = useMemo(() => {
    const rawExp = visualizerState?.explanation;
    if (!rawExp) return '';
    if (typeof rawExp === 'object') {
      return rawExp.explanation || rawExp.action || '';
    }
    return String(rawExp);
  }, [visualizerState?.explanation]);

  // Determine current scanning index
  const scanIndex = useMemo(() => {
    if (strategy === 'monotonic_decreasing') {
      return variables.i !== undefined ? Number(variables.i) : -1;
    }
    if (strategy === 'matching_pairs') {
      const sVal = variables.s ? String(variables.s).replace(/['"]/g, '') : '';
      if (!sVal) return -1;
      
      let loopIndex = -1;
      let lastWasLine6 = false;
      for (let i = 0; i <= currentStep; i++) {
        const stepFrame = data.steps[i];
        if (stepFrame?.line === 6) {
          if (!lastWasLine6) {
            loopIndex++;
          }
          lastWasLine6 = true;
        } else {
          if (stepFrame?.line !== 5) {
            lastWasLine6 = false;
          }
        }
      }
      
      if (loopIndex < 0) return -1;
      return Math.min(loopIndex, sVal.length - 1);
    }    if (strategy === 'postfix_evaluation') {
      const tokensStr = variables.tokensStr ? String(variables.tokensStr).replace(/['"]/g, '') : '';
      if (!tokensStr) return -1;
      const tokens = tokensStr.split(',');
      
      let loopIndex = -1;
      let lastWasLine5 = false;
      for (let i = 0; i <= currentStep; i++) {
        const stepFrame = data.steps[i];
        if (stepFrame?.line === 5) {
          if (!lastWasLine5) {
            loopIndex++;
          }
          lastWasLine5 = true;
        } else {
          lastWasLine5 = false;
        }
      }
      if (loopIndex < 0) return -1;
      return Math.min(loopIndex, tokens.length - 1);
    }
    return -1;
  }, [currentStep, data.steps, variables, strategy]);

  // Extract input elements for horizontal scanning pointer
  const sVal = variables.s ? String(variables.s).replace(/['"]/g, '') : '';
  const elements = useMemo(() => {
    if (strategy === 'matching_pairs') {
      return sVal.split('');
    }
    if (strategy === 'postfix_evaluation') {
      const tokensStr = variables.tokensStr ? String(variables.tokensStr).replace(/['"]/g, '') : '';
      return tokensStr ? tokensStr.split(',') : [];
    }
    return tempValues || [];
  }, [strategy, sVal, tempValues, variables.tokensStr]);

  // Only show bubble on PUSH or POP operations
  const showBubble = actionInfo.action === 'PUSH' || actionInfo.action === 'POP';
  const showInputSequence = strategy === 'matching_pairs' || strategy === 'postfix_evaluation';

  const poppedA = variables.a !== undefined ? String(variables.a) : null;
  const poppedB = variables.b !== undefined ? String(variables.b) : null;
  const currentToken = variables.token ? String(variables.token).replace(/['"]/g, '') : '';
  const isOperator = ['+', '-', '*', '/'].includes(currentToken);

  return (
    <div className="flex flex-col gap-4 w-full max-w-xl mx-auto p-2">
      {/* 1. Tiny Strategy Header */}
      <div className="text-center border-b border-slate-100 pb-2.5 mb-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          {strategy === 'matching_pairs' 
            ? 'Stack • Matching Pairs' 
            : strategy === 'monotonic_decreasing'
            ? 'Stack • Monotonic Decreasing'
            : strategy === 'auxiliary_state_stack'
            ? 'Stack • Min Tracker'
            : strategy === 'postfix_evaluation'
            ? 'Stack • Postfix Evaluation'
            : 'Stack'}
        </span>
      </div>

      {/* 2. Whiteboard Workspace */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs flex flex-col items-center gap-6 min-h-[200px] overflow-visible w-full">
        
        {/* Input Scan (Centered at Top) */}
        {showInputSequence && (
          <div className="flex flex-col items-center gap-1 py-1 w-full border-b border-slate-100/80">
            <span className="text-[9.5px] font-black text-slate-450 uppercase tracking-wider font-mono">
              Input Sequence
            </span>
            {elements.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No input</span>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-3.5 font-mono text-[15px] font-black text-slate-800">
                  {elements.map((el: any, idx: number) => {
                    const isActive = idx === scanIndex;
                    return (
                      <div key={idx} className="flex flex-col items-center min-w-7">
                        <span className={`transition-all duration-300 ${isActive ? 'text-indigo-650 scale-115 font-black' : 'text-slate-400 font-semibold'}`}>
                          {el}
                        </span>
                        <span className={`text-[10px] mt-0.5 transition-all duration-350 ${isActive ? 'text-indigo-650 font-black opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}>
                          ↑
                        </span>
                      </div>
                    );
                  })}
                </div>
                {scanIndex === -1 && (
                  <span className="text-[11px] font-semibold text-slate-400 italic mt-0.5">
                    Starting Scan...
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Stack Column (Centered) */}
        <div className="flex flex-col items-center justify-end w-36 relative shrink-0 pt-1">
          {stackValues.length === 0 ? (
            <div className="text-xs font-bold text-slate-400 font-mono italic py-4 text-center">
              Stack: (empty)
            </div>
          ) : strategy === 'auxiliary_state_stack' ? (
            <div className="flex flex-col items-center w-full">
              <span className="text-[8.5px] font-black text-indigo-400 uppercase tracking-widest mb-1 font-mono">
                TOP
              </span>
              
              <div className="w-full border border-indigo-950 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col font-mono text-xs">
                {/* Table Header */}
                <div className="grid grid-cols-2 bg-indigo-50 border-b border-indigo-950 font-black text-[9px] text-indigo-900 uppercase tracking-wider py-1.5 text-center">
                  <div className="border-r border-indigo-200">Value</div>
                  <div>Min</div>
                </div>
                {/* Table Body */}
                {[...stackValues].reverse().map((val: any, idx: number) => {
                  const actualIdx = stackValues.length - 1 - idx;
                  const isTop = idx === 0;
                  const minVal = minStackValues[actualIdx] !== undefined ? minStackValues[actualIdx] : '-';
                  return (
                    <div
                      key={`${actualIdx}-${val}`}
                      className={`grid grid-cols-2 border-b last:border-b-0 border-indigo-950/20 text-center font-black transition-all duration-300 ${
                        isTop 
                          ? 'bg-indigo-650 text-white' 
                          : 'bg-white text-indigo-950'
                      }`}
                    >
                      <div className={`py-2 border-r ${isTop ? 'border-indigo-500' : 'border-indigo-950/20'}`}>
                        {val}
                      </div>
                      <div className="py-2">
                        {minVal}
                      </div>
                    </div>
                  );
                })}
              </div>

              <span className="text-[8.5px] font-black text-indigo-400 uppercase tracking-widest mt-1.5 font-mono">
                BOTTOM
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              <span className="text-[8.5px] font-black text-indigo-400 uppercase tracking-widest mb-1 font-mono">
                TOP
              </span>
              
              <div className="w-28 border border-indigo-950 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
                {[...stackValues].reverse().map((val: any, idx: number) => {
                  const actualIdx = stackValues.length - 1 - idx;
                  const isTop = idx === 0;
                  return (
                    <div
                      key={`${actualIdx}-${val}`}
                      className={`py-2 text-center text-xs font-black font-mono transition-all duration-300 ${
                        isTop 
                          ? 'bg-indigo-650 text-white' 
                          : 'bg-white text-indigo-950 border-t border-slate-200'
                      }`}
                    >
                      {getDisplayValue(val)}
                    </div>
                  );
                })}
              </div>

              <span className="text-[8.5px] font-black text-indigo-400 uppercase tracking-widest mt-1.5 font-mono">
                BOTTOM
              </span>
            </div>
          )}

          {/* Small 1-line context bubble floating to the right of the stack */}
          {(showBubble || (strategy === 'postfix_evaluation' && isOperator && poppedA !== null && poppedB !== null)) && (
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 w-64 bg-slate-50 border border-slate-250 text-slate-800 px-3 py-2 rounded-xl shadow-xs font-sans text-[11px] font-bold flex items-center z-35 animate-in fade-in zoom-in-95 duration-150">
              <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-slate-250" />
              <span>
                {strategy === 'postfix_evaluation' && isOperator && poppedA !== null && poppedB !== null
                  ? `💬 Pop ${poppedB} & ${poppedA} → Calculate: ${poppedA} ${currentToken} ${poppedB} = ${
                      currentToken === '+' ? Number(poppedA) + Number(poppedB) :
                      currentToken === '-' ? Number(poppedA) - Number(poppedB) :
                      currentToken === '*' ? Number(poppedA) * Number(poppedB) :
                      currentToken === '/' ? Math.trunc(Number(poppedA) / Number(poppedB)) : ''
                    }`
                  : `💬 ${explanationText.split('.')[0] || explanationText}.`
                }
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StackVisualizer;
