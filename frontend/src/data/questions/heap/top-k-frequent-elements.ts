const questionData = {
  description: "Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.",
  code: `import java.util.*;

public class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int n = nums[i];
            count.put(n, count.getOrDefault(n, 0) + 1);
        }
        
        PriorityQueue<Integer> heap = new PriorityQueue<>(
            (n1, n2) -> count.get(n1) - count.get(n2)
        );
        
        for (int n : count.keySet()) {
            heap.add(n);
            if (heap.size() > k) {
                heap.poll();
            }
        }
        
        int[] top = new int[k];
        for (int i = k - 1; i >= 0; --i) {
            top[i] = heap.poll();
        }
        return top;
    }
}`,
  inputs: {
    "nums": "1, 1, 1, 2, 2, 3",
    "k": "2"
  }
};

export default questionData;
