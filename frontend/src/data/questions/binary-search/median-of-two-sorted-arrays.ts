const questionData = {
  description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
  code: `public class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        if (nums1.length > nums2.length) {
            return findMedianSortedArrays(nums2, nums1);
        }
        int m = nums1.length;
        int n = nums2.length;
        int left = 0;
        int right = m;
        
        while (left <= right) {
            int i = left + (right - left) / 2;
            int j = (m + n + 1) / 2 - i;
            
            int A_left = (i == 0) ? Integer.MIN_VALUE : nums1[i - 1];
            int A_right = (i == m) ? Integer.MAX_VALUE : nums1[i];
            int B_left = (j == 0) ? Integer.MIN_VALUE : nums2[j - 1];
            int B_right = (j == n) ? Integer.MAX_VALUE : nums2[j];
            
            if (A_left <= B_right && B_left <= A_right) {
                if ((m + n) % 2 == 1) {
                    return Math.max(A_left, B_left);
                } else {
                    return (Math.max(A_left, B_left) + Math.min(A_right, B_right)) / 2.0;
                }
            } else if (A_left > B_right) {
                right = i - 1;
            } else {
                left = i + 1;
            }
        }
        return 0.0;
    }
}`,
  inputs: {
    "nums1": "1, 3, 8",
    "nums2": "7, 9, 10, 11"
  }
};

export default questionData;
