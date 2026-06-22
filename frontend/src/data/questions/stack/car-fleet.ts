const questionData = {
  description: "There are n cars at given miles away from the starting mile 0, traveling to reach the target mile. Find the number of car fleets that will arrive at the destination.",
  code: `public class Solution {
    public int carFleet(int target, int[] position, int[] speed) {
        int n = position.length;
        if (n == 0) return 0;
        
        double[][] cars = new double[n][2];
        for (int i = 0; i < n; i++) {
            cars[i][0] = position[i];
            cars[i][1] = (double) (target - position[i]) / speed[i];
        }
        
        java.util.Arrays.sort(cars, (a, b) -> Double.compare(b[0], a[0]));
        
        java.util.Stack<Double> stack = new java.util.Stack<>();
        for (int i = 0; i < n; i++) {
            double time = cars[i][1];
            if (stack.isEmpty() || time > stack.peek()) {
                stack.push(time);
            }
        }
        return stack.size();
    }
}`,
  inputs: {
    "target": "12",
    "position": "10,8,0,5,3",
    "speed": "2,4,1,1,3"
  }
};

export default questionData;
