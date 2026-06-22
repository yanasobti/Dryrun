export interface ExplanationResult {
  title: string;
  explanation: string;
  why: string;
}

export function getElementArray(step: any, frames: any[]): string[] {
  let arrVal = step.arrays?.['height'] || step.arrays?.['numbers'] || step.arrays?.['nums'] || step.arrays?.['s'] || step.arrays?.['s2'] || step.arrays?.['s1'];
  if (!arrVal) {
    for (const f of frames) {
      const found = f.arrays?.['height'] || f.arrays?.['numbers'] || f.arrays?.['nums'] || f.arrays?.['s'] || f.arrays?.['s2'] || f.arrays?.['s1'];
      if (found) {
        arrVal = found;
        break;
      }
    }
  }
  if (!arrVal || arrVal.length === 0) {
    let rawVal = step.variables?.['s'] || step.variables?.['s2'] || step.variables?.['s1'] || step.variables?.['nums'] || step.variables?.['height'];
    if (!rawVal) {
      for (const f of frames) {
        const found = f.variables?.['s'] || f.variables?.['s2'] || f.variables?.['s1'] || f.variables?.['nums'] || f.variables?.['height'];
        if (found) {
          rawVal = found;
          break;
        }
      }
    }
    if (typeof rawVal === 'string') {
      const cleaned = rawVal.replace(/^[\\'" ]+|[\\'" ]+$/g, '');
      if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
        try {
          arrVal = JSON.parse(cleaned);
        } catch(e) {
          arrVal = cleaned.split(',').map(x => x.trim());
        }
      } else {
        arrVal = cleaned.split('');
      }
    } else if (Array.isArray(rawVal)) {
      arrVal = rawVal;
    }
  }
  
  if (typeof arrVal === 'string') {
    arrVal = arrVal.replace(/^[\\'" ]+|[\\'" ]+$/g, '').split('');
  }
  
  return (arrVal || []).map((x: any) => String(x).replace(/^[\\'" ]+|[\\'" ]+$/g, ''));
}

export function generateEducationalExplanation(
  questionId: string,
  variables: Record<string, any>,
  prevVariables: Record<string, any>,
  arrays: Record<string, any[]>,
  currentStep: number,
  totalSteps: number,
  frames: any[] = []
): ExplanationResult {
  const getInt = (name: string, fallback: number = 0): number => {
    const val = variables[name];
    if (val === undefined) return fallback;
    return parseInt(String(val), 10);
  };

  const getPrevInt = (name: string, fallback: number = 0): number => {
    const val = prevVariables[name];
    if (val === undefined) return fallback;
    return parseInt(String(val), 10);
  };

  const left = getInt('left', -1);
  const right = getInt('right', -1);
  const prevLeft = getPrevInt('left', -1);
  const prevRight = getPrevInt('right', -1);

  if (currentStep === 0) {
    return {
      title: "🚀 Init Pointers",
      explanation: "Setting initial pointer boundaries.",
      why: "Initial state setup."
    };
  }

  if (currentStep >= totalSteps - 1) {
    return {
      title: "🏁 Finished",
      explanation: "Execution finished. Return final calculated result.",
      why: "Yielding final answer."
    };
  }

  // --- TWO POINTERS ---
  if (
    questionId === 'two-sum-ii-input-array-is-sorted' ||
    questionId === 'container-with-most-water' ||
    questionId === 'trapping-rain-water' ||
    questionId === '3sum' ||
    questionId === 'valid-palindrome'
  ) {
    const arr = getElementArray({ variables, arrays }, frames);
    let sVal = "";
    if (questionId === 'valid-palindrome') {
      sVal = arr.join('');
    }

    const valLeft = sVal ? sVal.charAt(left) : (arr[left] !== undefined ? arr[left] : '0');
    const valRight = sVal ? sVal.charAt(right) : (arr[right] !== undefined ? arr[right] : '0');
    const valLeftNum = Number(valLeft) || 0;
    const valRightNum = Number(valRight) || 0;

    switch (questionId) {
      case 'two-sum-ii-input-array-is-sorted': {
        const sum = getInt('sum', valLeftNum + valRightNum);
        const target = getInt('target', 0);
        if (sum === target) {
          return {
            title: "🎉 Sum Found",
            explanation: `Sum numbers[left] + numbers[right] = ${target}. Target sum matched!`,
            why: "Returning index positions."
          };
        } else if (sum < target) {
          return {
            title: "📈 Move Left",
            explanation: `Sum ${sum} < Target ${target}. Move LEFT pointer inward to increase sum.`,
            why: "Sorted array increases sum on moving left pointer."
          };
        } else {
          return {
            title: "📉 Move Right",
            explanation: `Sum ${sum} > Target ${target}. Move RIGHT pointer inward to decrease sum.`,
            why: "Sorted array decreases sum on moving right pointer."
          };
        }
      }

      case 'container-with-most-water': {
        const currentArea = (right - left) * Math.min(valLeftNum, valRightNum);
        const maxArea = getInt('maxArea', 0);
        const isNewMax = currentArea >= maxArea;

        return {
          title: isNewMax ? "🔥 New Max Area" : "💧 Area Calculation",
          explanation: `Area = ${currentArea} (width: ${right - left}, height: ${Math.min(valLeftNum, valRightNum)}).`,
          why: `Move the shorter wall (${valLeftNum < valRightNum ? 'L' : 'R'}) to seek a taller boundary.`
        };
      }

      case 'trapping-rain-water': {
        const prevLeftMax = getPrevInt('leftMax', 0);
        const prevRightMax = getPrevInt('rightMax', 0);

        if (left !== prevLeft && prevLeft !== -1) {
          const prevVal = Number(arr[prevLeft]);
          if (prevVal >= prevLeftMax) {
            return {
              title: "🧱 Update leftMax",
              explanation: `height[left] = ${prevVal} >= leftMax. Update leftMax to ${prevVal}. No water trapped.`,
              why: "Boundary updated."
            };
          } else {
            const trapped = prevLeftMax - prevVal;
            return {
              title: "💧 Water Trapped",
              explanation: `height[left] = ${prevVal} < leftMax (${prevLeftMax}). Trap ${trapped} unit(s) of water.`,
              why: "Water accumulated."
            };
          }
        } else if (right !== prevRight && prevRight !== -1) {
          const prevVal = Number(arr[prevRight]);
          if (prevVal >= prevRightMax) {
            return {
              title: "🧱 Update rightMax",
              explanation: `height[right] = ${prevVal} >= rightMax. Update rightMax to ${prevVal}. No water trapped.`,
              why: "Boundary updated."
            };
          } else {
            const trapped = prevRightMax - prevVal;
            return {
              title: "💧 Water Trapped",
              explanation: `height[right] = ${prevVal} < rightMax (${prevRightMax}). Trap ${trapped} unit(s) of water.`,
              why: "Water accumulated."
            };
          }
        }

        return {
          title: "🔍 Select Wall",
          explanation: `Compare boundaries: L (${valLeft}) vs R (${valRight}).`,
          why: "Process smaller wall side."
        };
      }

      case '3sum': {
        const i = getInt('i', 0);
        const sum = valLeftNum + valRightNum + Number(arr[i]);
        if (sum === 0) {
          return {
            title: "🎉 Triplet Match",
            explanation: `nums[i]+nums[L]+nums[R] = 0. Valid triplet found: [${arr[i]}, ${valLeft}, ${valRight}].`,
            why: "Record triplet and skip duplicate pointers."
          };
        } else if (sum < 0) {
          return {
            title: "📈 Move Left",
            explanation: `Sum ${sum} < 0. Move LEFT pointer inward to increase sum.`,
            why: "Searching for zero."
          };
        } else {
          return {
            title: "📉 Move Right",
            explanation: `Sum ${sum} > 0. Move RIGHT pointer inward to decrease sum.`,
            why: "Searching for zero."
          };
        }
      }

      case 'valid-palindrome': {
        const charL = String(valLeft).toLowerCase();
        const charR = String(valRight).toLowerCase();
        if (charL === charR) {
          return {
            title: "✅ Match",
            explanation: `'${valLeft}' == '${valRight}'. Move pointers inward.`,
            why: "Symmetry matches."
          };
        } else {
          return {
            title: "❌ Mismatch",
            explanation: `'${valLeft}' != '${valRight}'. Mismatch detected!`,
            why: "Symmetry broken."
          };
        }
      }
    }
  }

  // --- SLIDING WINDOW ---
  if (
    questionId === 'longest-substring-without-repeating-characters' ||
    questionId === 'longest-repeating-character-replacement' ||
    questionId === 'permutation-in-string' ||
    questionId === 'minimum-window-substring' ||
    questionId === 'sliding-window-maximum'
  ) {
    const arr = getElementArray({ variables, arrays }, frames);
    const sVal = arr.join('');

    const rightVal = getInt('right', -1);

    const isContracting = left !== prevLeft && prevLeft !== -1;

    switch (questionId) {
      case 'longest-substring-without-repeating-characters': {
        const charRight = sVal ? sVal.charAt(rightVal) : "";
        const charLeft = sVal ? sVal.charAt(left) : "";
        const subStr = sVal ? sVal.substring(left, rightVal + 1) : "";
        if (isContracting) {
          return {
            title: "📉 Shrink Window",
            explanation: `We found a duplicate character '${charRight}' in our substring set. We must shrink the window by evicting '${charLeft}' from the left side until '${charRight}' is unique again.`,
            why: `A sliding window substring cannot contain duplicates.`
          };
        } else {
          return {
            title: "📈 Expand Window",
            explanation: `We add '${charRight}' to our window. Since it is unique in our current set, the window is now valid: "${subStr}" (length ${rightVal - left + 1}).`,
            why: `Growing our window size to find the longest substring.`
          };
        }
      }

      case 'longest-repeating-character-replacement': {
        const k = getInt('k', 0);
        const maxCount = getInt('maxCount', 0);
        const len = rightVal - left + 1;
        const replacements = len - maxCount;
        const subStr = sVal ? sVal.substring(left, rightVal + 1) : "";
        if (isContracting) {
          return {
            title: "📉 Shrink Window",
            explanation: `Window is "${subStr}" (size ${len}). We need ${replacements} replacement(s) to make all characters match, which exceeds our budget of k = ${k}. We must shrink the window by moving L.`,
            why: `The required replacements (${len} - ${maxCount} = ${replacements}) exceed our allowed budget.`
          };
        } else {
          return {
            title: "📈 Expand Window",
            explanation: `Window is "${subStr}" (size ${len}). With the most frequent character appearing ${maxCount} times, we only need ${replacements} replacement(s). Since ${replacements} <= k (${k}), this window is VALID!`,
            why: `Valid window found. We update our max length to ${len}.`
          };
        }
      }

      case 'permutation-in-string': {
        let s1Str = "ab";
        for (const f of frames) {
          if (f.variables?.s1) {
            s1Str = String(f.variables.s1).replace(/['"]/g, '');
            break;
          }
        }
        let s2Str = "eidbaooo";
        for (const f of frames) {
          if (f.variables?.s2) {
            s2Str = String(f.variables.s2).replace(/['"]/g, '');
            break;
          }
        }

        const targetFreq: Record<string, number> = {};
        for (const c of s1Str) targetFreq[c] = (targetFreq[c] || 0) + 1;
        
        const windowStart = left;
        const windowEnd = Math.min(s2Str.length - 1, left + s1Str.length - 1);
        const windowStr = s2Str.substring(windowStart, windowEnd + 1);
        const windowFreq: Record<string, number> = {};
        for (const c of windowStr) windowFreq[c] = (windowFreq[c] || 0) + 1;

        let matchingUniqueCount = 0;
        for (const char of Object.keys(targetFreq)) {
          if (targetFreq[char] === (windowFreq[char] || 0)) {
            matchingUniqueCount++;
          }
        }
        const totalUnique = Object.keys(targetFreq).length;
        const isPerfect = matchingUniqueCount === totalUnique;

        if (currentStep < 5 && left === 0) {
          return {
            title: "📊 Init Frequencies",
            explanation: `We populate the target counts for s1 ("${s1Str}") and the initial window of s2 ("${windowStr}").`,
            why: `Need to compare target vs initial window of size ${s1Str.length}.`
          };
        }

        if (isPerfect) {
          return {
            title: "✅ PERFECT MATCH",
            explanation: `Success! All character frequencies match between target s1 and current window: "${windowStr}".`,
            why: `Found permutation! Return true.`
          };
        }

        return {
          title: "❌ Not a Permutation",
          explanation: `Compare s1 vs window "${windowStr}". We have ${matchingUniqueCount} / ${totalUnique} characters matched.`,
          why: `Slide the fixed-size window right to check the next position.`
        };
      }

      case 'minimum-window-substring': {
        const have = getInt('have', 0);
        const need = getInt('need', 0);
        const subStr = sVal ? sVal.substring(left, rightVal + 1) : "";
        if (isContracting) {
          return {
            title: "📉 Shrink Window",
            explanation: `Our current window "${subStr}" contains all target characters (have = ${have} / need = ${need}). Now we move L right to shrink the window and find the smallest possible valid substring.`,
            why: `Minimizing the window size to find the absolute minimum substring.`
          };
        } else {
          return {
            title: "📈 Expand Window",
            explanation: `We are missing required target characters from t (have = ${have} < need = ${need}). Moving R right to expand the window and search for them.`,
            why: `Expanding the window until we contain all characters required by t.`
          };
        }
      }

      case 'sliding-window-maximum': {
        const valRight = arr[rightVal] !== undefined ? Number(arr[rightVal]) : 0;
        return {
          title: "📥 Process Element",
          explanation: `We process nums[right] = ${valRight}. We pop all indices from our monotonic queue whose values are smaller than ${valRight}, as they can never be the maximum in any future window.`,
          why: `Maintaining the queue in decreasing order to find the maximum in each window.`
        };
      }
    }
  }

  return {
    title: "🔍 Process Step",
    explanation: "Executing loop step.",
    why: "Sequential evaluation."
  };
}
