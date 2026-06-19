const questionData = {
  description: "An image is represented by an m x n integer grid image where image[i][j] represents the pixel value of the image. You are also given three integers sr, sc, and color. You should perform a flood fill on the image starting from the pixel image[sr][sc].",
  code: `public class Solution {
    public int[][] floodFill(int[][] image, int sr, int sc, int color) {
        int oldColor = image[sr][sc];
        if (oldColor != color) {
            dfs(image, sr, sc, oldColor, color);
        }
        return image;
    }
    
    private void dfs(int[][] image, int r, int c, int oldColor, int newColor) {
        if (r < 0 || r >= image.length || c < 0 || c >= image[0].length) {
            return;
        }
        if (image[r][c] != oldColor) {
            return;
        }
        
        image[r][c] = newColor;
        
        dfs(image, r + 1, c, oldColor, newColor);
        dfs(image, r - 1, c, oldColor, newColor);
        dfs(image, r, c + 1, oldColor, newColor);
        dfs(image, r, c - 1, oldColor, newColor);
    }
}`,
  inputs: {
    "image": "[[1,1,1],[1,1,0],[1,0,1]]",
    "sr": "1",
    "sc": "1",
    "color": "2"
  }
};

export default questionData;
