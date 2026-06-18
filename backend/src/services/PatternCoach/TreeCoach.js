exports.generate = (ctx) => {
  const { codeSnippet, currentVars, f } = ctx;

  const getActiveNodeValue = () => {
    for (const [k, v] of Object.entries(currentVars)) {
      if (typeof v === 'string') {
        const match = v.match(/(?:id=|#)(\w+)/);
        if (match) {
          const refId = match[1];
          const obj = f.objects && f.objects[refId];
          if (obj && obj.val !== undefined) {
            return obj.val;
          }
        }
      }
    }
    return null;
  };

  const nodeVal = getActiveNodeValue();

  if (codeSnippet.includes('root == null') || codeSnippet.includes('node == null')) {
    const isNodeNull = nodeVal === null || nodeVal === undefined;
    return {
      title: "🌳 Leaf Base Case Check",
      action: codeSnippet,
      explanation: isNodeNull 
        ? "We reached an empty child (null), so its depth is 0."
        : `We check if the current node is null.`,
      why: "This stops recursion when we go past a leaf node.",
      stateVars: [
        { name: "Node", val: isNodeNull ? "null" : nodeVal }
      ],
      importance: "IMPORTANT"
    };
  }

  if (codeSnippet.includes('maxDepth(root.left)') || codeSnippet.includes('leftDepth =') || codeSnippet.includes('.left')) {
    return {
      title: "🌳 Explore Left Subtree",
      action: codeSnippet,
      explanation: `We are exploring the left subtree of node ${nodeVal || ""} first.`,
      why: "DFS explores as deep as possible down the left subtree before coming back.",
      stateVars: [],
      importance: "IMPORTANT"
    };
  }

  if (codeSnippet.includes('maxDepth(root.right)') || codeSnippet.includes('rightDepth =') || codeSnippet.includes('.right')) {
    return {
      title: "🌳 Explore Right Subtree",
      action: codeSnippet,
      explanation: `We now explore the right subtree of node ${nodeVal || ""}.`,
      why: "DFS explores the right subtree after finishing the left subtree.",
      stateVars: [],
      importance: "IMPORTANT"
    };
  }

  if (codeSnippet.includes('Math.max(leftDepth, rightDepth) + 1') || codeSnippet.includes('Math.max') || codeSnippet.includes('return')) {
    const leftDepth = parseInt(currentVars['leftDepth']) || 0;
    const rightDepth = parseInt(currentVars['rightDepth']) || 0;
    const resolved = Math.max(leftDepth, rightDepth) + 1;
    
    // Check if node is the root of the layout tree (usually the top stack element)
    const isMainRoot = f.stack && f.stack.length === 1;

    let explanationText = "";
    if (leftDepth === 0 && rightDepth === 0) {
      explanationText = `Node ${nodeVal} is a leaf (both children returned 0). Therefore, its depth is 1.`;
    } else {
      explanationText = `Both children of node ${nodeVal} finished. Comparing left depth ${leftDepth} and right depth ${rightDepth}. Node ${nodeVal} has depth ${resolved}.`;
    }

    return {
      title: "🌳 Resolve Node Max Depth",
      action: codeSnippet,
      explanation: isMainRoot
        ? `The overall maximum depth of the binary tree is ${resolved}.`
        : explanationText,
      why: `The deepest path under node ${nodeVal || ""} is selected: 1 + max(${leftDepth}, ${rightDepth}) = ${resolved}.`,
      stateVars: [
        { name: "Left Depth", val: leftDepth },
        { name: "Right Depth", val: rightDepth },
        { name: "Calculated Max Depth", val: resolved }
      ],
      importance: "CRITICAL"
    };
  }

  return null;
};
