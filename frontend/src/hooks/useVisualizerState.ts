import { useMemo } from 'react';

export interface VisualizerState {
  primaryType: 'array' | 'linkedlist' | 'tree' | 'hashmap' | 'hashset' | 'recursion' | 'matrix' | 'graph' | 'heap' | 'backtracking' | 'stack' | 'general';
  detectedTypes: ('array' | 'linkedlist' | 'tree' | 'hashmap' | 'hashset' | 'recursion' | 'matrix' | 'graph' | 'heap' | 'backtracking' | 'stack')[];
  arrays: { name: string; values: any[] }[];
  linkedLists: { name: string; rootRefId: string; nodes: Record<string, any>; hasCycle: boolean }[];
  trees: { name: string; rootRefId: string; nodes: Record<string, any> }[];
  hashMaps: { name: string; entries: [string, string][] }[];
  hashSets: { name: string; values: string[] }[];
  recursion: { stack: any[]; isRecursive: boolean };
  matrices: { name: string; grid: any[][] }[];
  graphs: { name: string; rootRefId: string; nodes: Record<string, any> }[];
  heaps: { name: string; elements: any[] }[];
  stacks: { name: string; values: any[] }[];
  variables: Record<string, any>;
  explanation: string;
  line: number;
  heapObjects: Record<string, any>;
}

const parseSetEntries = (setStr: string): string[] => {
  if (!setStr || setStr === "null") return [];
  const str = setStr.trim();
  const startIdx = str.indexOf('[');
  const endIdx = str.lastIndexOf(']');
  if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) return [];
  const inner = str.substring(startIdx + 1, endIdx).trim();
  if (!inner) return [];
  return inner.split(',').map(item => item.trim()).filter(Boolean);
};

// Helper to parse Map elements from Java HashMap toString representation (e.g. "{2=0, 7=1}")
const parseMapEntries = (mapStr: string): [string, string][] => {
  if (!mapStr || mapStr === "null") return [];
  const str = mapStr.trim();
  const startIdx = str.indexOf('{');
  const endIdx = str.lastIndexOf('}');
  if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) return [];
  const inner = str.substring(startIdx + 1, endIdx).trim();
  if (!inner) return [];

  const entries: [string, string][] = [];
  let current = "";
  let bracketDepth = 0;

  for (let i = 0; i < inner.length; i++) {
    const char = inner[i];
    if (char === '[') bracketDepth++;
    else if (char === ']') bracketDepth--;

    if (char === ',' && bracketDepth === 0) {
      const parts = current.split('=');
      if (parts.length >= 2) {
        entries.push([parts[0].trim(), parts.slice(1).join('=').trim()]);
      }
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    const parts = current.split('=');
    if (parts.length >= 2) {
      entries.push([parts[0].trim(), parts.slice(1).join('=').trim()]);
    }
  }
  return entries;
};

