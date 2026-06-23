const questionData = {
  description: "Search for a target value in an m x n 2D matrix where each row is sorted and the first integer of each row is greater than the last integer of the previous row. Flat-index mapping maps binary search pointers onto 2D coordinates.",
  code: `public class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        if (matrix == null || matrix.length == 0 || matrix[0].length == 0) {
            return false;
        }
        int R = matrix.length;
        int C = matrix[0].length;
        int left = 0;
        int right = R * C - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            int r = mid / C;
            int c = mid % C;
            int val = matrix[r][c];
            if (val == target) {
                return true;
            } else if (val < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return false;
    }
}`,
  inputs: {
    "matrix": "[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]]",
    "target": "3"
  }
};

export default questionData;
