const questionData = {
  description: "Merge k sorted linked lists and return it as one sorted linked list.",
  code: `class ListNode {
    int val;
    ListNode next;
    ListNode(int x) { val = x; }
}

public class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        if (lists == null || lists.length == 0) return null;
        
        java.util.PriorityQueue<ListNode> queue = new java.util.PriorityQueue<>(
            lists.length, (a, b) -> a.val - b.val
        );
        
        for (ListNode node : lists) {
            if (node != null) {
                queue.add(node);
            }
        }
        
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        
        while (!queue.isEmpty()) {
            ListNode node = queue.poll();
            curr.next = node;
            curr = curr.next;
            if (node.next != null) {
                queue.add(node.next);
            }
        }
        
        return dummy.next;
    }
}`,
  inputs: {
    "lists": "[[1,4,5],[1,3,4],[2,6]]"
  }
};

export default questionData;
