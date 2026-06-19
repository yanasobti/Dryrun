const questionData = {
  description: "Determine if the linked list has a cycle in it using slow and fast pointers. Watch the pointers converge on a cyclic node.",
  code: `class ListNode {
    int val;
    ListNode next;
    ListNode(int x) {
        val = x;
        next = null;
    }
}

public class Solution {
    public boolean hasCycle(ListNode head) {
        if (head == null) return false;
        ListNode slow = head;
        ListNode fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                return true;
            }
        }
        return false;
    }
}`,
  inputs: {
    "head": "3, 2, 0, -4"
  }
};

export default questionData;
