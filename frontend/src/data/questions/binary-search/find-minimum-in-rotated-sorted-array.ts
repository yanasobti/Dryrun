const questionData = {
  description: "Find the minimum element in a sorted array that has been rotated. Check mid vs right to decide which half is sorted.",
  code: `public class Solution {
    public int findMin(int[] nums) {
        int left = 0;
        int right = nums.length - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] > nums[right]) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return nums[left];
    }
}`,
  inputs: {
    "nums": "3, 4, 5, 1, 2"
  }
};

export default questionData;
