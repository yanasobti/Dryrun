exports.generate = (ctx) => {
  const { codeSnippet, currentVars, lastVars, getArrayVal } = ctx;

  const minVal = currentVars['min'] ?? currentVars['minPrice'];
  const profitVal = currentVars['profit'] ?? currentVars['maxProfit'];
  const iVal = currentVars['i'];

  // Try to find the array name being used (e.g. 'prices')
  const arrayName = Object.keys(ctx.arrays)[0] || 'prices';
  const priceToday = iVal !== undefined ? getArrayVal(arrayName, iVal) : null;

  if (codeSnippet.includes('int min = prices[0]') || codeSnippet.includes('min = prices[0]') || codeSnippet.includes('minPrice = prices[0]')) {
    return {
      title: "💰 Establish Baseline Buy Price",
      action: codeSnippet,
      explanation: `We establish our initial baseline buying price at ${priceToday || 'prices[0]'}.`,
      why: `Any future transaction requires comparing subsequent sell prices against this starting min buying candidate.`,
      stateVars: [
        { name: "Initial Minimum Price", val: priceToday }
      ],
      importance: "TRIVIAL"
    };
  }

  if (codeSnippet.includes('int profit = 0') || codeSnippet.includes('profit = 0') || codeSnippet.includes('maxProfit = 0')) {
    return {
      title: "💰 Initialize Profit Tracker",
      action: codeSnippet,
      explanation: `We initialize our maximum profit tracker at 0.`,
      why: `Since we cannot make a negative profit (we simply choose not to trade), 0 is our logical starting point.`,
      stateVars: [
        { name: "Starting Max Profit", val: 0 }
      ],
      importance: "TRIVIAL"
    };
  }

  if (codeSnippet.includes('for (int i = 1') || codeSnippet.includes('for(int i = 1')) {
    return {
      title: "🔄 Scan Future Selling Days",
      action: codeSnippet,
      explanation: `We start scanning prices from Day 2.`,
      why: `To evaluate buying and selling decisions day-by-day.`,
      stateVars: [],
      importance: "TRIVIAL"
    };
  }

  if (codeSnippet.includes('Math.min(min') || codeSnippet.includes('minPrice = Math.min') || codeSnippet.includes('min = Math.min')) {
    const prevMin = lastVars['min'] ?? lastVars['minPrice'];
    if (priceToday !== null && prevMin !== undefined && priceToday < prevMin) {
      return {
        title: "📉 Cheaper Buying Price Found",
        action: codeSnippet,
        explanation: `We found a cheaper buying day. A lower buying price of ${priceToday} (vs our previous minimum of ${prevMin}) increases our chances of achieving a larger future profit, so we update our best buying opportunity.`,
        why: `The lower our buying price, the larger the delta between this buy day and any future sell day.`,
        stateVars: [
          { name: "Old Min Price", val: prevMin },
          { name: "Price Today", val: priceToday },
          { name: "New Min Price", val: priceToday }
        ],
        importance: "CRITICAL"
      };
    }
    return {
      title: "📉 Compare Buying Price",
      action: codeSnippet,
      explanation: `We compare the current day's price of ${priceToday ?? ''} with the cheapest price seen so far (${minVal ?? ''}). Since it is not cheaper, we keep our current minimum.`,
      why: `This ensures our min buying tracker continues to represent the absolute cheapest entry point seen so far.`,
      stateVars: [
        { name: "Cheapest Seen", val: minVal },
        { name: "Price Today", val: priceToday }
      ],
      importance: "TRIVIAL"
    };
  }

  if (codeSnippet.includes('Math.max(profit') || codeSnippet.includes('profit = Math.max') || codeSnippet.includes('maxProfit = Math.max')) {
    const potentialProfit = (priceToday !== null && minVal !== undefined) ? (priceToday - minVal) : 0;
    const prevProfit = lastVars['profit'] ?? lastVars['maxProfit'] ?? 0;
    if (potentialProfit > prevProfit) {
      return {
        title: "📈 Better Selling Profit Detected (New Best Answer)",
        action: codeSnippet,
        explanation: `If we buy at the cheapest day seen so far (min = ${minVal}) and sell today (price = ${priceToday}), our profit would be ${potentialProfit}. This is better than our previous best profit of ${prevProfit}, so we update our maximum profit!`,
        why: `We've successfully discovered a more lucrative buy/sell opportunity, updating our overall answer.`,
        stateVars: [
          { name: "Buy Day Price", val: minVal },
          { name: "Sell Day Price", val: priceToday },
          { name: "Old Max Profit", val: prevProfit },
          { name: "New Max Profit", val: potentialProfit }
        ],
        importance: "CRITICAL"
      };
    }
    return {
      title: "📈 Compare Selling Profit",
      action: codeSnippet,
      explanation: `If we buy at the cheapest day seen so far (min = ${minVal}) and sell today (price = ${priceToday}), our profit would be ${potentialProfit}. This does not beat our previous best profit of ${prevProfit}, so we keep the current max profit.`,
      why: `We check if the current day represents the optimal time to sell given the best buying opportunity we've discovered so far.`,
      stateVars: [
        { name: "Buy Day Price", val: minVal },
        { name: "Sell Day Price", val: priceToday },
        { name: "Max Profit Target", val: prevProfit },
        { name: "Potential Profit", val: potentialProfit }
      ],
      importance: "TRIVIAL"
    };
  }

  if (codeSnippet.includes('return ')) {
    return {
      title: "🏁 Returning Max Profit",
      action: codeSnippet,
      explanation: `The simulation completes and returns our maximum recorded profit of ${profitVal}.`,
      why: `We yield the final answer back to the caller.`,
      stateVars: [
        { name: "Max Profit Earned", val: profitVal }
      ],
      importance: "CRITICAL"
    };
  }

  return null;
};
