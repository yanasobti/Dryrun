const questionData = {
  description: "Given two strings s1 and s2, return true if s2 contains a permutation of s1, or false otherwise.",
  code: `public class Solution {
    public boolean checkInclusion(String s1, String s2) {
        if (s1.length() > s2.length()) return false;
        
        int[] s1Counts = new int[26];
        int[] s2Counts = new int[26];
        
        for (int i = 0; i < s1.length(); i++) {
            s1Counts[s1.charAt(i) - 'a']++;
            s2Counts[s2.charAt(i) - 'a']++;
        }
        
        int matches = 0;
        for (int i = 0; i < 26; i++) {
            if (s1Counts[i] == s2Counts[i]) matches++;
        }
        
        int left = 0;
        for (int right = s1.length(); right < s2.length(); right++) {
            if (matches == 26) return true;
            
            int rIndex = s2.charAt(right) - 'a';
            s2Counts[rIndex]++;
            if (s1Counts[rIndex] == s2Counts[rIndex]) {
                matches++;
            } else if (s1Counts[rIndex] + 1 == s2Counts[rIndex]) {
                matches--;
            }
            
            int lIndex = s2.charAt(left) - 'a';
            s2Counts[lIndex]--;
            if (s1Counts[lIndex] == s2Counts[lIndex]) {
                matches++;
            } else if (s1Counts[lIndex] - 1 == s2Counts[lIndex]) {
                matches--;
            }
            left++;
        }
        
        return matches == 26;
    }
}`,
  inputs: {
    "s1": "ab",
    "s2": "eidbaooo"
  }
};

export default questionData;
