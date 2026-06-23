exports.generate = (ctx) => {
  const { codeSnippet, currentVars, lastVars, methodName } = ctx;

  const keyVal = currentVars['key'];
  const valueVal = currentVars['value'];
  const capVal = currentVars['capacity'];

  // Constructor
  if (codeSnippet.includes('this.capacity =') || codeSnippet.includes('new Node(-1, -1)')) {
    return {
      title: "⚡ Initialize Cache Sentinels",
      action: codeSnippet,
      explanation: `We are initializing the cache with dummy head and tail sentinel nodes.`,
      why: `Sentinel nodes act as fixed boundary markers at the front and back of the doubly linked list, helping us avoid null pointer checks during insertions and removals.`,
      stateVars: [],
      importance: "IMPORTANT"
    };
  }

  // put method
  if (methodName === 'put') {
    if (codeSnippet.includes('map.containsKey(key)')) {
      return {
        title: "🔍 Check Cache Existence",
        action: codeSnippet,
        explanation: `We check if key ${keyVal} is already stored in the cache lookup table.`,
        why: `If it exists, we will update its value and move it to the front as the most recently used item. Otherwise, we will insert it as a new item.`,
        stateVars: [],
        importance: "IMPORTANT"
      };
    }
    if (codeSnippet.includes('node.val = value')) {
      return {
        title: "✏️ Update Cache Entry",
        action: codeSnippet,
        explanation: `We update the value of key ${keyVal} to ${valueVal}.`,
        why: `The key is already in the cache, so we overwrite its old value in memory.`,
        stateVars: [],
        importance: "IMPORTANT"
      };
    }
    if (codeSnippet.includes('map.size() >= capacity')) {
      return {
        title: "⚠️ Cache Capacity Check",
        action: codeSnippet,
        explanation: `We check if the cache has reached its maximum capacity limit.`,
        why: `If the cache is full, we must evict the least recently used node from the back of the cache before inserting the new one.`,
        stateVars: [],
        importance: "CRITICAL"
      };
    }
    if (codeSnippet.includes('Node lru = tail.prev')) {
      const lruKey = currentVars['lru'] ? currentVars['lru'].key : "least recently used item";
      return {
        title: "⏳ Identify Least Recently Used Node",
        action: codeSnippet,
        explanation: `We identify the least recently used node, which sits right before the dummy tail.`,
        why: `The node closest to the tail represents the item that hasn't been accessed for the longest time, making it the candidate for eviction.`,
        stateVars: [],
        importance: "CRITICAL"
      };
    }
    if (codeSnippet.includes('map.remove(lru.key)')) {
      return {
        title: "🗑️ Evict Least Recently Used Item",
        action: codeSnippet,
        explanation: `We remove the least recently used item's key from the lookup table.`,
        why: `To free up space in the cache for the incoming new item.`,
        stateVars: [],
        importance: "CRITICAL"
      };
    }
    if (codeSnippet.includes('new Node(key, value)')) {
      return {
        title: "🆕 Create New Node",
        action: codeSnippet,
        explanation: `We create a new node containing key ${keyVal} and value ${valueVal}.`,
        why: `To store the new entry in our doubly linked list.`,
        stateVars: [],
        importance: "IMPORTANT"
      };
    }
    if (codeSnippet.includes('map.put(key, node)')) {
      return {
        title: "💾 Store in Lookup Table",
        action: codeSnippet,
        explanation: `We add the new node to the lookup table for O(1) constant-time access.`,
        why: `Storing the node reference in the map allows us to find it instantly in the future without walking the list.`,
        stateVars: [],
        importance: "IMPORTANT"
      };
    }
  }

  // get method
  if (methodName === 'get') {
    if (codeSnippet.includes('!map.containsKey(key)')) {
      return {
        title: "🔍 Cache Lookup",
        action: codeSnippet,
        explanation: `We check if key ${keyVal} exists in our cache map.`,
        why: `If it is not present, we return -1 (Cache Miss). If it is present, we will retrieve its value and update its recency status.`,
        stateVars: [],
        importance: "IMPORTANT"
      };
    }
    if (codeSnippet.includes('return -1')) {
      return {
        title: "❌ Cache Miss",
        action: codeSnippet,
        explanation: `Key ${keyVal} was not found in the cache. Returning -1.`,
        why: `Since the requested key doesn't exist, we notify the caller of a cache miss.`,
        stateVars: [],
        importance: "CRITICAL"
      };
    }
    if (codeSnippet.includes('Node node = map.get(key)')) {
      return {
        title: "✅ Cache Hit",
        action: codeSnippet,
        explanation: `We retrieve the node for key ${keyVal} from our lookup table.`,
        why: `Since the key is present, we fetch the corresponding list node.`,
        stateVars: [],
        importance: "IMPORTANT"
      };
    }
    if (codeSnippet.includes('return node.val')) {
      return {
        title: "🏁 Return Value",
        action: codeSnippet,
        explanation: `Returning the cached value.`,
        why: `The operation is complete, returning the node's value.`,
        stateVars: [],
        importance: "IMPORTANT"
      };
    }
  }

  // remove method
  if (methodName === 'remove') {
    if (codeSnippet.includes('node.prev.next = node.next')) {
      return {
        title: "🔗 Unlink from Previous Node",
        action: codeSnippet,
        explanation: `We link the previous node's next pointer directly to the current node's next neighbor.`,
        why: `This bypasses the current node from the forward direction of the list.`,
        stateVars: [],
        importance: "IMPORTANT"
      };
    }
    if (codeSnippet.includes('node.next.prev = node.prev')) {
      return {
        title: "🔗 Unlink from Next Node",
        action: codeSnippet,
        explanation: `We link the next node's previous pointer directly to the current node's previous neighbor.`,
        why: `This completes the unlinking of the node from both directions of the list.`,
        stateVars: [],
        importance: "IMPORTANT"
      };
    }
  }

  // insert method
  if (methodName === 'insert') {
    if (codeSnippet.includes('Node nextTemp = head.next')) {
      return {
        title: "💾 Save First Node",
        action: codeSnippet,
        explanation: `We save the reference to the current first node in the cache (the node after the dummy head).`,
        why: `To avoid losing the rest of the list when we insert the new node in front of it.`,
        stateVars: [],
        importance: "TRIVIAL"
      };
    }
    if (codeSnippet.includes('head.next = node')) {
      return {
        title: "🔗 Link Head to Node",
        action: codeSnippet,
        explanation: `We point the dummy head's next pointer to our node.`,
        why: `This places the node at the front of the cache, marking it as the most recently used.`,
        stateVars: [],
        importance: "IMPORTANT"
      };
    }
    if (codeSnippet.includes('node.prev = head')) {
      return {
        title: "🔗 Link Node Back to Head",
        action: codeSnippet,
        explanation: `We point the node's previous pointer to the dummy head.`,
        why: `To establish the backward link for the doubly linked list.`,
        stateVars: [],
        importance: "TRIVIAL"
      };
    }
    if (codeSnippet.includes('node.next = nextTemp')) {
      return {
        title: "🔗 Link Node to Rest of List",
        action: codeSnippet,
        explanation: `We point the node's next pointer to the previous first node.`,
        why: `To reconnect the node with the rest of the doubly linked list.`,
        stateVars: [],
        importance: "IMPORTANT"
      };
    }
    if (codeSnippet.includes('nextTemp.prev = node')) {
      return {
        title: "🔗 Complete Linkage",
        action: codeSnippet,
        explanation: `We link the previous first node's previous pointer back to our node.`,
        why: `This completes the double-linking process, making the node the new head of the list.`,
        stateVars: [],
        importance: "IMPORTANT"
      };
    }
  }

  // Common operations called inside get/put
  if (codeSnippet.includes('remove(node)')) {
    return {
      title: "✂️ Remove Node from List",
      action: codeSnippet,
      explanation: `We remove the node from its current position in the doubly linked list.`,
      why: `Before we can move it to the front of the cache, we must unlink it from its current position.`,
      stateVars: [],
      importance: "IMPORTANT"
    };
  }
  if (codeSnippet.includes('insert(node)')) {
    return {
      title: "📌 Insert Node at Front",
      action: codeSnippet,
      explanation: `We insert the node at the front of the cache (just after the dummy head).`,
      why: `This marks it as the most recently used item in the cache.`,
      stateVars: [],
      importance: "IMPORTANT"
    };
  }
  if (codeSnippet.includes('remove(lru)')) {
    return {
      title: "✂️ Remove Least Recently Used Node",
      action: codeSnippet,
      explanation: `We unlink the least recently used node from the doubly linked list.`,
      why: `To complete its eviction from the cache.`,
      stateVars: [],
      importance: "CRITICAL"
    };
  }

  return null;
};
