const questionData = {
  description: "Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number. Return the 1-based indices of the two numbers.",
  code: `public class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int left = 0;
        int right = numbers.length - 1;
        
        while (left < right) {
            int sum = numbers[left] + numbers[right];
            if (sum == target) {
                return new int[] { left + 1, right + 1 };
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        return new int[] {};
    }
}`,
  inputs: {
    "numbers": "2, 7, 11, 15",
    "target": "9"
  }
};

export default questionData;
