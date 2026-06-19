const questionData = {
  description: "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence. You must write an algorithm that runs in O(n) time.",
  code: `import java.util.*;

public class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> numSet = new HashSet<>();
        for (int i = 0; i < nums.length; i++) {
            numSet.add(nums[i]);
        }
        
        int longestStreak = 0;
        
        for (int i = 0; i < nums.length; i++) {
            int num = nums[i];
            
            // Check if this is the start of a sequence
            if (!numSet.contains(num - 1)) {
                int currentNum = num;
                int currentStreak = 1;
                
                while (numSet.contains(currentNum + 1)) {
                    currentNum += 1;
                    currentStreak += 1;
                }
                
                longestStreak = Math.max(longestStreak, currentStreak);
            }
        }
        
        return longestStreak;
    }
}`,
  inputs: {
    "nums": "100, 4, 200, 1, 3, 2"
  }
};

export default questionData;
