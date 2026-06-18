const questionData = {
  description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise. Watch character occurrences accumulate in the frequency map.",
  code: `public class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        Map<Character, Integer> counts = new HashMap<>();
        for (int i = 0; i < s.length(); i++) {
            char sc = s.charAt(i);
            char tc = t.charAt(i);
            counts.put(sc, counts.getOrDefault(sc, 0) + 1);
            counts.put(tc, counts.getOrDefault(tc, 0) - 1);
        }
        for (int val : counts.values()) {
            if (val != 0) return false;
        }
        return true;
    }
}`,
  inputs: {
    "s": "anagram",
    "t": "nagaram"
  }
};

export default questionData;