// Check if a structure is a binary tree
const isBinaryTree = (rootId: string, objects: Record<string, any>, varName: string): boolean => {
  const visited = new Set<string>();
  const queue = [rootId];
  const lowerName = varName.toLowerCase();
  
  if (lowerName.includes('tree') || lowerName.includes('root') || lowerName.includes('bst') || lowerName.includes('trie')) {
    return true;
  }

  const rootNode = objects[rootId];
  if (rootNode) {
    const lowerClass = (rootNode.className || "").toLowerCase();
    if (lowerClass.includes('tree') || lowerClass.includes('bst') || lowerClass.includes('trie')) {
      return true;
    }
  }

  while (queue.length > 0) {
    const id = queue.shift();
    if (!id || visited.has(id)) continue;
    visited.add(id);
    const node = objects[id];
    if (node) {
      if (node.left || node.right || node.leftRef || node.rightRef) {
        return true;
      }
      if (node.next) queue.push(node.next);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  return false;
};

const isLinkedListNode = (refId: string, objects: Record<string, any>, varName: string): boolean => {
  const node = objects[refId];
  if (!node) return false;

  const lowerName = varName.toLowerCase();
  const lowerClass = (node.className || "").toLowerCase();

  // If the variable name or class name explicitly says list/node/link
  if (lowerClass.includes('listnode') || lowerClass.includes('node') || lowerClass.includes('link') ||
      lowerName.includes('node') || lowerName.includes('head') || lowerName.includes('tail') || lowerName.includes('curr')) {
    if (!lowerClass.includes('java.util') && !lowerClass.includes('java.io') && !lowerClass.includes('java.lang')) {
      return true;
    }
  }

  // Otherwise, check if the object has a 'next' or 'nextRef' field
  if ('next' in node || 'nextRef' in node) {
    return true;
  }

  return false;
};

export const useVisualizerState = (
  frames: any[],
  currentFrameIndex: number
): VisualizerState => {
  return useMemo(() => {
    const defaultState: VisualizerState = {
      primaryType: 'general',
      detectedTypes: [],
      arrays: [],
      linkedLists: [],
      trees: [],
      hashMaps: [],
      hashSets: [],
      recursion: { stack: [], isRecursive: false },
      matrices: [],
      graphs: [],
      heaps: [],
      stacks: [],
      variables: {},
      explanation: 'No execution data loaded.',
      line: 1,
      heapObjects: {}
    };

    if (!frames || frames.length === 0 || currentFrameIndex < 0 || currentFrameIndex >= frames.length) {
      return defaultState;
    }

    const frame = frames[currentFrameIndex];
    const variables = frame.variables || {};
    const heapObjects = frame.objects || {};
    const explanation = frame.explanation || '';
    const line = frame.line || 1;

    // 1. Extract Arrays
    const arrays: { name: string; values: any[] }[] = [];
    if (frame.arrays) {
      Object.entries(frame.arrays).forEach(([name, values]) => {
        if (Array.isArray(values)) {
          arrays.push({ name, values });
        }
      });
    }

    // 1b. Convert String variables to virtual character arrays so they can be visualized
    Object.entries(variables).forEach(([name, val]) => {
      if (name === 'args' || name === 'returnValue') return;
      if (typeof val === 'string') {
        let cleanedStr = val.trim();
        if (cleanedStr.startsWith('"') && cleanedStr.endsWith('"')) {
          cleanedStr = cleanedStr.substring(1, cleanedStr.length - 1);
          if (!cleanedStr.includes('instance of') && !cleanedStr.includes('(#') && !cleanedStr.includes('{') && !cleanedStr.includes('[')) {
            if (!arrays.some(arr => arr.name === name)) {
              arrays.push({
                name,
                values: cleanedStr.split('')
              });
            }
          }
        }
      }
    });

    // Merge all objects across all frames to construct a unified heap database
    const completeHeap: Record<string, any> = {};
    frames.forEach(f => {
      if (f.objects) {
        Object.entries(f.objects).forEach(([k, v]) => {
          completeHeap[k] = { ...completeHeap[k], ...(v as any) };
        });
      }
    });

    // 2. Extract Object variables (Linked Lists & Trees)
    const linkedLists: { name: string; rootRefId: string; nodes: Record<string, any>; hasCycle: boolean }[] = [];
    const trees: { name: string; rootRefId: string; nodes: Record<string, any> }[] = [];

    // Find variables referring to class instances in the active frame
    const objVarRefs: { name: string; refId: string }[] = [];
    Object.entries(variables).forEach(([k, v]) => {
      if (k === 'args') return;
      if (typeof v === 'string') {
        const match = v.match(/id=([a-fA-F0-9]+)/);
        if (match) {
          objVarRefs.push({ name: k, refId: match[1] });
        }
      }
    });

    const traversedListNodes = new Set<string>();

    // Always detect the tree root from the first frame's variables to keep the tree fixed at the main root
    const firstFrame = frames[0];
    const firstObjVarRefs: { name: string; refId: string }[] = [];
    if (firstFrame) {
      Object.entries(firstFrame.variables || {}).forEach(([k, v]) => {
        if (k === 'args') return;
        if (typeof v === 'string') {
          const match = v.match(/id=([a-fA-F0-9]+)/);
          if (match) {
            firstObjVarRefs.push({ name: k, refId: match[1] });
          }
        }
      });
    }

    firstObjVarRefs.forEach(({ name, refId }) => {
      if (completeHeap[refId] && isBinaryTree(refId, completeHeap, name)) {
        if (!trees.some(t => t.rootRefId === refId)) {
          trees.push({
            name,
            rootRefId: refId,
            nodes: completeHeap
          });
        }
      }
    });

    // If trees were not found via the first frame, fallback to active frame references
    if (trees.length === 0) {
      objVarRefs.forEach(({ name, refId }) => {
        if (completeHeap[refId] && isBinaryTree(refId, completeHeap, name)) {
          if (!trees.some(t => t.rootRefId === refId)) {
            trees.push({
              name,
              rootRefId: refId,
              nodes: completeHeap
            });
          }
        }
      });
    }

    // Process Linked Lists
    objVarRefs.forEach(({ name, refId }) => {
      if (heapObjects[refId] && !isBinaryTree(refId, heapObjects, name) && isLinkedListNode(refId, heapObjects, name)) {
        if (!traversedListNodes.has(refId)) {
          // Detect Cycle in Linked List and collect traversed nodes
          let currId: string | undefined = refId;
          const visited = new Set<string>();
          while (currId && heapObjects[currId] && !visited.has(currId)) {
            visited.add(currId);
            traversedListNodes.add(currId);
            currId = heapObjects[currId].next;
          }
          const hasCycle = !!(currId && visited.has(currId));

          linkedLists.push({
            name,
            rootRefId: refId,
            nodes: heapObjects,
            hasCycle
          });
        }
      }
    });

    // 3. Extract HashMaps
    const hashMaps: { name: string; entries: [string, string][] }[] = [];
    Object.entries(variables).forEach(([k, v]) => {
      if (k === 'args') return;
      const vStr = String(v);
      if (vStr.includes('HashMap') || vStr.includes('Map') || (vStr.includes('{') && vStr.includes('}'))) {
        const entries = parseMapEntries(vStr);
        hashMaps.push({ name: k, entries });
      }
    });

    // 3b. Extract HashSets
    const hashSets: { name: string; values: string[] }[] = [];
    Object.entries(variables).forEach(([k, v]) => {
      if (k === 'args') return;
      const vStr = String(v);
      const isHashSet = vStr.includes('HashSet') || vStr.includes('Set') || vStr.includes('TreeSet') ||
        (vStr.includes('[') && vStr.includes(']') && !vStr.includes('class') && !Array.isArray(v) && !/\b\w+\[\d*\]/.test(vStr) && !vStr.includes('(#'));
      if (isHashSet) {
        const values = parseSetEntries(vStr);
        hashSets.push({ name: k, values });
      }
    });

    // 3c. Extract Matrices
    const matrices: { name: string; grid: any[][] }[] = [];
    const filteredArrays = arrays.filter(arr => {
      if (arr.values.length > 0 && Array.isArray(arr.values[0])) {
        matrices.push({ name: arr.name, grid: arr.values });
        return false;
      }
      return true;
    });

    // 3d. Extract Heaps
    const heaps: { name: string; elements: any[] }[] = [];
    Object.entries(variables).forEach(([k, v]) => {
      if (k === 'args') return;
      const vStr = String(v);
      const isHeap = k.toLowerCase().includes('heap') || k.toLowerCase().includes('pq') || vStr.includes('PriorityQueue') || vStr.includes('Queue');
      if (isHeap) {
        const elements = parseSetEntries(vStr);
        heaps.push({ name: k, elements });
      }
    });

    // 3e. Extract Graphs
    const graphs: { name: string; rootRefId: string; nodes: Record<string, any> }[] = [];
    objVarRefs.forEach(({ name, refId }) => {
      const node = completeHeap[refId];
      if (node && 'neighbors' in node) {
        if (!graphs.some(g => g.rootRefId === refId)) {
          graphs.push({
            name,
            rootRefId: refId,
            nodes: completeHeap
          });
        }
      }
    });

    // 3f. Extract Stacks
    const stacks: { name: string; values: any[] }[] = [];
    Object.entries(variables).forEach(([k, v]) => {
      if (k === 'args') return;
      const vStr = String(v);
      const isStack = k.toLowerCase().includes('stack') || k.toLowerCase() === 'st' || vStr.includes('Stack') || vStr.includes('Deque') || vStr.includes('ArrayDeque');
      if (isStack) {
        const values = parseSetEntries(vStr);
        stacks.push({ name: k, values });
      }
    });

    // 4. Extract Recursion / Call Stack
    const stack = frame.stack || [];
    const methodCounts: Record<string, number> = {};
    let isRecursive = false;

    stack.forEach((sf: any) => {
      methodCounts[sf.methodName] = (methodCounts[sf.methodName] || 0) + 1;
      if (methodCounts[sf.methodName] > 1) {
        isRecursive = true;
      }
    });

    // 5. Determine Detected Types & Primary Type
    const detectedTypes: ('array' | 'linkedlist' | 'tree' | 'hashmap' | 'hashset' | 'recursion' | 'matrix' | 'graph' | 'heap' | 'backtracking' | 'stack')[] = [];
    const isBacktracking = isRecursive && (variables['tempList'] !== undefined || variables['path'] !== undefined || variables['subset'] !== undefined);

    if (isBacktracking) detectedTypes.push('backtracking');
    if (isRecursive) detectedTypes.push('recursion');
    if (graphs.length > 0) detectedTypes.push('graph');
    if (trees.length > 0) detectedTypes.push('tree');
    if (linkedLists.length > 0) detectedTypes.push('linkedlist');
    if (matrices.length > 0) detectedTypes.push('matrix');
    if (filteredArrays.length > 0) detectedTypes.push('array');
    if (heaps.length > 0) detectedTypes.push('heap');
    if (hashMaps.length > 0) detectedTypes.push('hashmap');
    if (hashSets.length > 0) detectedTypes.push('hashset');
    if (stacks.length > 0) detectedTypes.push('stack');

    let primaryType: 'array' | 'linkedlist' | 'tree' | 'hashmap' | 'hashset' | 'recursion' | 'matrix' | 'graph' | 'heap' | 'backtracking' | 'stack' | 'general' = 'general';
    if (isBacktracking) {
      primaryType = 'backtracking';
    } else if (isRecursive) {
      primaryType = 'recursion';
    } else if (graphs.length > 0) {
      primaryType = 'graph';
    } else if (trees.length > 0) {
      primaryType = 'tree';
    } else if (linkedLists.length > 0) {
      primaryType = 'linkedlist';
    } else if (matrices.length > 0) {
      primaryType = 'matrix';
    } else if (stacks.length > 0) {
      primaryType = 'stack';
    } else if (filteredArrays.length > 0) {
      primaryType = 'array';
    } else if (heaps.length > 0) {
      primaryType = 'heap';
    } else if (hashMaps.length > 0) {
      primaryType = 'hashmap';
    } else if (hashSets.length > 0) {
      primaryType = 'hashset';
    }

    return {
      primaryType,
      detectedTypes,
      arrays: filteredArrays,
      linkedLists,
      trees,
      hashMaps,
      hashSets,
      recursion: { stack, isRecursive },
      matrices,
      graphs,
      heaps,
      stacks,
      variables,
      explanation,
      line,
      heapObjects: completeHeap
    };
  }, [frames, currentFrameIndex]);
};

