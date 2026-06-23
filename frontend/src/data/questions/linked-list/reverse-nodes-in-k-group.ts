const questionData = {
  description: "Given a linked list, reverse the nodes of a linked list k at a time and return its modified list.",
  code: `class ListNode {
    int val;
    ListNode next;
    ListNode(int x) { val = x; }
}

public class Solution {
    public ListNode reverseKGroup(ListNode head, int k) {
        ListNode curr = head;
        int count = 0;
        
        while (curr != null && count != k) {
            curr = curr.next;
            count++;
        }
        
        if (count == k) {
            curr = reverseKGroup(curr, k);
            while (count-- > 0) {
                ListNode tmp = head.next;
                head.next = curr;
                curr = head;
                head = tmp;
            }
            head = curr;
        }
        
        return head;
    }
}`,
  inputs: {
    "head": "1, 2, 3, 4, 5",
    "k": "2"
  }
};

export default questionData;
