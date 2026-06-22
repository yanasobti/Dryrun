const questionData = {
  description: "Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.",
  code: `public class Solution {
    public int largestRectangleArea(int[] heights) {
        int n = heights.length;
        java.util.Stack<Integer> stack = new java.util.Stack<>();
        int maxArea = 0;
        int i = 0;
        
        while (i < n) {
            if (stack.isEmpty() || heights[i] >= heights[stack.peek()]) {
                stack.push(i++);
            } else {
                int popped = stack.pop();
                int h = heights[popped];
                int w = stack.isEmpty() ? i : i - stack.peek() - 1;
                maxArea = Math.max(maxArea, h * w);
            }
        }
        
        while (!stack.isEmpty()) {
            int popped = stack.pop();
            int h = heights[popped];
            int w = stack.isEmpty() ? i : i - stack.peek() - 1;
            maxArea = Math.max(maxArea, h * w);
        }
        
        return maxArea;
    }
}`,
  inputs: {
    "heights": "2,1,5,6,2,3"
  }
};

export default questionData;
