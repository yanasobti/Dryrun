const questionData = {
  description: "Given a binary tree, determine if it is height-balanced. A height-balanced binary tree is defined as a binary tree in which the left and right subtrees of every node differ in height by no more than 1.",
  code: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}

public class Solution {
    public boolean isBalanced(TreeNode root) {
        return height(root) != -1;
    }
    
    private int height(TreeNode node) {
        if (node == null) return 0;
        
        int leftHeight = height(node.left);
        if (leftHeight == -1) return -1;
        
        int rightHeight = height(node.right);
        if (rightHeight == -1) return -1;
        
        if (Math.abs(leftHeight - rightHeight) > 1) return -1;
        return Math.max(leftHeight, rightHeight) + 1;
    }
}`,
  inputs: {
    "root": "3, 9, 20, null, null, 15, 7"
  }
};

export default questionData;
