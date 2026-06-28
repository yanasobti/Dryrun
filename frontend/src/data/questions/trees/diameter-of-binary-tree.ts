const questionData = {
  description: "Given the root of a binary tree, return the length of the diameter of the tree. The diameter of a binary tree is the length of the longest path between any two nodes in a tree.",
  code: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}

public class Solution {
    private int maxDiameter = 0;
    
    public int diameterOfBinaryTree(TreeNode root) {
        longestPath(root);
        return maxDiameter;
    }
    
    private int longestPath(TreeNode node) {
        if (node == null) return 0;
        int leftPath = longestPath(node.left);
        int rightPath = longestPath(node.right);
        maxDiameter = Math.max(maxDiameter, leftPath + rightPath);
        return Math.max(leftPath, rightPath) + 1;
    }
}`,
  inputs: {
    "root": "1, 2, 3, 4, 5"
  }
};

export default questionData;
