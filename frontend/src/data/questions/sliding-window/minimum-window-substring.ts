const questionData = {
  description: "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string.",
  code: `public class Solution {
    public String minWindow(String s, String t) {
        if (s == null || t == null || s.length() < t.length()) return "";
        
        java.util.Map<Character, Integer> tMap = new java.util.HashMap<>();
        for (char c : t.toCharArray()) {
            tMap.put(c, tMap.getOrDefault(c, 0) + 1);
        }
        
        java.util.Map<Character, Integer> windowMap = new java.util.HashMap<>();
        int left = 0;
        int have = 0;
        int need = tMap.size();
        int minLen = Integer.MAX_VALUE;
        int minLeft = 0;
        
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (tMap.containsKey(c)) {
                windowMap.put(c, windowMap.getOrDefault(c, 0) + 1);
                if (windowMap.get(c).intValue() == tMap.get(c).intValue()) {
                    have++;
                }
            }
            
            while (have == need) {
                if ((right - left + 1) < minLen) {
                    minLen = right - left + 1;
                    minLeft = left;
                }
                
                char lChar = s.charAt(left);
                if (tMap.containsKey(lChar)) {
                    windowMap.put(lChar, windowMap.get(lChar) - 1);
                    if (windowMap.get(lChar).intValue() < tMap.get(lChar).intValue()) {
                        have--;
                    }
                }
                left++;
            }
        }
        
        return minLen == Integer.MAX_VALUE ? "" : s.substring(minLeft, minLeft + minLen);
    }
}`,
  inputs: {
    "s": "ADOBECODEBANC",
    "t": "ABC"
  }
};

export default questionData;
