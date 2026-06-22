const questionData = {
  description: "You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most k times. Return the length of the longest substring containing the same letter you can get after performing the above operations.",
  code: `public class Solution {
    public int characterReplacement(String s, int k) {
        if (s == null || s.length() == 0) return 0;
        
        int[] counts = new int[26];
        int left = 0;
        int maxCount = 0;
        int maxLength = 0;
        
        for (int right = 0; right < s.length(); right++) {
            counts[s.charAt(right) - 'A']++;
            maxCount = Math.max(maxCount, counts[s.charAt(right) - 'A']);
            
            while ((right - left + 1) - maxCount > k) {
                counts[s.charAt(left) - 'A']--;
                left++;
            }
            
            maxLength = Math.max(maxLength, right - left + 1);
        }
        
        return maxLength;
    }
}`,
  inputs: {
    "s": "AABABBA",
    "k": "1"
  }
};

export default questionData;
