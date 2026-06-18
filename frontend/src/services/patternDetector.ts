export interface PatternInsight {
  name: string;
  category: string;
  confidence: number;
  clues: string[];
  whyFits: string[];
  alternatives: string[];
  description: string;
}

const PATTERNS: Record<string, PatternInsight> = {
  TWO_POINTERS: {
    name: "Two Pointers",
    category: "Arrays & Strings",
    confidence: 0.9,
    clues: [
      "Input is sorted (or can be sorted)",
      "Target sum, pairs, or triplets need to be found",
      "Need to compare elements from two different positions in one pass"
    ],
    whyFits: [
      "Allows searching pairs or segments in linear time O(N) instead of quadratic O(N²)",
      "Avoids nested loops by maintaining pointers that move inward or in parallel",
      "Keeps space complexity O(1) by using constant pointers"
    ],
    alternatives: [
      "Brute force nested loops: Easy to write but runs in O(N²), which will TLE for large arrays.",
      "Hash Map lookup: Fast O(N) time but costs O(N) extra memory space."
    ],
    description: "Two pointers move through the data structure in tandem or opposing directions to examine pairs or subarrays without nested iterations."
  },
  SLIDING_WINDOW: {
    name: "Sliding Window",
    category: "Arrays & Strings",
    confidence: 0.95,
    clues: [
      "Problem asks for a subarray or substring (e.g., longest, shortest, subsegment)",
      "Input is linear (array, list, or string)",
      "Constraints require an O(N) time complexity"
    ],
    whyFits: [
      "Maintains a running subarray state by adding elements on the right and shrinking on the left",
      "Avoids re-evaluating overlapping subproblems from scratch, leading to O(N) time",
      "Dynamically adjusts window size depending on condition validation"
    ],
    alternatives: [
      "Re-computing every subarray: Starting a new inner loop from each element runs in O(N²), doing redundant work."
    ],
    description: "A window defined by two pointers slides over a linear data structure to check subsegments with minimal redundant operations."
  },
  BINARY_SEARCH: {
    name: "Binary Search",
    category: "Search & Divide & Conquer",
    confidence: 0.9,
    clues: [
      "Search space is sorted or has monotonic properties (yes/no behavior)",
      "Time limit demands logarithmic complexity O(log N)",
      "Finding a specific value, bounds, or peak element"
    ],
    whyFits: [
      "Cuts the search space in half at each step, achieving logarithmic time",
      "Relies on a mid-point calculation and conditional checking to discard halves",
      "Works on both arrays and numerical answer spaces (Binary Search on Answer)"
    ],
    alternatives: [
      "Linear scan: Inspecting every element one-by-one is simple but takes O(N) time, which fails strict time limits."
    ],
    description: "A divide-and-conquer strategy that continuously divides a sorted search space in half until the target is located."
  },
  DFS: {
    name: "Depth-First Search (DFS)",
    category: "Trees & Graphs",
    confidence: 0.85,
    clues: [
      "Need to explore all possible paths or configurations",
      "Looking for connectivity, cycle detection, or topological order",
      "Tree traversals (inorder, preorder, postorder)"
    ],
    whyFits: [
      "Explores deep down a branch before backtracking, which naturally fits recursion stacks",
      "Simpler to write recursively compared to iterative traversal",
      "Uses O(H) call stack space, where H is the height of the tree/graph path"
    ],
    alternatives: [
      "Breadth-First Search (BFS): Better for shortest paths on unweighted graphs, but requires queue management and more memory for wide layers."
    ],
    description: "An exploration strategy that walks as far as possible down each branch before backtracking."
  },
  BFS: {
    name: "Breadth-First Search (BFS)",
    category: "Trees & Graphs",
    confidence: 0.85,
    clues: [
      "Shortest path in an unweighted grid or graph is required",
      "Level-by-level traversal is needed (e.g., Tree Level Order)",
      "Finding the minimum number of operations to reach a state"
    ],
    whyFits: [
      "Explores all neighbors at distance D before looking at D+1, ensuring shortest path discovery first",
      "Avoids infinite loops in cyclic graphs through visited sets"
    ],
    alternatives: [
      "Depth-First Search (DFS): Can find a path but does not guarantee the *shortest* path first, requiring exhaustive exploration."
    ],
    description: "An exploration strategy that visits all node neighbors layer-by-layer using a queue."
  },
  HASH_MAP: {
    name: "Hash Map / Frequency Counter",
    category: "Data Structures",
    confidence: 0.9,
    clues: [
      "Need constant time O(1) lookups or frequency counts",
      "Need to check if a value has been seen before in the traversal",
      "Comparing duplicates or matching values quickly"
    ],
    whyFits: [
      "Saves index/value pairs in memory for instant verification while scanning the data structure",
      "Trades memory space O(N) to reduce search time from O(N²) to O(N)"
    ],
    alternatives: [
      "Sorting first: Takes O(N log N) time and alters the order of elements, which might not be allowed.",
      "Nested loop scan: Takes O(N²) time but uses O(1) extra space."
    ],
    description: "Uses a hash table to store associations (keys and values) for amortized constant-time inserts, updates, and retrievals."
  },
  RECURSION_DP: {
    name: "Dynamic Programming / Recursion",
    category: "Dynamic Programming",
    confidence: 0.8,
    clues: [
      "Optimal solution to a problem contains optimal solutions to subproblems",
      "Overlapping subproblems exist (same states calculated repeatedly)",
      "Minimization, maximization, or count of combinations"
    ],
    whyFits: [
      "Solves subproblems once and caches the result (memoization/tabulation) to avoid exponential time complexity O(2^N)",
      "Builds results bottom-up or solves top-down with memoization"
    ],
    alternatives: [
      "Naive recursion: Straightforward but recalculates overlapping states repeatedly, resulting in an O(2^N) time complexity (e.g., naive Fibonacci)."
    ],
    description: "An optimization method that solves complex problems by breaking them down into simpler, overlapping subproblems and caching their results."
  }
};

