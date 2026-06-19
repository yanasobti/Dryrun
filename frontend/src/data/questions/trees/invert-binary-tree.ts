const questionData = {
  description: "Given the root of a binary tree, invert the tree, and return its root.",
  code: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}

public class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        
        TreeNode temp = root.left;
        root.left = root.right;
        root.right = temp;
        
        invertTree(root.left);
        invertTree(root.right);
        
        return root;
    }
}`,
  inputs: {
    "root": "4, 2, 7, 1, 3, 6, 9"
  }
};

export default questionData;
