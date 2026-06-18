export type VisualEventType =
  | 'METHOD_ENTER'
  | 'METHOD_EXIT'
  | 'LOOP_ENTER'
  | 'LOOP_ITERATION'
  | 'LOOP_EXIT'
  | 'ARRAY_ACCESS'
  | 'ARRAY_UPDATE'
  | 'SEARCH_MAP'
  | 'MAP_INSERT'
  | 'MATCH_FOUND'
  | 'MID_CALC'
  | 'COMPARE'
  | 'POINTER_SHIFT'
  | 'ARITHMETIC'
  | 'INIT_MAP'
  | 'NONE';

export type AnimationType = 'drop' | 'pulse' | 'slide' | 'glow' | 'none';

export interface VisualEvent {
  type: VisualEventType;
  details: Record<string, any>;
  priority: number;
  animation?: AnimationType;
}

// Helper to parse Map elements from Java HashMap toString (e.g. "{2=0, 7=1}")
const parseMapEntries = (mapStr: string): [string, string][] => {
  if (!mapStr || mapStr === "null") return [];
  const str = mapStr.trim();
  const startIdx = str.indexOf('{');
  const endIdx = str.lastIndexOf('}');
  if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) return [];
  const inner = str.substring(startIdx + 1, endIdx).trim();
  if (!inner) return [];
  return inner.split(',').map(pair => {
    const parts = pair.split('=');
    if (parts.length >= 2) {
      return [parts[0].trim(), parts[1].trim()];
    }
    return [pair.trim(), ""];
  });
};

const parseSetEntries = (setStr: string): string[] => {
  if (!setStr || setStr === "null") return [];
  const str = setStr.trim();
  const startIdx = str.indexOf('[');
  const endIdx = str.lastIndexOf(']');
  if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) return [];
  const inner = str.substring(startIdx + 1, endIdx).trim();
  if (!inner) return [];
  return inner.split(',').map(item => item.trim()).filter(Boolean);
};

