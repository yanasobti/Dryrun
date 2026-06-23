const questionData = {
  description: "A linked list is given such that each node contains an additional random pointer which could point to any node in the list or null. Return a deep copy of the list.",
  code: `class Node {
    int val;
    Node next;
    Node random;
    Node(int val) {
        this.val = val;
        this.next = null;
        this.random = null;
    }
}

public class Solution {
    public Node copyRandomList(Node head) {
        if (head == null) return null;
        
        java.util.Map<Node, Node> map = new java.util.HashMap<>();
        
        // Loop 1: copy all nodes
        Node curr = head;
        while (curr != null) {
            map.put(curr, new Node(curr.val));
            curr = curr.next;
        }
        
        // Loop 2: assign next and random pointers
        curr = head;
        while (curr != null) {
            map.get(curr).next = map.get(curr.next);
            map.get(curr).random = map.get(curr.random);
            curr = curr.next;
        }
        
        return map.get(head);
    }
}`,
  inputs: {
    "head": "[[7,null],[13,0],[11,4],[10,2],[1,0]]"
  }
};

export default questionData;
