import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContextBubble } from './ContextBubble';

interface EncodeDecodeStringsVisualizerProps {
  frames: any[];
  currentFrameIndex: number;
}

export const EncodeDecodeStringsVisualizer: React.FC<EncodeDecodeStringsVisualizerProps> = ({
  frames,
  currentFrameIndex
}) => {
  const activeFrame = frames[currentFrameIndex] || {};
  const currentVars = activeFrame.variables || {};
  const stack = activeFrame.stack || [];
  
  // Find current method name ('encode' or 'decode')
  const activeMethod = useMemo(() => {
    if (stack.length > 0) {
      const topFrame = stack[stack.length - 1];
      if (topFrame.methodName === 'encode' || topFrame.methodName === 'decode') {
        return topFrame.methodName;
      }
    }
    // Fallback search in code snippet
    const code = (activeFrame.code || "").toLowerCase();
    if (code.includes('encode')) return 'encode';
    if (code.includes('decode')) return 'decode';
    return 'encode';
  }, [stack, activeFrame.code]);

  // Extract variables
  const iVal = currentVars['i'] !== undefined ? parseInt(String(currentVars['i'])) : -1;
  const jVal = currentVars['j'] !== undefined ? parseInt(String(currentVars['j'])) : -1;
  const lenVal = currentVars['length'] !== undefined ? parseInt(String(currentVars['length'])) : -1;
  const sVal = currentVars['s'] ? String(currentVars['s']).replace(/['"]/g, '') : null;
  const strVal = currentVars['str'] ? String(currentVars['str']).replace(/['"]/g, '') : "";

  // ──────────────── ENCODING WORK ────────────────
  const strs: string[] = useMemo(() => {
    const firstFrame = frames[0] || {};
    const firstVars = firstFrame.variables || {};
    const inputStrs = firstVars['strs'] || currentVars['strs'];
    if (inputStrs) {
      const match = String(inputStrs).match(/\[(.*?)\]/);
      if (match) {
        return match[1].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);
      }
    }
    return [];
  }, [frames, currentVars]);

  const isAppendStep = useMemo(() => {
    const codeLine = (activeFrame.code || "").trim();
    return codeLine.includes('sb.append') && sVal !== null;
  }, [activeFrame.code, sVal]);

  const isEncodeComplete = useMemo(() => {
    const codeLine = (activeFrame.code || "").trim();
    return codeLine.includes('return sb.toString()') || !!activeFrame.returnValue;
  }, [activeFrame.code, activeFrame.returnValue]);

  // Progressive list of chunks appended so far
  const appendedChunks = useMemo(() => {
    if (activeMethod !== 'encode') return [];
    if (isEncodeComplete) {
      return strs.map(s => `${s.length}#${s}`);
    }
    if (iVal === -1) return [];
    
    // Elements appended up to iVal (exclusive)
    const baseChunks = strs.slice(0, iVal).map(s => `${s.length}#${s}`);
    return baseChunks;
  }, [activeMethod, isEncodeComplete, iVal, strs]);

  const currentlyEncodingWord = useMemo(() => {
    if (activeMethod !== 'encode') return null;
    if (sVal) return sVal;
    if (iVal >= 0 && iVal < strs.length) return strs[iVal];
    return null;
  }, [activeMethod, sVal, iVal, strs]);

  // ──────────────── DECODING WORK ────────────────
  const decodedList: string[] = useMemo(() => {
    const listVar = currentVars['list'];
    if (listVar) {
      const match = String(listVar).match(/\[(.*?)\]/);
      if (match) {
        return match[1].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);
      }
    }
    return [];
  }, [currentVars]);

  const isDecodeComplete = useMemo(() => {
    const codeLine = (activeFrame.code || "").trim();
    return codeLine.includes('return list') || (activeFrame.isExit && activeMethod === 'decode');
  }, [activeFrame.code, activeFrame.isExit, activeMethod]);

  // Explanatory Bubble Text
  const bubbleText = useMemo(() => {
    const codeLine = (activeFrame.code || "").trim();
    
    if (activeMethod === 'encode') {
      if (codeLine.includes('new StringBuilder()')) {
        return "Initialize StringBuilder to construct the serialized payload.";
      }
      if (codeLine.includes('strs.get(i)')) {
        return `Extracting string "${currentlyEncodingWord}" at index ${iVal}`;
      }
      if (codeLine.includes('sb.append')) {
        return `Serialize: Append length (${currentlyEncodingWord?.length}) + '#' + "${currentlyEncodingWord}"`;
      }
      if (codeLine.includes('return sb.toString()')) {
        return "Encoding complete! Returning the final payload string.";
      }
    } else { // decode
      if (codeLine.includes('new ArrayList()')) {
        return "Create empty list to hold decoded strings.";
      }
      if (codeLine.includes('indexOf(\'#\'')) {
        return `Scanning from index ${iVal} to find the separator '#'`;
      }
      if (codeLine.includes('Integer.parseInt')) {
        return `Parsed length prefix: ${lenVal} characters`;
      }
      if (codeLine.includes('i = j + 1 + length')) {
        return `Shift pointer 'i' past word characters to index ${jVal + 1 + lenVal}`;
      }
      if (codeLine.includes('list.add')) {
        const decodedWord = strVal.substring(jVal + 1, iVal);
        return `Decoded substring "${decodedWord}" added to output list!`;
      }
      if (codeLine.includes('return list')) {
        return "Decoding complete! Returning list of original strings.";
      }
    }
    return null;
  }, [activeMethod, activeFrame.code, currentlyEncodingWord, iVal, jVal, lenVal, strVal]);

  return (
    <div className="w-full flex flex-col gap-6 p-6 bg-slate-50 border border-slate-200/60 rounded-2xl shadow-inner select-none relative min-h-[460px] justify-between">
      
      {/* Header Info */}
      <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-black uppercase text-indigo-650 tracking-widest font-mono">
            {activeMethod === 'encode' ? 'Encoding Phase' : 'Decoding Phase'}
          </span>
          <h4 className="text-sm font-extrabold text-slate-700 mt-1">
            {activeMethod === 'encode' ? 'List<String> ➔ Serialized String' : 'Serialized String ➔ List<String>'}
          </h4>
        </div>
        
        {/* Floating Context Explanation Bubble */}
        {bubbleText && (
          <ContextBubble
            message={bubbleText}
            variant="success"
            animation="pop"
            position="bottom"
            className="z-30"
          />
        )}
      </div>

      {/* ──────────────── ENCODE VISUALS ──────────────── */}
      {activeMethod === 'encode' && (
        <div className="flex-1 flex flex-col justify-around gap-6 py-2">
          
          {/* Input list */}
          <div className="flex flex-col items-start gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Input String List (strs)
            </span>
            <div className="flex gap-2.5 flex-wrap">
              {strs.map((word, idx) => {
                const isActive = idx === iVal && !isEncodeComplete;
                const isProcessed = idx < iVal || isEncodeComplete;
                return (
                  <div key={idx} className="relative flex flex-col items-center">
                    <motion.div
                      animate={{
                        scale: isActive ? 1.05 : 1,
                        borderColor: isActive ? '#6366f1' : isProcessed ? '#cbd5e1' : '#e2e8f0',
                        backgroundColor: isActive ? '#f5f3ff' : isProcessed ? '#f8fafc' : '#ffffff'
                      }}
                      className={`px-4 py-2 border rounded-xl font-bold font-mono text-sm shadow-sm ${isActive ? 'text-indigo-700 border-2' : isProcessed ? 'text-slate-400' : 'text-slate-700'}`}
                    >
                      "{word}"
                    </motion.div>
                    {isActive && (
                      <motion.span
                        layoutId="active-encode-arrow"
                        className="text-indigo-600 text-xs font-bold mt-1"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        ▲
                      </motion.span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transformation Pipeline */}
          <div className="min-h-[90px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {currentlyEncodingWord && !isEncodeComplete ? (
                <motion.div
                  key={`pipeline-${currentlyEncodingWord}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-center gap-4 border border-dashed border-indigo-150 rounded-2xl p-4 bg-indigo-50/10 max-w-lg w-full shadow-sm"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Length</span>
                    <span className="text-base font-black text-indigo-600 font-mono">{currentlyEncodingWord.length}</span>
                  </div>
                  <span className="text-slate-350 text-xl font-bold">+</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Delimiter</span>
                    <span className="text-base font-black text-rose-500 font-mono">#</span>
                  </div>
                  <span className="text-slate-350 text-xl font-bold">+</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">String</span>
                    <span className="text-base font-black text-indigo-700 font-mono">"{currentlyEncodingWord}"</span>
                  </div>
                  <span className="text-slate-350 text-xl font-bold">➔</span>
                  
                  {/* Active chunk animates/layoutIds into output */}
                  <motion.div
                    layoutId={isAppendStep ? "active-chunk" : undefined}
                    className="flex flex-col items-center bg-indigo-600 px-3 py-1.5 rounded-xl text-white shadow-md border border-indigo-500"
                  >
                    <span className="text-[8px] font-bold text-indigo-200 uppercase tracking-wider font-mono">Chunk</span>
                    <span className="text-xs font-black font-mono">{currentlyEncodingWord.length}#{currentlyEncodingWord}</span>
                  </motion.div>
                </motion.div>
              ) : (
                <div className="text-xs text-slate-400 italic">No active string transformation</div>
              )}
            </AnimatePresence>
          </div>

          {/* Encoded output so far (No black box - styled to match colors) */}
          <div className="flex flex-col items-start gap-2 border-t border-slate-200/60 pt-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Serialized String Output (sb)
            </span>
            <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 min-h-[58px] flex items-center flex-wrap gap-2 shadow-inner font-mono text-sm text-left overflow-x-auto">
              {appendedChunks.length > 0 || isAppendStep ? (
                <>
                  {appendedChunks.map((chunk, idx) => (
                    <React.Fragment key={idx}>
                      <div className="bg-slate-100 text-slate-600 border border-slate-200/80 px-2.5 py-1 rounded-xl font-bold text-xs">
                        {chunk}
                      </div>
                      {idx < appendedChunks.length - 1 && <span className="text-slate-300 font-bold">+</span>}
                    </React.Fragment>
                  ))}
                  {isAppendStep && currentlyEncodingWord && (
                    <>
                      {appendedChunks.length > 0 && <span className="text-slate-350 font-bold">+</span>}
                      <motion.div
                        layoutId="active-chunk"
                        className="bg-indigo-50 text-indigo-700 border-2 border-indigo-400 px-2.5 py-1 rounded-xl font-extrabold text-xs shadow-sm flex flex-col items-center"
                        animate={{ scale: [1, 1.03, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        {currentlyEncodingWord.length}#{currentlyEncodingWord}
                      </motion.div>
                    </>
                  )}
                </>
              ) : (
                <span className="text-slate-400 italic text-xs">StringBuilder is empty</span>
              )}
            </div>
          </div>

          {/* Final success state badge */}
          {isEncodeComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl px-4 py-3 text-xs font-bold flex items-center gap-2 mt-1 shadow-sm text-left"
            >
              <span className="text-sm">✓</span> Serialization Complete! Output String: <span className="font-mono bg-emerald-100/50 px-2 py-0.5 rounded text-emerald-900 border border-emerald-200/40">{strs.map(s => `${s.length}#${s}`).join('')}</span>
            </motion.div>
          )}
        </div>
      )}

      {/* ──────────────── DECODE VISUALS ──────────────── */}
      {activeMethod === 'decode' && (
        <div className="flex-1 flex flex-col justify-around gap-6 py-2">
          
          {/* Encoded Input String Characters */}
          <div className="flex flex-col items-start gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Input Encoded String (str)
            </span>
            <div className="w-full flex gap-1 overflow-x-auto pb-4 pt-2 px-1">
              {strVal.split('').map((char, idx) => {
                const isI = idx === iVal;
                const isJ = idx === jVal;
                const isBetween = jVal !== -1 && idx > jVal && idx < iVal;
                
                let cellClass = 'border-slate-200 bg-white text-slate-700';
                if (isI) cellClass = 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20';
                else if (isJ) cellClass = 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-500/20';
                else if (isBetween) cellClass = 'border-emerald-500 bg-emerald-50 text-emerald-700';

                return (
                  <div key={idx} className="flex flex-col items-center min-w-[28px] gap-1 relative">
                    <div className={`w-7 h-7 flex items-center justify-center font-bold text-xs font-mono border rounded-lg transition-all ${cellClass}`}>
                      {char}
                    </div>
                    {/* Index */}
                    <span className="text-[8px] font-mono text-slate-400">{idx}</span>
                    
                    {/* Pointer Tags */}
                    {isI && (
                      <span className="absolute bottom-[-15px] text-[8px] font-extrabold font-mono text-indigo-600 bg-indigo-50 px-1 border border-indigo-200 rounded uppercase">
                        i
                      </span>
                    )}
                    {isJ && (
                      <span className="absolute bottom-[-15px] text-[8px] font-extrabold font-mono text-rose-600 bg-rose-50 px-1 border border-rose-200 rounded uppercase">
                        j
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decoding metrics */}
          {(jVal !== -1 || lenVal !== -1) && (
            <div className="flex gap-4 justify-center items-center py-2 bg-slate-100/50 border border-slate-200/40 rounded-xl p-3 max-w-md mx-auto w-full text-xs font-mono">
              {jVal !== -1 && (
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-400 uppercase tracking-wider font-bold">Delimiter Position j</span>
                  <span className="font-bold text-rose-600 mt-0.5">{jVal} ('#')</span>
                </div>
              )}
              <span className="text-slate-350">|</span>
              {lenVal !== -1 && (
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-400 uppercase tracking-wider font-bold">Parsed Word Length</span>
                  <span className="font-bold text-indigo-600 mt-0.5">{lenVal} chars</span>
                </div>
              )}
              {jVal !== -1 && iVal > jVal && (
                <>
                  <span className="text-slate-350">|</span>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-400 uppercase tracking-wider font-bold">Extracted String</span>
                    <span className="font-extrabold text-emerald-600 mt-0.5">"{strVal.substring(jVal + 1, iVal)}"</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Decoded strings so far */}
          <div className="flex flex-col items-start gap-2 border-t border-slate-200/60 pt-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Decoded String List Output (list)
            </span>
            <div className="flex gap-2 flex-wrap min-h-[38px] items-center">
              {decodedList.length > 0 ? (
                decodedList.map((word, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="px-3 py-1.5 bg-emerald-50 border border-emerald-250 text-emerald-700 font-bold font-mono text-xs rounded-xl shadow-sm"
                  >
                    "{word}"
                  </motion.div>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No strings decoded yet</span>
              )}
            </div>
          </div>

          {/* Final success state badge */}
          {isDecodeComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl px-4 py-3 text-xs font-bold flex items-center gap-2 mt-1 shadow-sm text-left"
            >
              <span className="text-sm">✓</span> Deserialization Complete! Recovered original list of strings.
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
