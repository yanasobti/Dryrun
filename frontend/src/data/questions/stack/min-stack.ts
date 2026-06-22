const questionData = {
  description: "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.",
  code: `public class Solution {
    public int[] testMinStack(int[] values) {
        int n = values.length;
        int[] mins = new int[n];
        java.util.Stack<Integer> stack = new java.util.Stack<>();
        java.util.Stack<Integer> minStack = new java.util.Stack<>();
        
        for (int i = 0; i < n; i++) {
            int val = values[i];
            stack.push(val);
            if (minStack.isEmpty() || val <= minStack.peek()) {
                minStack.push(val);
            } else {
                minStack.push(minStack.peek());
            }
            mins[i] = minStack.peek();
        }
        return mins;
    }
}`,
  inputs: {
    "values": "5,3,7,2,8"
  }
};

export default questionData;