const DEFAULT_PATTERN: PatternInsight = {
  name: "Line-by-Line Execution Flow",
  category: "General Program flow",
  confidence: 0.5,
  clues: [
    "General algorithm or utility logic",
    "No distinct visual structure indicators found"
  ],
  whyFits: [
    "Simulates how the JVM executes code sequentially, checking condition branches and variable mutations"
  ],
  alternatives: [
    "Custom tracing: Debuggers show lines, but DryRun visualizes variables and stacks dynamically to build mental models."
  ],
  description: "Traces sequential code statements, loop checkpoints, and function stack frames step-by-step."
};

/**
 * Heuristic code analyzer to detect algorithm patterns
 */
export function detectPattern(code: string): PatternInsight {
  if (!code) return DEFAULT_PATTERN;

  const normalized = code.replace(/\s+/g, ' ');

  // 1. Linked List Cycle / Two pointer lists
  if (
    (normalized.includes("ListNode fast") || normalized.includes("ListNode slow")) &&
    (normalized.includes(".next") || normalized.includes("head"))
  ) {
    return PATTERNS.TWO_POINTERS; // list cycle is Two Pointers / Slow-Fast
  }

  // 2. Binary Search
  if (
    normalized.includes("mid =") ||
    normalized.includes("low <=") ||
    normalized.includes("left <=") ||
    (normalized.includes("binarySearch") || normalized.includes("binary_search")) ||
    (normalized.includes("mid = left +") && normalized.includes("right ="))
  ) {
    return PATTERNS.BINARY_SEARCH;
  }

  // 3. Sliding Window
  if (
    (normalized.includes("window") || normalized.includes("left = 0")) &&
    (normalized.includes("Math.max") || normalized.includes("maxLength") || normalized.includes("minLen")) &&
    (normalized.includes("while (") || normalized.includes("for (")) &&
    normalized.includes("right")
  ) {
    return PATTERNS.SLIDING_WINDOW;
  }

  // 4. Two Pointers (Standard Array)
  if (
    (normalized.includes("left = 0") || normalized.includes("i = 0, j =")) &&
    (normalized.includes("left < right") || normalized.includes("i < j")) &&
    (normalized.includes("left++") || normalized.includes("right--") || normalized.includes("i++") || normalized.includes("j--"))
  ) {
    return PATTERNS.TWO_POINTERS;
  }

  // 5. Hash Map
  if (
    normalized.includes("Map<") ||
    normalized.includes("HashMap<") ||
    normalized.includes("map.put") ||
    normalized.includes("map.containsKey") ||
    normalized.includes("HashSet") ||
    normalized.includes("Set<")
  ) {
    return PATTERNS.HASH_MAP;
  }

  // 6. Recursion & DP
  const recursionKeywords = ["memo", "memoization", "dp[", "dp = new", "Integer[][]", "Math.min(", "Math.max("];
  const isRecursiveCall = code.match(/(\w+)\s*\([^)]*\)\s*\{[\s\S]*?\1\s*\(/); // checks if function name appears inside its body
  if (isRecursiveCall || recursionKeywords.some(keyword => normalized.includes(keyword))) {
    return PATTERNS.RECURSION_DP;
  }

  // 7. Graph DFS/BFS
  if (normalized.includes("Queue<") && (normalized.includes("poll()") || normalized.includes("add("))) {
    return PATTERNS.BFS;
  }
  if (
    (normalized.includes("visited[") || normalized.includes("visited.add")) &&
    (normalized.includes("dfs(") || normalized.includes("traverse("))
  ) {
    return PATTERNS.DFS;
  }

  return DEFAULT_PATTERN;
}
