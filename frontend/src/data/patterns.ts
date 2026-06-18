import type { PatternDefinition } from '../types';

export const PATTERNS_DB: Record<string, PatternDefinition> = {
  "HashSet": {
    why: "Provides O(1) average time complexity for checking membership. Used to keep track of unique values we have already seen without modifying the source data.",
    clues: ["Check duplicates in a stream", "Lookup existence in constant time", "Unordered set of unique elements"],
    avoid: ["Nested loops with linear search - O(n²)", "Sorting first - O(n log n) which changes original ordering"],
    complexity: {
      time: "O(n)",
      space: "O(n)"
    }
  },
  "Frequency Map": {
    why: "Used to record counts of occurrences for elements (chars, integers). Perfect for comparing occurrences across two sources (e.g. anagram checks).",
    clues: ["Compare char frequency counts", "Check structural equality of configurations", "Track occurrences in a single pass"],
    avoid: ["Sorting strings/arrays - O(n log n) complexity", "Nested character loops"],
    complexity: {
      time: "O(n)",
      space: "O(k) where k is size of alphabet"
    }
  },
  "HashMap": {
    why: "Maps keys to values (e.g. element to its index) to achieve O(1) complements or reverse lookup. Extremely standard for the target-complement logic.",
    clues: ["Lookup indices of past elements", "Complement search (target - current)", "Two-pass or single-pass linear associations"],
    avoid: ["Nested loop brute force - O(n²)", "Sorting (loses original indices)"],
    complexity: {
      time: "O(n)",
      space: "O(n)"
    }
  },
  "Two Pointers": {
    why: "Uses two pointer variables moving from opposite ends (or relative offsets) to narrow search space on a sorted array, reducing space complexity to O(1).",
    clues: ["Sorted array/list inputs", "Finding pairs or triplets summing to target", "Palindrome validation from ends"],
    avoid: ["HashMap extra memory storage - O(n) space", "Nested index loops"],
    complexity: {
      time: "O(n)",
      space: "O(1)"
    }
  },
  "Sliding Window": {
    why: "Maintains a contiguous subset (window) of elements using left and right pointers. Dynamic resizing avoids recomputing subarrays from scratch.",
    clues: ["Find longest/shortest subarray satisfying constraints", "Contiguous subarray optimizations", "Continuous streams tracking"],
    avoid: ["Recomputing subarray stats at each index - O(n²) or O(n³)"],
    complexity: {
      time: "O(n)",
      space: "O(1) or O(k)"
    }
  },
  "Stack": {
    why: "Uses Last-In-First-Out (LIFO) order to match nested contexts, track dynamic operations, or parse structured text.",
    clues: ["Parentheses nesting matching", "Daily temperature spans (monotonically decreasing stack)", "Backtracking operations list"],
    avoid: ["Queue FIFO ordering", "Recursion state overlays (when iterative stack is cheaper)"],
    complexity: {
      time: "O(n)",
      space: "O(n)"
    }
  },
  "Binary Search": {
    why: "Reduces search space by half at each step (O(log n)) by comparing target to mid value on a sorted array.",
    clues: ["Sorted search space", "O(log n) time requirement", "Threshold/value optimization boundaries"],
    avoid: ["Linear scans - O(n) search time"],
    complexity: {
      time: "O(log n)",
      space: "O(1)"
    }
  },
  "Slow & Fast Pointers": {
    why: "Pointers moving at different velocities (slow moves 1 step, fast moves 2) converge at cyclic loops or identify midpoints in a single pass.",
    clues: ["Detect loop/cycle in Linked List", "Find linked list midpoint in one traversal", "Floyd's Tortoise and Hare"],
    avoid: ["Hashing nodes visited list - O(n) space"],
    complexity: {
      time: "O(n)",
      space: "O(1)"
    }
  },
  "DFS Recursion": {
    why: "Explores nodes deeply along tree branches using the call stack. Highly intuitive for trees traversal, validations, and parent-child calculations.",
    clues: ["Tree preorder/inorder/postorder traversal", "Height/depth structural questions", "Subtree comparisons"],
    avoid: ["BFS iteration when global depth checks are easier"],
    complexity: {
      time: "O(n)",
      space: "O(h) where h is tree height"
    }
  },
  "BFS / Level Order": {
    why: "Explores nodes level-by-level using a FIFO queue. Perfect for shortest path in unweighted graphs or capturing tree levels.",
    clues: ["Tree level grouping list", "Shortest path/distance layer-by-layer", "Iterative nodes processing by generation"],
    avoid: ["DFS traversal (requires tracking depth values manually)"],
    complexity: {
      time: "O(n)",
      space: "O(w) where w is max width of tree"
    }
  }
};
