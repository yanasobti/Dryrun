const questionData = {
  description: "Find the maximum depth of a binary tree recursively using Depth First Search (DFS). Watch activation frames grow on the recursion stack.",
  code: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}

public class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        int leftDepth = maxDepth(root.left);
        int rightDepth = maxDepth(root.right);
        return Math.max(leftDepth, rightDepth) + 1;
    }
}`,
  inputs: {
    "root": "3, 9, 20, null, null, 15, 7"
  }
};

export default questionData;
