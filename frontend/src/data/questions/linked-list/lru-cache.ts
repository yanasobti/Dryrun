const questionData = {
  description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
  code: `public class Solution {
    public static class LRUCache {
        private static class Node {
            int key;
            int val;
            Node prev;
            Node next;
            Node(int key, int val) {
                this.key = key;
                this.val = val;
            }
        }
        
        private final int capacity;
        private final java.util.Map<Integer, Node> map;
        private final Node head;
        private final Node tail;
        
        public LRUCache(int capacity) {
            this.capacity = capacity;
            this.map = new java.util.HashMap<>();
            this.head = new Node(-1, -1);
            this.tail = new Node(-1, -1);
            head.next = tail;
            tail.prev = head;
        }
        
        public int get(int key) {
            if (!map.containsKey(key)) {
                return -1;
            }
            Node node = map.get(key);
            remove(node);
            insert(node);
            return node.val;
        }
        
        public void put(int key, int value) {
            if (map.containsKey(key)) {
                Node node = map.get(key);
                node.val = value;
                remove(node);
                insert(node);
            } else {
                if (map.size() >= capacity) {
                    Node lru = tail.prev;
                    remove(lru);
                    map.remove(lru.key);
                }
                Node node = new Node(key, value);
                map.put(key, node);
                insert(node);
            }
        }
        
        private void remove(Node node) {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        }
        
        private void insert(Node node) {
            Node nextTemp = head.next;
            head.next = node;
            node.prev = head;
            node.next = nextTemp;
            nextTemp.prev = node;
        }
    }

    public String[] testLRUCache(String[] ops, int[] keys, int[] values, int capacity) {
        int n = ops.length;
        String[] result = new String[n];
        LRUCache cache = new LRUCache(capacity);
        result[0] = "null";
        
        for (int i = 1; i < n; i++) {
            if (ops[i].equals("put")) {
                cache.put(keys[i], values[i]);
                result[i] = "null";
            } else if (ops[i].equals("get")) {
                result[i] = String.valueOf(cache.get(keys[i]));
            }
        }
        return result;
    }
}`,
  inputs: {
    "ops": '"LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"',
    "keys": "2, 1, 2, 1, 3, 2, 4, 1, 3, 4",
    "values": "0, 1, 2, 0, 3, 0, 4, 0, 0, 0",
    "capacity": "2"
  }
};

export default questionData;
