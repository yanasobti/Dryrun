const questionData = {
  description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
  code: `public class Solution {
    public int trap(int[] height) {
        if (height == null || height.length == 0) return 0;
        
        int left = 0;
        int right = height.length - 1;
        int leftMax = 0;
        int rightMax = 0;
        int trappedWater = 0;
        
        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) {
                    leftMax = height[left];
                } else {
                    trappedWater += leftMax - height[left];
                }
                left++;
            } else {
                if (height[right] >= rightMax) {
                    rightMax = height[right];
                } else {
                    trappedWater += rightMax - height[right];
                }
                right--;
            }
        }
        
        return trappedWater;
    }
}`,
  inputs: {
    "height": "0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1"
  }
};

export default questionData;
