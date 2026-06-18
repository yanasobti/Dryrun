const questionData = {
  description: "Search a sorted array in O(log N) time by splitting the search space in half. Watch left, right, and mid pointers narrow down target.",
  code: `public class Solution {
    public int search(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) {
                return mid;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return -1;
    }
}`,
  inputs: {
    "nums": "-1, 0, 3, 5, 9, 12",
    "target": "9"
  }
};

export default questionData;
