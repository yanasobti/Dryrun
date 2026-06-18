const questionData = {
  description: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct. Watch the set elements accumulate.",
  code: `public class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int i = 0; i < nums.length; i++) {
            if (seen.contains(nums[i])) {
                return true;
            }
            seen.add(nums[i]);
        }
        return false;
    }
}`,
  inputs: {
    "nums": "1, 2, 3, 1"
  }
};

export default questionData;
