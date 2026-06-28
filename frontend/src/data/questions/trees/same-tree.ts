const questionData = {
  description: "Given the roots of two binary trees p and q, write a function to check if they are the same or not.",
  code: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}

public class Solution {
    public boolean isSameTree(TreeNode p, TreeNode q) {
        if (p == null && q == null) return true;
        if (p == null || q == null) return false;
        if (p.val != q.val) return false;
        return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
    }
}`,
  inputs: {
    "p": "1, 2, 3",
    "q": "1, 2, 3"
  }
};

export default questionData;
