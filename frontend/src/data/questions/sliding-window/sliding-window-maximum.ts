const questionData = {
  description: "You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position. Return the max sliding window.",
  code: `public class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        if (nums == null || nums.length == 0 || k <= 0) return new int[0];
        
        int n = nums.length;
        int[] result = new int[n - k + 1];
        int ri = 0;
        
        // Store index
        java.util.Deque<Integer> q = new java.util.ArrayDeque<>();
        
        for (int i = 0; i < nums.length; i++) {
            // Remove numbers out of range k
            while (!q.isEmpty() && q.peek() < i - k + 1) {
                q.poll();
            }
            
            // Remove smaller numbers in k range as they are useless
            while (!q.isEmpty() && nums[q.peekLast()] < nums[i]) {
                q.pollLast();
            }
            
            q.offer(i);
            
            if (i >= k - 1) {
                result[ri++] = nums[q.peek()];
            }
        }
        
        return result;
    }
}`,
  inputs: {
    "nums": "1,3,-1,-3,5,3,6,7",
    "k": "3"
  }
};

export default questionData;
