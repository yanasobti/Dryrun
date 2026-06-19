const questionData = {
  description: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. Do it in O(n) time and without using the division operation.",
  code: `public class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] answer = new int[n];
        
        answer[0] = 1;
        for (int i = 1; i < n; i++) {
            answer[i] = answer[i - 1] * nums[i - 1];
        }
        
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            answer[i] = answer[i] * right;
            right = right * nums[i];
        }
        
        return answer;
    }
}`,
  inputs: {
    "nums": "1, 2, 3, 4"
  }
};

export default questionData;
