const questionData = {
  description: "Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses using an explicit Stack.",
  code: `public class Solution {
    public java.util.List<String> generateParenthesis(int n) {
        java.util.List<String> res = new java.util.ArrayList<>();
        java.util.Stack<State> stack = new java.util.Stack<>();
        stack.push(new State("", 0, 0));
        
        while (!stack.isEmpty()) {
            State cur = stack.pop();
            if (cur.str.length() == n * 2) {
                res.add(cur.str);
                continue;
            }
            if (cur.open < n) {
                stack.push(new State(cur.str + "(", cur.open + 1, cur.close));
            }
            if (cur.close < cur.open) {
                stack.push(new State(cur.str + ")", cur.open, cur.close + 1));
            }
        }
        return res;
    }
    
    private static class State {
        String str;
        int open;
        int close;
        State(String str, int open, int close) {
            this.str = str;
            this.open = open;
            this.close = close;
        }
        @Override
        public String toString() {
            return str;
        }
    }
}`,
  inputs: {
    "n": "2"
  }
};

export default questionData;
