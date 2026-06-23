const questionData = {
  description: "Find the minimum eating speed Koko can choose to eat all the bananas within h hours. Binary search ranges from speed 1 to max(pile).",
  code: `public class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int left = 1;
        int right = 0;
        for (int pile : piles) {
            right = Math.max(right, pile);
        }
        while (left <= right) {
            int mid = left + (right - left) / 2;
            int hours = 0;
            for (int pile : piles) {
                hours += (pile + mid - 1) / mid;
            }
            if (hours <= h) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return left;
    }
}`,
  inputs: {
    "piles": "3, 6, 7, 11",
    "h": "8"
  }
};

export default questionData;
