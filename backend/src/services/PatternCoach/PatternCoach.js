const HashMapCoach = require('./HashMapCoach');
const BinarySearchCoach = require('./BinarySearchCoach');
const SlidingWindowCoach = require('./SlidingWindowCoach');
const LinkedListCoach = require('./LinkedListCoach');
const TreeCoach = require('./TreeCoach');
const RecursionCoach = require('./RecursionCoach');
const GridCoach = require('./GridCoach');
const LRUCacheCoach = require('./LRUCacheCoach');

exports.generate = (codeLines, f, prevStep, stepIdx, pattern) => {
  const codeSnippet = codeLines[f.line - 1] ? codeLines[f.line - 1].trim() : "";
  const currentVars = f.variables || {};
  const arrays = f.arrays || {};
  const lastVars = prevStep ? prevStep.variables : {};
  const topFrame = f.stack && f.stack.length > 0 ? f.stack[f.stack.length - 1] : null;
  const methodName = topFrame ? topFrame.methodName : '';

  // Standardized helper to read array values safely
  const getArrayVal = (arrName, index) => {
    const arr = arrays[arrName];
    if (arr && Array.isArray(arr) && index >= 0 && index < arr.length) {
      return arr[index];
    }
    return null;
  };

  const context = {
    codeSnippet,
    f,
    prevStep,
    stepIdx,
    currentVars,
    arrays,
    lastVars,
    methodName,
    getArrayVal
  };

  const pat = (pattern || "").toLowerCase();

  // Route based on pattern
  const isLRU = pat.includes('lru') || 
                codeSnippet.includes('LRUCache') || 
                codeLines.some(line => line.includes('class LRUCache') || line.includes('Solution.LRUCache'));

  if (isLRU) {
    const res = LRUCacheCoach.generate(context);
    if (res) return res;
  }

  // Route based on pattern
  if (pat.includes('grid') || pat.includes('island') || pat.includes('flood') || pat.includes('matrix')) {
    const res = GridCoach.generate(context);
    if (res) return res;
  }

  if (pat.includes('hash') || pat.includes('anagram') || pat.includes('duplicate') || pat.includes('two sum') || pat.includes('arrays & hashing')) {
    const res = HashMapCoach.generate(context);
    if (res) return res;
  }
  
  if (pat.includes('binary search') || pat.includes('search') || pat.includes('koko')) {
    const res = BinarySearchCoach.generate(context);
    if (res) return res;
  }

  if (pat.includes('list') || pat.includes('cycle') || pat.includes('reverse') || pat.includes('slow') || pat.includes('fast')) {
    const res = LinkedListCoach.generate(context);
    if (res) return res;
  }

  if (pat.includes('window') || pat.includes('pointer') || pat.includes('stock') || pat.includes('profit')) {
    const res = SlidingWindowCoach.generate(context);
    if (res) return res;
  }

  if (pat.includes('tree') || pat.includes('depth')) {
    const res = TreeCoach.generate(context);
    if (res) return res;
  }

  if (pat.includes('recursion') || methodName === 'factorial') {
    const res = RecursionCoach.generate(context);
    if (res) return res;
  }

  // Code heuristics fallback (in case pattern is not specified or does not match)
  if (codeSnippet.includes('grid[') || codeSnippet.includes('matrix[') || codeSnippet.includes('image[')) {
    const res = GridCoach.generate(context);
    if (res) return res;
  }

  if (codeSnippet.includes('HashMap') || codeSnippet.includes('HashSet') || codeSnippet.includes('Map<') || codeSnippet.includes('Set<') || codeSnippet.includes('.containsKey') || codeSnippet.includes('.contains')) {
    const res = HashMapCoach.generate(context);
    if (res) return res;
  }

  if (codeSnippet.includes('left') && codeSnippet.includes('right') && (codeSnippet.includes('mid') || codeSnippet.includes('middle'))) {
    const res = BinarySearchCoach.generate(context);
    if (res) return res;
  }

  if (codeSnippet.includes('ListNode') || codeSnippet.includes('.next')) {
    const res = LinkedListCoach.generate(context);
    if (res) return res;
  }

  if (codeSnippet.includes('TreeNode') || codeSnippet.includes('.left') || codeSnippet.includes('.right')) {
    const res = TreeCoach.generate(context);
    if (res) return res;
  }

  return null;
};
