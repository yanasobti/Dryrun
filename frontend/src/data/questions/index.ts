import containsDuplicate from './arrays/contains-duplicate';
import validAnagram from './arrays/valid-anagram';
import twoSum from './arrays/two-sum';
import bestTimeToBuyAndSellStock from './arrays/best-time-to-buy-and-sell-stock';
import productOfArrayExceptSelf from './arrays/product-of-array-except-self';
import binarySearch from './binary-search/binary-search';
import searchMatrix from './binary-search/search-a-2d-matrix';
import kokoEatingBananas from './binary-search/koko-eating-bananas';
import findMinInRotatedSortedArray from './binary-search/find-minimum-in-rotated-sorted-array';
import searchInRotatedSortedArray from './binary-search/search-in-rotated-sorted-array';
import timeBasedKeyValueStore from './binary-search/time-based-key-value-store';
import medianOfTwoSortedArrays from './binary-search/median-of-two-sorted-arrays';
import reverseLinkedList from './linked-list/reverse-linked-list';
import linkedListCycle from './linked-list/linked-list-cycle';
import mergeTwoSortedLists from './linked-list/merge-two-sorted-lists';
import reorderList from './linked-list/reorder-list';
import removeNthNodeFromEnd from './linked-list/remove-nth-node-from-end-of-list';
import copyListWithRandomPointer from './linked-list/copy-list-with-random-pointer';
import addTwoNumbers from './linked-list/add-two-numbers';
import findTheDuplicateNumber from './linked-list/find-the-duplicate-number';
import lruCache from './linked-list/lru-cache';
import mergeKSortedLists from './linked-list/merge-k-sorted-lists';
import reverseNodesInKGroup from './linked-list/reverse-nodes-in-k-group';
import maximumDepthOfBinaryTree from './trees/max-depth';
import invertBinaryTree from './trees/invert-binary-tree';
import lowestCommonAncestorOfBst from './trees/lca-bst';
import diameterOfBinaryTree from './trees/diameter-of-binary-tree';
import balancedBinaryTree from './trees/balanced-binary-tree';
import binaryTreeLevelOrderTraversal from './trees/binary-tree-level-order-traversal';
import binaryTreeRightSideView from './trees/binary-tree-right-side-view';
import countGoodNodesInBinaryTree from './trees/count-good-nodes-in-binary-tree';
import validateBinarySearchTree from './trees/validate-binary-search-tree';
import kthSmallestElementInABst from './trees/kth-smallest-element-in-a-bst';
import sameTree from './trees/same-tree';
import subtreeOfAnotherTree from './trees/subtree-of-another-tree';
import binaryTreeMaximumPathSum from './trees/binary-tree-maximum-path-sum';
import constructBinaryTreeFromTraversals from './trees/construct-binary-tree-from-preorder-and-inorder-traversal';
import serializeAndDeserializeBinaryTree from './trees/serialize-and-deserialize-binary-tree';
import subsets from './backtracking/subsets';
import topKFrequentElements from './heap/top-k-frequent-elements';
import floodFill from './matrix/flood-fill';
import setMatrixZeroes from './matrix/set-matrix-zeroes';
import numberOfIslands from './graphs/number-of-islands';
import cloneGraph from './graphs/clone-graph';
import courseSchedule from './graphs/course-schedule';
import groupAnagrams from './arrays/group-anagrams';
import encodeAndDecodeStrings from './arrays/encode-and-decode-strings';
import validSudoku from './arrays/valid-sudoku';
import longestConsecutiveSequence from './arrays/longest-consecutive-sequence';
import validPalindrome from './two-pointers/valid-palindrome';
import twoSumIi from './two-pointers/two-sum-ii-input-array-is-sorted';
import threeSum from './two-pointers/3sum';
import containerWithMostWater from './two-pointers/container-with-most-water';
import trappingRainWater from './two-pointers/trapping-rain-water';
import longestSubstringWithoutRepeatingCharacters from './sliding-window/longest-substring-without-repeating-characters';
import longestRepeatingCharacterReplacement from './sliding-window/longest-repeating-character-replacement';
import permutationInString from './sliding-window/permutation-in-string';
import minimumWindowSubstring from './sliding-window/minimum-window-substring';
import slidingWindowMaximum from './sliding-window/sliding-window-maximum';
import validParentheses from './stack/valid-parentheses';
import dailyTemperatures from './stack/daily-temperatures';
import minStack from './stack/min-stack';
import evaluateReversePolishNotation from './stack/evaluate-reverse-polish-notation';
import generateParentheses from './stack/generate-parentheses';
import carFleet from './stack/car-fleet';
import largestRectangleInHistogram from './stack/largest-rectangle-in-histogram';

