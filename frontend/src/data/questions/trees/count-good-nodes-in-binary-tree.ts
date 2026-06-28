const questionData = {
  description: "Given a binary tree root, a node x in the tree is named good if in the path from root to x, there are no nodes with a value greater than x. Return the number of good nodes in the binary tree.",
  code: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}

public class Solution {
    public int goodNodes(TreeNode root) {
        return dfs(root, root.val);
    }
    
    private int dfs(TreeNode node, int maxVal) {
        if (node == null) return 0;
        int res = node.val >= maxVal ? 1 : 0;
        maxVal = Math.max(maxVal, node.val);
        res += dfs(node.left, maxVal);
        res += dfs(node.right, maxVal);
        return res;
    }
}`,
  inputs: {
    "root": "3, 1, 4, 3, null, 1, 5"
  }
};

export default questionData;
