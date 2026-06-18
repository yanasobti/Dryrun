exports.generate = (ctx) => {
  const { codeSnippet, currentVars, lastVars } = ctx;

  const slowVal = currentVars['slow'];
  const fastVal = currentVars['fast'];

  if (codeSnippet.includes('ListNode prev = null') || codeSnippet.includes('prev = null')) {
    return {
      title: "🔗 Initialize Null Pointer",
      action: codeSnippet,
      explanation: `We initialize our predecessor pointer 'prev' to null.`,
      why: `The current head node will eventually become the tail of our reversed list, which must point to null to terminate the list.`,
      stateVars: [
        { name: "Predecessor (prev)", val: "null" }
      ],
      importance: "TRIVIAL"
    };
  }

  if (codeSnippet.includes('ListNode curr = head') || codeSnippet.includes('curr = head')) {
    return {
      title: "🔗 Initialize Current Pointer",
      action: codeSnippet,
      explanation: `We initialize our active pointer 'curr' to point to the head of the list.`,
      why: `To begin our node-by-node traversal along the list chain.`,
      stateVars: [
        { name: "Active Node (curr)", val: currentVars['head'] ?? "head" }
      ],
      importance: "TRIVIAL"
    };
  }

  if (codeSnippet.includes('ListNode nextTemp = curr.next') || codeSnippet.includes('nextTemp = curr.next') || codeSnippet.includes('next = curr.next')) {
    return {
      title: "save next pointer",
      action: codeSnippet,
      explanation: `Save next node reference temporarily.`,
      why: `So we don't lose the rest of the list.`,
      stateVars: [],
      importance: "TRIVIAL"
    };
  }

  if (codeSnippet.includes('curr.next = prev')) {
    return {
      title: "🔄 Reverse Node Link",
      action: codeSnippet,
      explanation: `We reverse the node link: the current node now points backward to 'prev' instead of forward.`,
      why: `This is the core link re-binding operation that actually reverses list traversal direction in-place.`,
      stateVars: [
        { name: "Active Node (curr)", val: currentVars['curr'] },
        { name: "New Target (prev)", val: currentVars['prev'] }
      ],
      importance: "IMPORTANT"
    };
  }

  if (codeSnippet.includes('prev = curr')) {
    return {
      title: "shift prev pointer",
      action: codeSnippet,
      explanation: `Move prev pointer forward.`,
      why: `To reference the current node.`,
      stateVars: [],
      importance: "TRIVIAL"
    };
  }

  if (codeSnippet.includes('curr = nextTemp') || codeSnippet.includes('curr = next')) {
    return {
      title: "shift curr pointer",
      action: codeSnippet,
      explanation: `Move curr pointer forward.`,
      why: `To progress to the next node.`,
      stateVars: [],
      importance: "TRIVIAL"
    };
  }

  if (codeSnippet.includes('ListNode slow = head') || codeSnippet.includes('slow = head')) {
    return {
      title: "🐇 Slow Pointer Placement",
      action: codeSnippet,
      explanation: `We place our slow pointer at the head of the list.`,
      why: `This pointer will advance one node at a time to trace the list path.`,
      stateVars: [
        { name: "Slow Pointer Reference", val: currentVars['head'] }
      ],
      importance: "TRIVIAL"
    };
  }

  if (codeSnippet.includes('ListNode fast = head') || codeSnippet.includes('fast = head')) {
    return {
      title: "🐇 Fast Pointer Placement",
      action: codeSnippet,
      explanation: `We place our fast pointer at the head of the list.`,
      why: `This pointer will advance two nodes at a time. The speed difference ensures it will catch the slow pointer if a loop exists.`,
      stateVars: [
        { name: "Fast Pointer Reference", val: currentVars['head'] }
      ],
      importance: "TRIVIAL"
    };
  }

  if (codeSnippet.includes('slow = slow.next')) {
    return {
      title: "advance slow pointer",
      action: codeSnippet,
      explanation: `Advance slow pointer.`,
      why: `To move forward along the list.`,
      stateVars: [],
      importance: "TRIVIAL"
    };
  }

  if (codeSnippet.includes('fast = fast.next.next')) {
    return {
      title: "advance fast pointer",
      action: codeSnippet,
      explanation: `Advance fast pointer.`,
      why: `To move forward at double speed.`,
      stateVars: [],
      importance: "TRIVIAL"
    };
  }

  if (codeSnippet.includes('slow == fast') || codeSnippet.includes('slow === fast')) {
    return {
      title: "💥 Loop Cycle Collision",
      action: codeSnippet,
      explanation: `We check if the slow and fast pointers have converged on the same memory node.`,
      why: `If they meet, it proves the linked list loops back on itself recursively, verifying a cycle (Floyd's Algorithm).`,
      stateVars: [
        { name: "Slow Pointer Node", val: currentVars['slow'] },
        { name: "Fast Pointer Node", val: currentVars['fast'] }
      ],
      importance: "CRITICAL"
    };
  }

  if (codeSnippet.includes('return ')) {
    return {
      title: "🏁 Returning List Value",
      action: codeSnippet,
      explanation: `We return our final traversal node or state boolean.`,
      why: `To complete our function execution and send control back.`,
      stateVars: [],
      importance: "CRITICAL"
    };
  }

  return null;
};
