const questionData = {
  description: "Reverse a singly linked list in-place and return the new head node. Watch list node next pointers re-bind in memory.",
  code: `class ListNode {
    int val;
    ListNode next;
    ListNode(int x) {
        val = x;
        next = null;
    }
}

public class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;
    }
}`,
  inputs: {
    "head": "1, 2, 3, 4, 5"
  }
};

export default questionData;
