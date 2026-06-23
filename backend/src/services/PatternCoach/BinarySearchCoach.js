exports.generate = (ctx) => {
  const { codeSnippet, currentVars, lastVars, getArrayVal } = ctx;

  const leftVal = currentVars['left'] ?? currentVars['low'];
  const rightVal = currentVars['right'] ?? currentVars['high'];
  const midVal = currentVars['mid'];
  const targetVal = currentVars['target'];
  
  // Try to find the array name being used in binary search
  const arrayName = Object.keys(ctx.arrays)[0] || 'nums';
  const midItem = midVal !== undefined ? getArrayVal(arrayName, midVal) : null;

  if (codeSnippet.includes('left = 0') || codeSnippet.includes('low = 0')) {
    return {
      title: "📍 Initializing Low Boundary",
      action: codeSnippet,
      explanation: `We initialize our lower boundary pointer at index 0.`,
      why: `To define the start of our search space, spanning the beginning of the sorted array.`,
      stateVars: [
        { name: "Search Low (left)", val: 0 }
      ],
      importance: "TRIVIAL"
    };
  }

  if (codeSnippet.includes('right =') || codeSnippet.includes('high =')) {
    return {
      title: "📍 Initializing High Boundary",
      action: codeSnippet,
      explanation: `We initialize our upper boundary pointer at the last index of the array (${rightVal ?? 'length - 1'}).`,
      why: `To set the initial upper boundary of our search scope, defining the complete search window.`,
      stateVars: [
        { name: "Search High (right)", val: rightVal }
      ],
      importance: "TRIVIAL"
    };
  }

  if (codeSnippet.includes('while (left <= right)') || codeSnippet.includes('while (low <= high)')) {
    return {
      title: "🔄 Boundary Intersection Check",
      action: codeSnippet,
      explanation: `We continue searching as long as our search range [${leftVal ?? 'low'}, ${rightVal ?? 'high'}] contains at least one element.`,
      why: `If the boundaries cross (low > high), the search space has shrunk to nothing, meaning the target does not exist in the array.`,
      stateVars: [
        { name: "Low (left)", val: leftVal },
        { name: "High (right)", val: rightVal }
      ],
      importance: "TRIVIAL"
    };
  }

  if (codeSnippet.includes('mid =')) {
    return {
      title: "🎯 Calculate Midpoint",
      action: codeSnippet,
      explanation: `We calculate the middle index of our current search range: mid = ${midVal}.`,
      why: `This splits the remaining search space in half, allowing us to narrow the search logarithmically in O(log N) steps.`,
      stateVars: [
        { name: "Low (left)", val: leftVal },
        { name: "High (right)", val: rightVal },
        { name: "Mid Index", val: midVal }
      ],
      importance: "IMPORTANT"
    };
  }

  if (codeSnippet.includes('== target')) {
    const isTargetMatch = midItem !== null && targetVal !== undefined && Number(midItem) === Number(targetVal);
    return {
      title: "✅ Equal Target Check",
      action: codeSnippet,
      explanation: `We check if the middle element (${midItem ?? 'at mid'}) is equal to our target (${targetVal ?? 'target'}).`,
      why: `If it matches, the target is successfully found, and we return the middle index ${midVal}.`,
      stateVars: [
        { name: "Value at Mid", val: midItem },
        { name: "Target Value", val: targetVal }
      ],
      importance: isTargetMatch ? "CRITICAL" : "IMPORTANT"
    };
  }

  if (codeSnippet.includes('< target') || codeSnippet.includes('<')) {
    if (midItem !== null && targetVal !== undefined) {
      return {
        title: "⚡ Midpoint Too Small Check",
        action: codeSnippet,
        explanation: `Middle value (${midItem}) is too small compared to our target (${targetVal}). Since the array is sorted, everything to the left is also too small.`,
        why: `This allows us to safely eliminate the left half of the search space.`,
        stateVars: [
          { name: "Value at Mid", val: midItem },
          { name: "Target Value", val: targetVal }
        ],
        importance: "IMPORTANT"
      };
    }
    return {
      title: "⚡ Midpoint Too Small Check",
      action: codeSnippet,
      explanation: `The value at mid is too small compared to our target.`,
      why: `Since the array is sorted, all elements to the left of mid are also too small and can be discarded.`,
      stateVars: [],
      importance: "IMPORTANT"
    };
  }

  if (codeSnippet.includes('> target') || codeSnippet.includes('>')) {
    if (midItem !== null && targetVal !== undefined) {
      return {
        title: "⚡ Midpoint Too Large Check",
        action: codeSnippet,
        explanation: `Middle value (${midItem}) is too large compared to our target (${targetVal}). Since the array is sorted, everything to the right is also too large.`,
        why: `This allows us to safely eliminate the right half of the search space.`,
        stateVars: [
          { name: "Value at Mid", val: midItem },
          { name: "Target Value", val: targetVal }
        ],
        importance: "IMPORTANT"
      };
    }
    return {
      title: "⚡ Midpoint Too Large Check",
      action: codeSnippet,
      explanation: `The value at mid is too large compared to our target.`,
      why: `Since the array is sorted, all elements to the right of mid are also too large and can be discarded.`,
      stateVars: [],
      importance: "IMPORTANT"
    };
  }

  if (codeSnippet.includes('left = mid + 1') || codeSnippet.includes('low = mid + 1')) {
    const valObj = currentVars['val'] !== undefined ? currentVars['val'] : (midItem !== null ? midItem : null);
    const valText = valObj !== null ? `value ${valObj}` : `the middle value`;
    const targetText = targetVal !== undefined ? `our target (${targetVal})` : `our target`;
    return {
      title: "➡️ Shift Left Boundary (Search Space Eliminated)",
      action: codeSnippet,
      explanation: `We checked ${valText}, which is smaller than ${targetText}. Since the search space is sorted, everything to the left is also too small and can be ignored. Move the left boundary right to index ${leftVal}.`,
      why: `This updates our search window to target only the remaining larger elements in the right half.`,
      stateVars: [
        { name: "New Left Boundary", val: leftVal }
      ],
      importance: "CRITICAL"
    };
  }

  if (codeSnippet.includes('right = mid - 1') || codeSnippet.includes('high = mid - 1')) {
    const valObj = currentVars['val'] !== undefined ? currentVars['val'] : (midItem !== null ? midItem : null);
    const valText = valObj !== null ? `value ${valObj}` : `the middle value`;
    const targetText = targetVal !== undefined ? `our target (${targetVal})` : `our target`;
    return {
      title: "⬅️ Shift Right Boundary (Search Space Eliminated)",
      action: codeSnippet,
      explanation: `We checked ${valText}, which is larger than ${targetText}. Since the search space is sorted, everything to the right is also too large and can be ignored. Move the right boundary left to index ${rightVal}.`,
      why: `This updates our search window to target only the remaining smaller elements in the left half.`,
      stateVars: [
        { name: "New Right Boundary", val: rightVal }
      ],
      importance: "CRITICAL"
    };
  }

  if (codeSnippet.includes('return ')) {
    return {
      title: "🏁 Returning Result",
      action: codeSnippet,
      explanation: `We return the final index or status result of our binary search.`,
      why: `This terminates the search path and yields the result.`,
      stateVars: [],
      importance: "CRITICAL"
    };
  }

  return null;
};
