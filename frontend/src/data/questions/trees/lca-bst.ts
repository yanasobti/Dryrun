const questionData = {
  description: "Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.",
  code: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}

public class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, int p, int q) {
        if (root == null) return null;
        if (root.val > p && root.val > q) {
            return lowestCommonAncestor(root.left, p, q);
        }
        if (root.val < p && root.val < q) {
            return lowestCommonAncestor(root.right, p, q);
        }
        return root;
    }
}`,
  inputs: {
    "root": "6, 2, 8, 0, 4, 7, 9, null, null, 3, 5",
    "p": "2",
    "q": "8"
  }
};

export default questionData;
