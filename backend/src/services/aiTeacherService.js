exports.generateExplanation = (codeLines, f, prevStep, i) => {
  const codeSnippet = codeLines[f.line - 1] ? codeLines[f.line - 1].trim() : "";
  
  let action = codeSnippet || `Line ${f.adjustedLine}`;
  let explanation = `Executing line ${f.adjustedLine}`;
  let why = "This is the next sequential statement in the program flow.";
  
  const currentVars = f.variables;
  const changed = [];
  const lastVars = prevStep ? prevStep.variables : {};
  
  for (const [k, v] of Object.entries(currentVars)) {
    if (lastVars[k] === undefined) {
      changed.push(`initialized \`${k}\` to **${v}**`);
    } else if (lastVars[k] !== v) {
      changed.push(`updated \`${k}\` to **${v}**`);
    }
  }

  const prevDepth = prevStep && prevStep.stack ? prevStep.stack.length : 0;
  const currentDepth = f.stack ? f.stack.length : 0;
  const isCall = currentDepth > prevDepth;
  
  const topFrame = f.stack && f.stack.length > 0 ? f.stack[f.stack.length - 1] : null;
  const methodName = topFrame ? topFrame.methodName : '';

  if (f.isExit && f.returnValue && f.returnValue !== '<void value>') {
    action = `return ${f.returnValue};`;
    explanation = `Method \`${methodName}()\` has finished executing and is returning **${f.returnValue}** to its caller. 🚀`;
    why = `The method has completed its calculations and is handing control back to the calling function.`;
    if (methodName === 'factorial') {
      const nVal = currentVars['n'];
      if (nVal === 1) {
        action = `return 1;`;
        explanation = `We've reached the base case for \`factorial(1)\`! The function returns **1** directly. 🧩`;
        why = `This terminates the recursion chain and triggers the resolution of the recursive call stack.`;
      } else if (nVal) {
        action = `return ${nVal} * factorial(${nVal - 1});`;
        explanation = `We're returning from \`factorial(${nVal})\`! It calculates \`${nVal} * factorial(${nVal - 1})\`, which evaluates to **${f.returnValue}**. 🚀`;
        why = `Each waiting frame in the stack can now solve its own multiplication using this returned value.`;
      }
    }
  } else if (isCall && methodName === 'factorial') {
    const nVal = currentVars['n'];
    if (nVal === 1) {
      action = `factorial(1)`;
      explanation = `We are now inside \`factorial(1)\`. Since \`n == 1\`, we've reached the base case. 🎯`;
      why = `The function will return 1 directly without making any further recursive calls, stopping the recursion.`;
    } else if (nVal) {
      action = `factorial(${nVal})`;
      explanation = `We just called \`factorial(${nVal})\`. To calculate this, we must first find the result of \`factorial(${nVal - 1})\`. 🪜`;
      why = `A new call frame is pushed to the stack to solve the smaller sub-problem first.`;
    }
  } else if (codeSnippet.includes('System.out.println')) {
    const match = codeSnippet.match(/println\((.*?)\)/);
    const val = match ? match[1] : '';
    action = codeSnippet;
    explanation = `We are printing the value of \`${val}\` to the console. 🖨️`;
    why = `To output information to standard console, making it visible to the user.`;
  } else if (codeSnippet.match(/(\w+)\s*=\s*\+\+(\w+)/)) {
    const match = codeSnippet.match(/(\w+)\s*=\s*\+\+(\w+)/);
    action = codeSnippet;
    explanation = `Ah, the tricky **pre-increment** operator (\`++${match[2]}\`)! We increase \`${match[2]}\` by 1 *first*, and then assign that new value to \`${match[1]}\`. 🧠`;
    why = `The pre-increment operator ++ prefix means incrementing takes place *before* expression evaluation and assignment.`;
  } else if (codeSnippet.match(/(\w+)\s*=\s*(\w+)\+\+/)) {
    const match = codeSnippet.match(/(\w+)\s*=\s*(\w+)\+\+/);
    action = codeSnippet;
    explanation = `Watch closely! This is the **post-increment** operator (\`${match[2]}++\`). It assigns the *current* value of \`${match[2]}\` to \`${match[1]}\` first, and *then* increases \`${match[2]}\` by 1. 👀`;
    why = `The post-increment ++ suffix means assignment happens *before* the variable actually increments in memory.`;
  } else if (codeSnippet.match(/int\s+(\w+)\s*=\s*([^;]+);/)) {
    const match = codeSnippet.match(/int\s+(\w+)\s*=\s*([^;]+);/);
    action = codeSnippet;
    if (match[2].includes('+') || match[2].includes('-') || match[2].includes('*')) {
      explanation = `We are evaluating the math expression \`${match[2]}\` and storing the result in a new integer variable called \`${match[1]}\`. 🧮`;
      why = `The right-hand side arithmetic completes first, then its result is saved into the variable's memory slot.`;
    } else {
      explanation = `We are creating a new integer variable named \`${match[1]}\` and initializing its value to \`${match[2]}\`. 📦`;
      why = `Allocating a small storage box in memory to store this value for later use.`;
    }
  } else if (changed.length > 0) {
    action = codeSnippet;
    explanation = `Boom! We just ${changed.join(' and ')}. 💥`;
    why = `The statement changed the active values of variables in our memory space.`;
  } else if (codeSnippet.includes('for (')) {
    action = codeSnippet;
    explanation = `We are evaluating the \`for\` loop condition! We'll execute the loop body as long as the condition remains true. 🔄`;
    why = `To determine whether to enter another iteration or terminate the loop.`;
  } else if (codeSnippet.includes('while (')) {
    action = codeSnippet;
    explanation = `We are checking a \`while\` loop condition. If it's true, we'll execute the loop body again. 🎡`;
    why = `To loop dynamically until the controlling condition becomes false.`;
  } else if (codeSnippet.includes('if (')) {
    action = codeSnippet;
    explanation = `Decision time! We are evaluating the \`if\` condition to see which path the code should take. 🔀`;
    why = `Branching logic helps the program decide whether to run the enclosed block or skip it.`;
  } else if (codeSnippet.includes('return')) {
    action = codeSnippet;
    explanation = `We are hitting a \`return\` statement! This means we are sending a value back and exiting the current method. 🚀`;
    why = `To yield control back to the caller function with the return result.`;
  } else if (i === 0) {
    action = `Start Execution`;
    explanation = `Welcome to DryRun! 👋 We just stepped into the \`main\` method, which is the starting point of every Java program. Let's trace this step-by-step!`;
    why = `Every Java application begins execution from the public static void main method.`;
  } else if (codeSnippet === '}') {
    action = `Exit scope`;
    explanation = `We reached the end of the block. Cleaning up scope! 🧹`;
    why = `Any variables defined inside this block are discarded as their lifecycle ends.`;
  }

  return { action, explanation, why };
};
