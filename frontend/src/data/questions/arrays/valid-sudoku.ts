const questionData = {
  description: "Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated according to the following rules: 1. Each row must contain the digits 1-9 without repetition. 2. Each column must contain the digits 1-9 without repetition. 3. Each of the nine 3 x 3 sub-boxes of the grid must contain the digits 1-9 without repetition.",
  code: `import java.util.*;

public class Solution {
    public boolean isValidSudoku(char[][] board) {
        Set<String> seen = new HashSet<>();
        
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                char number = board[i][j];
                if (number != '.') {
                    if (!seen.add(number + " in row " + i) ||
                        !seen.add(number + " in col " + j) ||
                        !seen.add(number + " in block " + i/3 + "-" + j/3)) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
}`,
  inputs: {
    "board": `[["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]`
  }
};

export default questionData;
