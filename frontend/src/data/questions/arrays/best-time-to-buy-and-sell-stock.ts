const questionData = {
  description: "You are given prices where prices[i] is the daily stock price. Find the maximum buy/sell profit you can achieve.",
  code: `public class Solution {
    public int maxProfit(int[] prices) {
        int min = prices[0];
        int profit = 0;
        for (int i = 1; i < prices.length; i++) {
            min = Math.min(min, prices[i]);
            profit = Math.max(profit, prices[i] - min);
        }
        return profit;
    }
}`,
  inputs: {
    "prices": "7, 1, 5, 3, 6, 4"
  }
};

export default questionData;
