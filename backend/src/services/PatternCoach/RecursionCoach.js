exports.generate = (ctx) => {
  const { codeSnippet, currentVars, lastVars, f, prevStep } = ctx;

  const currentDepth = f.stack ? f.stack.length : 0;
  const prevDepth = prevStep && prevStep.stack ? prevStep.stack.length : 0;
  const isCall = currentDepth > prevDepth;
  const topFrame = f.stack && f.stack.length > 0 ? f.stack[f.stack.length - 1] : null;
  const methodName = topFrame ? topFrame.methodName : '';

  if (f.isExit && f.returnValue && f.returnValue !== '<void value>' && methodName === 'factorial') {
    const nVal = currentVars['n'];
    if (nVal === 1) {
      return {
        title: "🪜 Base Case Returned",
        action: `return 1;`,
        explanation: `We've reached the base case for \`factorial(1)\`! The function returns **1** directly. 🧩`,
        why: `This terminates the recursion chain and triggers the resolution of the recursive call stack.`,
        isSignificant: true
      };
    } else if (nVal) {
      return {
        title: "🪜 Recursion Step Resolved",
        action: `return ${nVal} * factorial(${nVal - 1});`,
        explanation: `We're returning from \`factorial(${nVal})\`! It calculates \`${nVal} * factorial(${nVal - 1})\`, which evaluates to **${f.returnValue}**. 🚀`,
        why: `Each waiting frame in the stack can now solve its own multiplication using this returned value.`,
        isSignificant: true
      };
    }
  }

  if (isCall && methodName === 'factorial') {
    const nVal = currentVars['n'];
    if (nVal === 1) {
      return {
        title: "🪜 Enter Base Case",
        action: `factorial(1)`,
        explanation: `We are now inside \`factorial(1)\`. Since \`n == 1\`, we've reached the base case. 🎯`,
        why: `The function will return 1 directly without making any further recursive calls, stopping the recursion.`,
        isSignificant: true
      };
    } else if (nVal) {
      return {
        title: "🪜 Push Recursive Call",
        action: `factorial(${nVal})`,
        explanation: `We just called \`factorial(${nVal})\`. To calculate this, we must first find the result of \`factorial(${nVal - 1})\`. 🪜`,
        why: `A new call frame is pushed to the stack to solve the smaller sub-problem first.`,
        isSignificant: true
      };
    }
  }

  return null;
};
