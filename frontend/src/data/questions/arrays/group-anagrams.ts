const questionData = {
  description: "Given an array of strings strs, group the anagrams together. You can return the answer in any order. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase.",
  code: `import java.util.*;

public class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        if (strs == null || strs.length == 0) {
            return new ArrayList<>();
        }
        
        Map<String, List<String>> map = new HashMap<>();
        
        for (int i = 0; i < strs.length; i++) {
            String s = strs[i];
            char[] ca = s.toCharArray();
            Arrays.sort(ca);
            String key = String.valueOf(ca);
            
            if (!map.containsKey(key)) {
                map.put(key, new ArrayList<>());
            }
            map.get(key).add(s);
        }
        
        return new ArrayList<>(map.values());
    }
}`,
  inputs: {
    "strs": "eat, tea, tan, ate, nat, bat"
  }
};

export default questionData;
