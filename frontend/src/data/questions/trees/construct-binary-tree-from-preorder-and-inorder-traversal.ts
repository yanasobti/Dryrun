const questionData = {
  description: "Given two integer arrays preorder and inorder where preorder is the preorder traversal of a binary tree and inorder is the inorder traversal of the same tree, construct and return the binary tree.",
  code: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}

public class Solution {
    private int preorderIndex = 0;
    private Map<Integer, Integer> inorderIndexMap = new HashMap<>();
    
    public TreeNode buildTree(int[] preorder, int[] inorder) {
        for (int i = 0; i < inorder.length; i++) {
            inorderIndexMap.put(inorder[i], i);
        }
        return arrayToTree(preorder, 0, preorder.length - 1);
    }
    
    private TreeNode arrayToTree(int[] preorder, int left, int right) {
        if (left > right) return null;
        
        int rootValue = preorder[preorderIndex++];
        TreeNode root = new TreeNode(rootValue);
        
        int inorderIndex = inorderIndexMap.get(rootValue);
        root.left = arrayToTree(preorder, left, inorderIndex - 1);
        root.right = arrayToTree(preorder, inorderIndex + 1, right);
        
        return root;
    }
}`,
  inputs: {
    "preorder": "3, 9, 20, 15, 7",
    "inorder": "9, 3, 15, 20, 7"
  }
};

export default questionData;
