import containsDuplicate from './contains-duplicate';
import validAnagram from './valid-anagram';
import twoSum from './two-sum';
import bestTimeToBuyAndSellStock from './best-time-to-buy-and-sell-stock';
import binarySearch from './binary-search';
import reverseLinkedList from './reverse-linked-list';
import linkedListCycle from './linked-list-cycle';
import maximumDepthOfBinaryTree from './maximum-depth-of-binary-tree';

export const QUESTION_DATA_DB: Record<
  string,
  { description: string; code: string; inputs: Record<string, string> }
> = {
  "contains-duplicate": containsDuplicate,
  "valid-anagram": validAnagram,
  "two-sum": twoSum,
  "best-time-to-buy-and-sell-stock": bestTimeToBuyAndSellStock,
  "binary-search": binarySearch,
  "reverse-linked-list": reverseLinkedList,
  "linked-list-cycle": linkedListCycle,
  "maximum-depth-of-binary-tree": maximumDepthOfBinaryTree
};
