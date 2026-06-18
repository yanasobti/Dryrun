exports.generate = (ctx) => {
  const { codeSnippet, currentVars, lastVars, getArrayVal } = ctx;

  const iVal = currentVars['i'];
  const numToday = iVal !== undefined ? (getArrayVal('nums', iVal) ?? getArrayVal('prices', iVal) ?? currentVars['nums[i]']) : null;
  const targetVal = currentVars['target'];
  const complementVal = currentVars['complement'];

  const hasTarget = targetVal !== undefined;
  const hasComplement = complementVal !== undefined;

  if (codeSnippet.includes('new HashMap') || codeSnippet.includes('new HashSet') || codeSnippet.includes('new java.util.HashMap') || codeSnippet.includes('new java.util.HashSet')) {
    return {
      title: "💡 HashMap Initialization",
      action: codeSnippet,
      explanation: `We initialize a hash structure to keep track of elements we visit in constant time.`,
      why: `A hash-based lookup allows us to instantly check if we've seen an element or its complement in O(1) average time, rather than scanning the entire history.`,
      stateVars: [],
      importance: "TRIVIAL"
    };
  }

  if (codeSnippet.includes('int complement =')) {
    return {
      title: "🧮 Complement Calculation",
      action: codeSnippet,
      explanation: `We calculate the complement (${targetVal} - ${numToday} = ${complementVal}) needed to sum up to our target (${targetVal}).`,
      why: `The complement tells us the exact value we need to find to complete our target sum.`,
      stateVars: [
        { name: "Current Number", val: numToday },
        { name: "Target Sum", val: targetVal },
        { name: "Complement Needed", val: complementVal }
      ],
      importance: "IMPORTANT"
    };
  }

  if (codeSnippet.includes('.containsKey') || codeSnippet.includes('.contains')) {
    const isDuplicateMatch = numToday !== null && lastVars['seen'] && String(lastVars['seen']).includes(String(numToday));
    const isSumMatch = hasComplement && lastVars['map'] && String(lastVars['map']).includes(String(complementVal));
    const isMatch = isDuplicateMatch || isSumMatch || codeSnippet.includes('contains');

    if (hasComplement && hasTarget && numToday !== null) {
      return {
        title: "🔎 HashMap Target Lookup",
        action: codeSnippet,
        explanation: `We check if we've already seen our complement ${complementVal} earlier in the array.`,
        why: `If yes, we've found our pair.`,
        stateVars: [
          { name: "Complement Needed", val: complementVal }
        ],
        importance: isMatch ? "CRITICAL" : "IMPORTANT"
      };
    }
    if (numToday !== null) {
      return {
        title: "🔎 Duplicate Element Search",
        action: codeSnippet,
        explanation: `We check if our hash structure already contains the value ${numToday}.`,
        why: `If yes, we have detected a duplicate element.`,
        stateVars: [
          { name: "Current Number", val: numToday }
        ],
        importance: isMatch ? "CRITICAL" : "IMPORTANT"
      };
    }
    return {
      title: "🔎 Hashing Query",
      action: codeSnippet,
      explanation: `We check if the element we need has already been encountered and stored.`,
      why: `To verify if our target criteria has been met.`,
      stateVars: [],
      importance: "IMPORTANT"
    };
  }

  if (codeSnippet.includes('.put') || codeSnippet.includes('.add')) {
    // Check if frequency increment/decrement (Valid Anagram pattern)
    if (codeSnippet.includes('+ 1') || codeSnippet.includes('- 1')) {
      const scVal = currentVars['sc'] !== undefined ? String(currentVars['sc']).replace(/['"]/g, '') : null;
      const tcVal = currentVars['tc'] !== undefined ? String(currentVars['tc']).replace(/['"]/g, '') : null;

      if (codeSnippet.includes('+ 1') && scVal) {
        return {
          title: "➕ Increment Frequency",
          action: codeSnippet,
          explanation: `We increment the frequency of '${scVal}' by 1 in our map.`,
          why: `This registers that string s contains this character.`,
          stateVars: [
            { name: "Char s[i]", val: `'${scVal}'` }
          ],
          importance: "IMPORTANT"
        };
      }
      if (codeSnippet.includes('- 1') && tcVal) {
        return {
          title: "➖ Decrement Frequency",
          action: codeSnippet,
          explanation: `We decrement the frequency of '${tcVal}' by 1 in our map.`,
          why: `This offsets the count since string t possesses this character.`,
          stateVars: [
            { name: "Char t[i]", val: `'${tcVal}'` }
          ],
          importance: "IMPORTANT"
        };
      }
    }

    if (numToday !== null) {
      return {
        title: "💾 Storing Visited Value",
        action: codeSnippet,
        explanation: `We store the current value ${numToday} ${iVal !== undefined ? `at index ${iVal}` : ''} in our hash structure.`,
        why: `This records it in memory for future lookups.`,
        stateVars: [
          { name: "Number stored", val: numToday }
        ],
        importance: "TRIVIAL"
      };
    }

    return {
      title: "💾 Saving Elements",
      action: codeSnippet,
      explanation: `We insert the element into our hash structure.`,
      why: `This establishes our historical scope for O(1) checks.`,
      stateVars: [],
      importance: "TRIVIAL"
    };
  }

  if (codeSnippet.includes('return ')) {
    return {
      title: "🏁 Returning Result",
      action: codeSnippet,
      explanation: `The search is finished and we yield our final output result.`,
      why: `The function execution is complete.`,
      stateVars: [],
      importance: "CRITICAL"
    };
  }

  return null;
};
