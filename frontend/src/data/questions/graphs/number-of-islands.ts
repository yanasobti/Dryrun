const questionData = {
  description: "Given an m x n 2D binary grid grid which represents a map of 1s (land) and 0s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
  code: `public class Solution {
    public int numIslands(int[][] grid) {
        if (grid == null || grid.length == 0) {
            return 0;
        }
        
        int numIslands = 0;
        int r = grid.length;
        int c = grid[0].length;
        
        for (int i = 0; i < r; i++) {
            for (int j = 0; j < c; j++) {
                if (grid[i][j] == 1) {
                    numIslands++;
                    dfs(grid, i, j);
                }
            }
        }
        
        return numIslands;
    }
    
    private void dfs(int[][] grid, int i, int j) {
        int r = grid.length;
        int c = grid[0].length;
        
        if (i < 0 || j < 0 || i >= r || j >= c || grid[i][j] == 0) {
            return;
        }
        
        grid[i][j] = 0;
        
        dfs(grid, i + 1, j);
        dfs(grid, i - 1, j);
        dfs(grid, i, j + 1);
        dfs(grid, i, j - 1);
    }
}`,
  inputs: {
    "grid": "[[1,1,1,1,0],[1,1,0,1,0],[1,1,0,0,0],[0,0,0,0,0]]"
  }
};

export default questionData;
