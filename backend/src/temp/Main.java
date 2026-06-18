import java.util.*;
import java.io.*;
import java.math.*;

class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int i = 0; i < nums.length; i++) {
            if (seen.contains(nums[i])) {
                return true;
            }
            seen.add(nums[i]);
        }
        return false;
    }
}

public class Main {
    public static void main(String[] args) {
        Solution instance = new Solution();
        System.out.println("Result: " + instance.containsDuplicate(new int[]{1, 2, 3, 2}));
    }
}