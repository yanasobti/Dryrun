const questionData = {
  description: "Given the root of a binary tree, return the maximum path sum of any non-empty path. The path may start and end at any node in the tree.",
  code: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}

public class Solution {
    private int maxSum = Integer.MIN_VALUE;
    
    public int maxPathSum(TreeNode root) {
        maxGain(root);
        return maxSum;
    }
    
    private int maxGain(TreeNode node) {
        if (node == null) return 0;
        
        int leftGain = Math.max(maxGain(node.left), 0);
        int rightGain = Math.max(maxGain(node.right), 0);
        
        int currentPathSum = node.val + leftGain + rightGain;
        maxSum = Math.max(maxSum, currentPathSum);
        
        return node.val + Math.max(leftGain, rightGain);
    }
}`,
  inputs: {
    "root": "-10, 9, 20, null, null, 15, 7"
  }
};

export default questionData;
