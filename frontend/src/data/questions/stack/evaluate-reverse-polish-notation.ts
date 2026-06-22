const questionData = {
  description: "Evaluate the value of an arithmetic expression in Reverse Polish Notation. Valid operators are +, -, *, and /.",
  code: `public class Solution {
    public int evalRPN(String tokensStr) {
        String[] tokens = tokensStr.split(",");
        java.util.Stack<Integer> stack = new java.util.Stack<>();
        for (String token : tokens) {
            if (token.equals("+") || token.equals("-") || token.equals("*") || token.equals("/")) {
                int b = stack.pop();
                int a = stack.pop();
                if (token.equals("+")) stack.push(a + b);
                else if (token.equals("-")) stack.push(a - b);
                else if (token.equals("*")) stack.push(a * b);
                else if (token.equals("/")) stack.push(a / b);
            } else {
                stack.push(Integer.parseInt(token));
            }
        }
        return stack.pop();
    }
}`,
  inputs: {
    "tokensStr": "2,1,+,3,*"
  }
};

export default questionData;