export const QUESTION_DATA_DB: Record<
  string,
  { description: string; code: string; inputs: Record<string, string> }
> = {
  "contains-duplicate": containsDuplicate,
  "valid-anagram": validAnagram,
  "two-sum": twoSum,
  "best-time-to-buy-and-sell-stock": bestTimeToBuyAndSellStock,
  "binary-search": binarySearch,
  "search-a-2d-matrix": searchMatrix,
  "koko-eating-bananas": kokoEatingBananas,
  "find-minimum-in-rotated-sorted-array": findMinInRotatedSortedArray,
  "search-in-rotated-sorted-array": searchInRotatedSortedArray,
  "time-based-key-value-store": timeBasedKeyValueStore,
  "median-of-two-sorted-arrays": medianOfTwoSortedArrays,
  "reverse-linked-list": reverseLinkedList,
  "linked-list-cycle": linkedListCycle,
  "maximum-depth-of-binary-tree": maximumDepthOfBinaryTree,
  "product-of-array-except-self": productOfArrayExceptSelf,
  "merge-two-sorted-lists": mergeTwoSortedLists,
  "reorder-list": reorderList,
  "remove-nth-node-from-end-of-list": removeNthNodeFromEnd,
  "copy-list-with-random-pointer": copyListWithRandomPointer,
  "add-two-numbers": addTwoNumbers,
  "find-the-duplicate-number": findTheDuplicateNumber,
  "lru-cache": lruCache,
  "merge-k-sorted-lists": mergeKSortedLists,
  "reverse-nodes-in-k-group": reverseNodesInKGroup,
  "invert-binary-tree": invertBinaryTree,
  "lowest-common-ancestor-of-bst": lowestCommonAncestorOfBst,
  "diameter-of-binary-tree": diameterOfBinaryTree,
  "balanced-binary-tree": balancedBinaryTree,
  "binary-tree-level-order-traversal": binaryTreeLevelOrderTraversal,
  "binary-tree-right-side-view": binaryTreeRightSideView,
  "count-good-nodes-in-binary-tree": countGoodNodesInBinaryTree,
  "validate-binary-search-tree": validateBinarySearchTree,
  "kth-smallest-element-in-a-bst": kthSmallestElementInABst,
  "same-tree": sameTree,
  "subtree-of-another-tree": subtreeOfAnotherTree,
  "binary-tree-maximum-path-sum": binaryTreeMaximumPathSum,
  "construct-binary-tree-from-preorder-and-inorder-traversal": constructBinaryTreeFromTraversals,
  "serialize-and-deserialize-binary-tree": serializeAndDeserializeBinaryTree,
  "subsets": subsets,
  "top-k-frequent-elements": topKFrequentElements,
  "flood-fill": floodFill,
  "set-matrix-zeroes": setMatrixZeroes,
  "number-of-islands": numberOfIslands,
  "clone-graph": cloneGraph,
  "course-schedule": courseSchedule,
  "group-anagrams": groupAnagrams,
  "encode-and-decode-strings": encodeAndDecodeStrings,
  "valid-sudoku": validSudoku,
  "longest-consecutive-sequence": longestConsecutiveSequence,
  "valid-palindrome": validPalindrome,
  "two-sum-ii-input-array-is-sorted": twoSumIi,
  "3sum": threeSum,
  "container-with-most-water": containerWithMostWater,
  "trapping-rain-water": trappingRainWater,
  "longest-substring-without-repeating-characters": longestSubstringWithoutRepeatingCharacters,
  "longest-repeating-character-replacement": longestRepeatingCharacterReplacement,
  "permutation-in-string": permutationInString,
  "minimum-window-substring": minimumWindowSubstring,
  "sliding-window-maximum": slidingWindowMaximum,
  "valid-parentheses": validParentheses,
  "daily-temperatures": dailyTemperatures,
  "min-stack": minStack,
  "evaluate-reverse-polish-notation": evaluateReversePolishNotation,
  "generate-parentheses": generateParentheses,
  "car-fleet": carFleet,
  "largest-rectangle-in-histogram": largestRectangleInHistogram
};
