const questionData = {
  description: "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses.",
  code: `import java.util.*;

public class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) {
            adj.add(new ArrayList<>());
        }
        for (int i = 0; i < prerequisites.length; i++) {
            adj.get(prerequisites[i][1]).add(prerequisites[i][0]);
        }
        
        int[] visit = new int[numCourses];
        for (int i = 0; i < numCourses; i++) {
            if (hasCycle(adj, visit, i)) {
                return false;
            }
        }
        return true;
    }
    
    private boolean hasCycle(List<List<Integer>> adj, int[] visit, int curr) {
        if (visit[curr] == 1) return true;
        if (visit[curr] == 2) return false;
        
        visit[curr] = 1;
        List<Integer> neighbors = adj.get(curr);
        for (int i = 0; i < neighbors.size(); i++) {
            if (hasCycle(adj, visit, neighbors.get(i))) {
                return true;
            }
        }
        visit[curr] = 2;
        return false;
    }
}`,
  inputs: {
    "numCourses": "2",
    "prerequisites": "[[1,0]]"
  }
};

export default questionData;
