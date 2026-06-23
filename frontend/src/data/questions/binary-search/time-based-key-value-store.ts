const questionData = {
  description: "Design a time-based key-value data structure that can store multiple values for the same key at different timestamps and retrieve the key's value at a certain timestamp. Uses binary search on timestamps.",
  code: `public class Solution {
    public static class TimeMap {
        private java.util.Map<String, java.util.List<Data>> map;

        public static class Data {
            String val;
            int timestamp;
            Data(String val, int timestamp) {
                this.val = val;
                this.timestamp = timestamp;
            }
        }

        public TimeMap() {
            map = new java.util.HashMap<>();
        }
        
        public void set(String key, String value, int timestamp) {
            if (!map.containsKey(key)) {
                map.put(key, new java.util.ArrayList<>());
            }
            map.get(key).add(new Data(value, timestamp));
        }
        
        public String get(String key, int timestamp) {
            if (!map.containsKey(key)) {
                return "";
            }
            java.util.List<Data> list = map.get(key);
            int left = 0;
            int right = list.size() - 1;
            String res = "";
            
            while (left <= right) {
                int mid = left + (right - left) / 2;
                if (list.get(mid).timestamp <= timestamp) {
                    res = list.get(mid).val;
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
            return res;
        }
    }

    public String[] testTimeMap(String[] ops, String[] keys, String[] values, int[] timestamps) {
        int n = ops.length;
        String[] result = new String[n];
        TimeMap timeMap = new TimeMap();
        
        for (int i = 0; i < n; i++) {
            if (ops[i].equals("set")) {
                timeMap.set(keys[i], values[i], timestamps[i]);
                result[i] = "null";
            } else if (ops[i].equals("get")) {
                result[i] = timeMap.get(keys[i], timestamps[i]);
            }
        }
        return result;
    }
}`,
  inputs: {
    "ops": '"set", "get", "get", "set", "get", "get"',
    "keys": '"love", "love", "love", "love", "love", "love"',
    "values": '"high", "", "", "low", "", ""',
    "timestamps": "10, 5, 15, 20, 20, 25"
  }
};

export default questionData;
