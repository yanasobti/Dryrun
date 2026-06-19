exports.generate = (context) => {
  const { codeSnippet, f, prevStep, stepIdx, currentVars, methodName } = context;

  const code = codeSnippet.trim();
  const i = currentVars['i'] !== undefined ? parseInt(currentVars['i']) : -1;
  const j = currentVars['j'] !== undefined ? parseInt(currentVars['j']) : -1;
  const r = currentVars['r'] !== undefined ? parseInt(currentVars['r']) : -1;
  const c = currentVars['c'] !== undefined ? parseInt(currentVars['c']) : -1;
  const numIslands = currentVars['numIslands'] !== undefined ? parseInt(currentVars['numIslands']) : 0;

  const activeR = r !== -1 ? r : i;
  const activeC = c !== -1 ? c : j;

  // 1. Initial Step
  if (stepIdx === 0) {
    return {
      action: "Start Scan",
      explanation: "Welcome to DryRun! We will scan the grid row-by-row, column-by-column to find all islands. 🗺️",
      why: "The scan starts at top-left cell (0, 0)."
    };
  }

  // 2. Explanations within numIslands outer loops
  if (methodName === 'numIslands') {
    if (code.includes('grid[i][j] == \'1\'') || code.includes('grid[i][j]==\'1\'') || code.includes('grid[i][j] == 1') || code.includes('grid[i][j]==1')) {
      return {
        action: "Scanning Cell",
        explanation: `Checking cell (${i}, ${j}). Is it land?`,
        why: "We look for unvisited land (1) to discover a new island."
      };
    }
    if (code.includes('numIslands++')) {
      return {
        action: "Island Found!",
        explanation: `We found a new piece of land at (${i}, ${j}). This starts Island #${numIslands + 1}! 🏝️`,
        why: "Since this land hasn't been visited yet, it marks a new discovery. We start a DFS from here."
      };
    }
    if (code.includes('dfs(')) {
      return {
        action: "Start DFS Search",
        explanation: `Launching Depth First Search (DFS) from (${i}, ${j}) to discover all connected land.`,
        why: "DFS explores all connected neighbors recursively to map out the entire island."
      };
    }
  }

  // 3. Explanations within DFS recursion
  if (methodName === 'dfs') {
    // Boundary and Water checks
    if (code.includes('i < 0') || code.includes('r < 0') || code.includes('r >=') || code.includes('i >=') || code.includes('grid[i][j] == \'0\'') || code.includes('grid[i][j] == 0') || code.includes('grid[i][j]==0')) {
      const dfsR = currentVars['i'] !== undefined ? i : r;
      const dfsC = currentVars['j'] !== undefined ? j : c;
      
      // Let's check why it hit this return
      if (dfsR < 0 || dfsC < 0 || dfsR >= 10 || dfsC >= 10) { // arbitrary bounds for defaultGrid
        return {
          action: "Boundary Hit",
          explanation: `Position (${dfsR}, ${dfsC}) is out of grid bounds. Stopping search in this direction. 🛑`,
          why: "We cannot explore outside the edges of the grid."
        };
      }
      return {
        action: "Checking Neighbors",
        explanation: `Checking cell (${dfsR}, ${dfsC}) to see if we can expand our island.`,
        why: "We check if the neighbor is valid unvisited land before exploring further."
      };
    }

    if (code.includes('grid[i][j] = \'0\'') || code.includes('grid[i][j] = 0') || code.includes('grid[r][c] =') || code.includes('image[r][c] =')) {
      const dfsR = currentVars['i'] !== undefined ? i : r;
      const dfsC = currentVars['j'] !== undefined ? j : c;
      return {
        action: "Explore Neighbor",
        explanation: `This neighboring land at (${dfsR}, ${dfsC}) is connected, so it belongs to the same island. 🟢`,
        why: "We mark it as visited by changing its state so we do not count it again later."
      };
    }

    if (code.includes('return')) {
      const dfsR = currentVars['i'] !== undefined ? i : r;
      const dfsC = currentVars['j'] !== undefined ? j : c;
      return {
        action: "Backtracking...",
        explanation: `All neighbors from (${dfsR}, ${dfsC}) checked. Backtracking to parent node. 🔙`,
        why: "DFS is complete for this path. We pop it from our stack and return to the previous cell."
      };
    }
  }

  // 4. Default Fallback within Grid/DFS
  return null;
};
