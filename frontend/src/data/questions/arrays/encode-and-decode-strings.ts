const questionData = {
  description: "Design an algorithm to encode a list of strings to a string. The encoded string is then sent over the network and is decoded back to the original list of strings.",
  code: `import java.util.*;

public class Solution {
    // Encodes a list of strings to a single string.
    public String encode(List<String> strs) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < strs.size(); i++) {
            String s = strs.get(i);
            sb.append(s.length()).append("#").append(s);
        }
        return sb.toString();
    }

    // Decodes a single string to a list of strings.
    public List<String> decode(String str) {
        List<String> list = new ArrayList<>();
        int i = 0;
        while (i < str.length()) {
            int j = str.indexOf('#', i);
            int length = Integer.parseInt(str.substring(i, j));
            i = j + 1 + length;
            list.add(str.substring(j + 1, i));
        }
        return list;
    }
}`,
  inputs: {
    "strs": "[\"neet\", \"code\", \"love\", \"you\"]"
  }
};

export default questionData;
