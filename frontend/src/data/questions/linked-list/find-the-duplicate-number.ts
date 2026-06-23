const questionData = {
  description: "Find the duplicate number in an array of size n+1 containing integers from 1 to n using Floyd's cycle detection.",
  code: `public class Solution {
    public int findDuplicate(int[] nums) {
        int slow = nums[0];
        int fast = nums[0];
        
        do {
            slow = nums[slow];
            fast = nums[nums[fast]];
        } while (slow != fast);
        
        int slow2 = nums[0];
        while (slow != slow2) {
            slow = nums[slow];
            slow2 = nums[slow2];
        }
        
        return slow;
    }
}`,
  inputs: {
    "nums": "1, 3, 4, 2, 2"
  }
};

export default questionData;