export const getVisualEvents = (currentFrame: any, prevFrame: any): VisualEvent[] => {
  const events: VisualEvent[] = [];
  if (!currentFrame) return events;

  const codeLine = currentFrame.code || "";
  const code = codeLine.trim();
  const variables = currentFrame.variables || {};
  const prevVariables = prevFrame ? (prevFrame.variables || {}) : {};
  const arrays = currentFrame.arrays || {};
  const prevArrays = prevFrame ? (prevFrame.arrays || {}) : {};
  const stack = currentFrame.stack || [];
  const prevStack = prevFrame ? (prevFrame.stack || []) : [];

  // 1. Method Enter / Exit Stack changes
  if (stack.length > prevStack.length) {
    events.push({
      type: 'METHOD_ENTER',
      details: { methodName: stack[stack.length - 1]?.methodName || 'method' },
      priority: 90,
      animation: 'slide'
    });
  } else if (stack.length < prevStack.length) {
    events.push({
      type: 'METHOD_EXIT',
      details: { methodName: prevStack[prevStack.length - 1]?.methodName || 'method' },
      priority: 90,
      animation: 'slide'
    });
  }

  // 2. HashMap/HashSet Collections Insertions
  Object.entries(variables).forEach(([k, val]) => {
    if (k === 'args') return;
    const vStr = String(val);
    if (vStr.includes('HashMap') || vStr.includes('Map') || (vStr.includes('{') && vStr.includes('}'))) {
      const prevVal = prevVariables[k];
      const currentEntries = parseMapEntries(vStr);
      const prevEntries = prevVal ? parseMapEntries(String(prevVal)) : [];

      if (currentEntries.length > prevEntries.length) {
        const added = currentEntries.find(([ck]) => !prevEntries.some(([pk]) => pk === ck));
        if (added) {
          events.push({
            type: 'MAP_INSERT',
            details: { name: k, key: added[0], value: added[1] },
            priority: 60,
            animation: 'drop'
          });
        }
      }
    } else if (vStr.includes('HashSet') || vStr.includes('Set') || vStr.includes('TreeSet') || (vStr.includes('[') && vStr.includes(']') && !vStr.includes('class') && !Array.isArray(val) && !/\b\w+\[\d*\]/.test(vStr) && !vStr.includes('(#'))) {
      const prevVal = prevVariables[k];
      const currentValues = parseSetEntries(vStr);
      const prevValues = prevVal ? parseSetEntries(String(prevVal)) : [];

      if (currentValues.length > prevValues.length) {
        const added = currentValues.find(cv => !prevValues.includes(cv));
        if (added) {
          events.push({
            type: 'MAP_INSERT',
            details: { name: k, key: added, value: '' },
            priority: 60,
            animation: 'drop'
          });
        }
      }
    }
  });

  // 3. HashMap/HashSet Lookup checks (.containsKey, .contains, .get)
  if (code.includes('containsKey(') || code.includes('contains(') || code.includes('.get(')) {
    let compVal = variables['complement'] !== undefined ? variables['complement'] : variables['key'] !== undefined ? variables['key'] : null;
    
    if (compVal === null) {
      const iVal = variables['i'];
      const numsArr = arrays['nums'];
      if (numsArr && iVal !== undefined && numsArr[iVal] !== undefined) {
        compVal = numsArr[iVal];
      } else if (variables['num'] !== undefined) {
        compVal = variables['num'];
      }
    }

    if (compVal !== null) {
      let exists = false;
      Object.entries(variables).forEach(([_, val]) => {
        const sStr = String(val);
        if (sStr.includes('{') && sStr.includes('}')) {
          const currentEntries = parseMapEntries(sStr);
          if (currentEntries.some(([key]) => key === String(compVal))) {
            exists = true;
          }
        } else if (sStr.includes('[') && sStr.includes(']') && !sStr.includes('class') && !Array.isArray(val) && !/\b\w+\[\d*\]/.test(sStr) && !sStr.includes('(#')) {
          const setVals = parseSetEntries(sStr);
          if (setVals.includes(String(compVal))) {
            exists = true;
          }
        }
      });
      events.push({
        type: 'SEARCH_MAP',
        details: { key: compVal, exists },
        priority: 80,
        animation: 'pulse'
      });
    }
  }

  // 4. Array updates (State comparison)
  Object.entries(arrays).forEach(([name, vals]) => {
    if (Array.isArray(vals)) {
      const prevVals = prevArrays[name];
      if (Array.isArray(prevVals)) {
        for (let idx = 0; idx < vals.length; idx++) {
          if (vals[idx] !== prevVals[idx]) {
            events.push({
              type: 'ARRAY_UPDATE',
              details: { name, index: idx, val: vals[idx], prevVal: prevVals[idx] },
              priority: 75,
              animation: 'pulse'
            });
          }
        }
      }
    }
  });

  // 5. Arithmetic / target calculation (e.g. complement = target - nums[i])
  if (code.includes('complement =') || code.includes(' = target - ') || code.includes(' - min') || code.includes('prices[i] -')) {
    const targetVal = variables['target'];
    const iVal = variables['i'];
    const complementVal = variables['complement'];

    if (complementVal !== undefined) {
      events.push({
        type: 'ARITHMETIC',
        details: { target: targetVal, needed: complementVal, index: iVal },
        priority: 35,
        animation: 'glow'
      });
    }
    
    // Support stock profit margins Math.max(profit, prices[i] - min)
    const minVal = variables['min'];
    const profitVal = variables['profit'];
    if (minVal !== undefined && profitVal !== undefined && iVal !== undefined) {
      events.push({
        type: 'ARITHMETIC',
        details: { min: minVal, profit: profitVal, index: iVal },
        priority: 35,
        animation: 'glow'
      });
    }
  }

  // 6. Midpoint calculation
  if (code.includes('mid =') && variables['mid'] !== undefined) {
    events.push({
      type: 'MID_CALC',
      details: { left: variables['left'], right: variables['right'], mid: variables['mid'] },
      priority: 45
    });
  }

  // 7. Comparisons (==, <, >, !=)
  if (code.includes('==') || code.includes('<') || code.includes('>') || code.includes('!=')) {
    const midVal = variables['mid'];
    const targetVal = variables['target'];
    const iVal = variables['i'];
    events.push({
      type: 'COMPARE',
      details: { mid: midVal, target: targetVal, index: iVal, code },
      priority: 50,
      animation: 'pulse'
    });
  }

  // 8. Pointer shifts
  const ptrs = ['left', 'right', 'i', 'j', 'low', 'high', 'slow', 'fast'];
  ptrs.forEach((ptr) => {
    if (variables[ptr] !== undefined && prevVariables[ptr] !== undefined && variables[ptr] !== prevVariables[ptr]) {
      events.push({
        type: 'POINTER_SHIFT',
        details: { pointer: ptr, from: prevVariables[ptr], to: variables[ptr] },
        priority: 25,
        animation: 'slide'
      });
    }
  });

  // 9. Array generic accesses
  const activePtr = variables['i'] !== undefined ? 'i' : variables['mid'] !== undefined ? 'mid' : variables['j'] !== undefined ? 'j' : null;
  if (activePtr && variables[activePtr] !== undefined) {
    events.push({
      type: 'ARRAY_ACCESS',
      details: { pointer: activePtr, index: variables[activePtr] },
      priority: 15
    });
  }

  // 10. Loop Control
  if (code.includes('for (') || code.includes('while (')) {
    const iVal = variables['i'];
    if (iVal !== undefined && prevVariables['i'] === undefined) {
      events.push({ type: 'LOOP_ENTER', details: { pointer: 'i', val: iVal }, priority: 20 });
    } else if (iVal !== undefined && prevVariables['i'] !== undefined && iVal !== prevVariables['i']) {
      events.push({ type: 'LOOP_ITERATION', details: { pointer: 'i', val: iVal }, priority: 20 });
    }
  }

  // 11. Match Found / Solution returns
  if (code.includes('return new int[]') || (code.includes('return ') && !code.includes('return -1') && !code.includes('return false') && !code.includes('return new int[] {}'))) {
    events.push({
      type: 'MATCH_FOUND',
      details: { i: variables['i'], complement: variables['complement'] },
      priority: 100,
      animation: 'glow'
    });
  }

  return events;
};
