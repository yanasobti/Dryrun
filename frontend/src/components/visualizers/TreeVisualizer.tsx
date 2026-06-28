import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface TreeVisualizerProps {
  name?: string;
  rootRefId: string;
  nodes: Record<string, any>;
  variables: Record<string, any>;
  frames?: any[];
  currentFrameIndex?: number;
}

interface TreeNodePos {
  refId: string;
  val: any;
  x: number;
  y: number;
  left?: string;
  right?: string;
}

// Build layout starting at center x, y, spacing
const buildTreeLayout = (
  rootId: string,
  nodes: Record<string, any>,
  x: number,
  y: number,
  hSpacing: number,
  visited: Set<string> = new Set()
): TreeNodePos[] => {
  if (!rootId || !nodes[rootId] || visited.has(rootId)) return [];
  visited.add(rootId);

  const node = nodes[rootId];
  const list: TreeNodePos[] = [{
    refId: rootId,
    val: node.val,
    x,
    y,
    left: node.left,
    right: node.right
  }];

  const vSpacing = 56; // Depth height between layers
  const nextHSpacing = hSpacing * 0.52;

  // Resolve left child ID
  let leftId = null;
  if (node.left) {
    if (typeof node.left === 'string') {
      const match = node.left.match(/id=([a-fA-F0-9]+)/);
      leftId = match ? match[1] : node.left;
    } else if (node.left.refId) {
      leftId = node.left.refId;
    } else {
      leftId = String(node.left);
    }
  }

  // Resolve right child ID
  let rightId = null;
  if (node.right) {
    if (typeof node.right === 'string') {
      const match = node.right.match(/id=([a-fA-F0-9]+)/);
      rightId = match ? match[1] : node.right;
    } else if (node.right.refId) {
      rightId = node.right.refId;
    } else {
      rightId = String(node.right);
    }
  }

  if (leftId && nodes[leftId]) {
    list.push(...buildTreeLayout(leftId, nodes, x - hSpacing, y + vSpacing, nextHSpacing, visited));
  }
  if (rightId && nodes[rightId]) {
    list.push(...buildTreeLayout(rightId, nodes, x + hSpacing, y + vSpacing, nextHSpacing, visited));
  }
  return list;
};

// Helper to find path from start node to target node
const findTreePath = (
  currId: string,
  targetId: string,
  nodes: Record<string, any>,
  visited = new Set<string>()
): string[] | null => {
  if (!currId || visited.has(currId)) return null;
  visited.add(currId);
  
  if (currId === targetId) return [currId];
  
  const node = nodes[currId];
  if (node) {
    let leftId = null;
    if (node.left) {
      const match = String(node.left).match(/id=([a-fA-F0-9]+)/);
      leftId = match ? match[1] : String(node.left);
    }
    
    let rightId = null;
    if (node.right) {
      const match = String(node.right).match(/id=([a-fA-F0-9]+)/);
      rightId = match ? match[1] : String(node.right);
    }

    if (leftId) {
      const leftPath = findTreePath(leftId, targetId, nodes, visited);
      if (leftPath) return [currId, ...leftPath];
    }
    if (rightId) {
      const rightPath = findTreePath(rightId, targetId, nodes, visited);
      if (rightPath) return [currId, ...rightPath];
    }
  }
  return null;
};

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({
  rootRefId,
  nodes,
  variables,
  frames = [],
  currentFrameIndex = 0
}) => {
  // Compute resolved depths of nodes from stack trace history
  const nodeDepths = useMemo(() => {
    const depths: Record<string, number> = {};
    for (let i = 0; i <= currentFrameIndex; i++) {
      const f = frames[i];
      if (!f) continue;
      if (f.returnValue !== undefined && f.returnValue !== null && f.returnValue !== "void") {
        const prevFrame = frames[i - 1];
        if (prevFrame && prevFrame.stack && prevFrame.stack.length > 0) {
          const returningFrame = prevFrame.stack[prevFrame.stack.length - 1];
          let refId = null;
          for (const v of Object.values(returningFrame.variables || {})) {
            if (typeof v === 'string') {
              const match = v.match(/(?:#|id=)(\w+)/);
              if (match) {
                refId = match[1];
                break;
              }
            }
          }
          if (refId) {
            const parsedDepth = parseInt(f.returnValue);
            if (!isNaN(parsedDepth)) {
              depths[refId] = parsedDepth;
            }
          }
        }
      }
    }
    return depths;
  }, [frames, currentFrameIndex]);

  // Determine dynamic badge label
  const badgeLabel = useMemo(() => {
    if (frames && frames[0] && frames[0].stack && frames[0].stack.length > 0) {
      const methodName = frames[0].stack[0].methodName || "";
      if (methodName.includes('Depth') || methodName.includes('depth')) return 'depth';
      if (methodName.includes('Gain') || methodName.includes('gain') || methodName.includes('Path') || methodName.includes('path') || methodName.includes('Sum') || methodName.includes('sum')) return 'gain';
      if (methodName.includes('isSame') || methodName.includes('Same') || methodName.includes('Balanced') || methodName.includes('balanced') || methodName.includes('isValid') || methodName.includes('valid')) return 'return';
    }
    return 'val';
  }, [frames]);

  // Detect if we have multiple roots (e.g. Same Tree has p and q, Subtree has root and subRoot)
  const rootPointers = useMemo(() => {
    const ptrs: { name: string; refId: string }[] = [];
    const firstFrame = frames && frames[0];
    const vars = firstFrame ? firstFrame.variables : variables;
    
    for (const [k, val] of Object.entries(vars || {})) {
      if (k === 'args') continue;
      if (typeof val === 'string') {
        const match = val.match(/(?:id=|#)(\w+)/);
        if (match) {
          const refId = match[1];
          if (nodes[refId] && (k === 'p' || k === 'q' || k === 'root' || k === 'subRoot')) {
            ptrs.push({ name: k, refId });
          }
        }
      }
    }
    return ptrs.sort((a, b) => {
      const order = { p: 1, root: 1, q: 2, subRoot: 2 } as Record<string, number>;
      return (order[a.name] || 9) - (order[b.name] || 9);
    });
  }, [frames, variables, nodes]);

  const isTwoTreeQuestion = rootPointers.length >= 2;

  const originalRootRefId = useMemo(() => {
    if (isTwoTreeQuestion && rootPointers.length >= 1) return rootPointers[0].refId;
    const firstFrame = frames && frames[0];
    if (firstFrame) {
      for (const [k, v] of Object.entries(firstFrame.variables || {})) {
        if (k === 'args') continue;
        if (typeof v === 'string') {
          const match = v.match(/(?:id=|#)(\w+)/);
          if (match) {
            const refId = match[1];
            if (nodes[refId]) return refId;
          }
        }
      }
    }
    return rootRefId;
  }, [frames, rootRefId, nodes, isTwoTreeQuestion, rootPointers]);

  // Build layout starting at center x=200, y=30, spacing=80
  const layout = useMemo(() => {
    return buildTreeLayout(originalRootRefId, nodes, 200, 30, 80);
  }, [originalRootRefId, nodes]);

  // Extract node pointers from variables
  const activeNodeId = useMemo(() => {
    for (const [key, val] of Object.entries(variables)) {
      if (key === 'args') continue;
      if (typeof val === 'string') {
        const match = val.match(/id=([a-fA-F0-9]+)/);
        if (match) {
          const refId = match[1];
          if (nodes[refId]) return refId;
        }
      }
    }
    return null;
  }, [variables, nodes]);

  // Active path tracking (from root node to activeNodeId)
  const activePath = useMemo((): string[] => {
    if (!activeNodeId) return [];
    return findTreePath(originalRootRefId, activeNodeId, nodes) || [];
  }, [originalRootRefId, activeNodeId, nodes]);

  // Group variable pointers pointing to each node
  const pointersByRef = useMemo(() => {
    const map: Record<string, string[]> = {};
    Object.entries(variables).forEach(([key, val]) => {
      if (key === 'args') return;
      if (typeof val === 'string') {
        const match = val.match(/id=([a-fA-F0-9]+)/);
        if (match) {
          const refId = match[1];
          if (!map[refId]) map[refId] = [];
          map[refId].push(key);
        }
      }
    });
    return map;
  }, [variables]);

  const originalNodes = useMemo(() => {
    if (frames && frames[0] && frames[0].objects) {
      return frames[0].objects;
    }
    return nodes;
  }, [frames, nodes]);

  const originalLayout = useMemo(() => {
    return buildTreeLayout(originalRootRefId, originalNodes, 200, 30, 80);
  }, [originalRootRefId, originalNodes]);

  // Original active path tracking
  const originalActivePath = useMemo((): string[] => {
    if (!activeNodeId) return [];
    return findTreePath(originalRootRefId, activeNodeId, originalNodes) || [];
  }, [originalRootRefId, activeNodeId, originalNodes]);

  const isMutatingProblem = useMemo(() => {
    if (isTwoTreeQuestion) return false;
    if (!frames || frames.length <= 1) return false;
    const firstObjects = frames[0].objects;
    if (!firstObjects) return false;
    return frames.some(f => {
      if (!f.objects) return false;
      for (const key of Object.keys(firstObjects)) {
        const orig = firstObjects[key];
        const curr = f.objects[key];
        if (orig && curr) {
          if (orig.left !== curr.left || orig.right !== curr.right) {
            return true;
          }
        }
      }
      return false;
    });
  }, [frames, isTwoTreeQuestion]);

  // Specific variables for dual-tree active node pointers
  const activeNodeP = useMemo(() => {
    const pVal = variables['p'] || variables['root'];
    if (typeof pVal === 'string') {
      const match = pVal.match(/id=([a-fA-F0-9]+)/);
      if (match) return match[1];
    }
    return null;
  }, [variables]);

  const activeNodeQ = useMemo(() => {
    const qVal = variables['q'] || variables['subRoot'];
    if (typeof qVal === 'string') {
      const match = qVal.match(/id=([a-fA-F0-9]+)/);
      if (match) return match[1];
    }
    return null;
  }, [variables]);

  const activePathP = useMemo((): string[] => {
    if (!activeNodeP || rootPointers.length < 1) return [];
    return findTreePath(rootPointers[0].refId, activeNodeP, nodes) || [];
  }, [rootPointers, activeNodeP, nodes]);

  const activePathQ = useMemo((): string[] => {
    if (!activeNodeQ || rootPointers.length < 2) return [];
    return findTreePath(rootPointers[1].refId, activeNodeQ, nodes) || [];
  }, [rootPointers, activeNodeQ, nodes]);

  // Dual-tree layout builders
  const layoutP = useMemo(() => {
    if (rootPointers.length >= 1) {
      return buildTreeLayout(rootPointers[0].refId, nodes, 200, 30, 80);
    }
    return [];
  }, [rootPointers, nodes]);

  const layoutQ = useMemo(() => {
    if (rootPointers.length >= 2) {
      return buildTreeLayout(rootPointers[1].refId, nodes, 200, 30, 80);
    }
    return [];
  }, [rootPointers, nodes]);

  if (layout.length === 0 && !isTwoTreeQuestion) return null;

  const originalCanvasHeight = 60 + Math.max(...originalLayout.map(n => Math.round((n.y - 30) / 56)), 0) * 56 + 10;

  const renderActiveTreeSvg = (
    treeLayout: TreeNodePos[],
    activeNode: string | null,
    pathActive: string[],
    widthClass = "w-full max-w-[480px]"
  ) => {
    const maxD = Math.max(...treeLayout.map(n => Math.round((n.y - 30) / 56)), 0);
    const canvasHeight = 60 + maxD * 56 + 10;

    return (
      <svg
        viewBox={`0 0 400 ${canvasHeight}`}
        className={`${widthClass} overflow-visible`}
      >
        <defs>
          <linearGradient id="edgeActiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>

        {/* Connection Edges */}
        {treeLayout.map(node => {
          const drawConnection = (childId: string) => {
            const child = treeLayout.find(n => n.refId === childId);
            if (!child) return null;

            const fromIdx = pathActive.indexOf(node.refId);
            const toIdx = pathActive.indexOf(child.refId);
            const isPathActive = fromIdx !== -1 && toIdx !== -1 && toIdx === fromIdx + 1;

            const resolvedDepth = nodeDepths[child.refId];
            const isReturning = resolvedDepth !== undefined;

            let strokeColor = "#cbd5e1";
            let strokeWidth = "1.5";
            if (isPathActive) {
              strokeColor = "#0ea5e9";
              strokeWidth = "2.5";
            } else if (isReturning) {
              strokeColor = "#10b981";
              strokeWidth = "2.2";
            }

            return (
              <g key={`edge-${node.refId}-${child.refId}`}>
                <motion.line
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4 }}
                  x1={node.x}
                  y1={node.y}
                  x2={child.x}
                  y2={child.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  className="transition-svg"
                />
                {isPathActive && (
                  <motion.circle
                    r="3"
                    fill="#0ea5e9"
                    animate={{
                      cx: [node.x, child.x],
                      cy: [node.y, child.y]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeInOut"
                    }}
                  />
                )}
                {isReturning && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      x: [child.x, node.x],
                      y: [child.y, node.y]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.0,
                      ease: "easeInOut"
                    }}
                  >
                    <circle r="7" fill="#10b981" />
                    <text
                      dy="2.5"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="7"
                      fontWeight="black"
                      className="font-mono"
                    >
                      {resolvedDepth}
                    </text>
                  </motion.g>
                )}
              </g>
            );
          };

          let leftId = null;
          if (node.left) {
            const match = String(node.left).match(/id=([a-fA-F0-9]+)/);
            leftId = match ? match[1] : String(node.left);
          }
          let rightId = null;
          if (node.right) {
            const match = String(node.right).match(/id=([a-fA-F0-9]+)/);
            rightId = match ? match[1] : String(node.right);
          }

          return (
            <g key={`edges-${node.refId}`}>
              {leftId && nodes[leftId] && drawConnection(leftId)}
              {rightId && nodes[rightId] && drawConnection(rightId)}
            </g>
          );
        })}

        {/* Draw Nodes */}
        {treeLayout.map(node => {
          const ptrs = pointersByRef[node.refId] || [];
          const isPointerActive = ptrs.length > 0;
          const isActive = node.refId === activeNode;
          const resolvedDepth = nodeDepths[node.refId];
          const isCompleted = resolvedDepth !== undefined;
          const isVisited = pathActive.includes(node.refId);

          let fillCol = "#ffffff";
          let strokeCol = "#cbd5e1";
          let textCol = "#334155";
          let strokeW = "1.5";

          if (isActive) {
            fillCol = "#e0f2fe";
            strokeCol = "#0284c7";
            textCol = "#0369a1";
            strokeW = "2.5";
          } else if (isCompleted) {
            fillCol = "#f0fdf4";
            strokeCol = "#16a34a";
            textCol = "#15803d";
            strokeW = "2";
          } else if (isVisited) {
            fillCol = "#f0fdfa";
            strokeCol = "#0d9488";
            textCol = "#0f766e";
            strokeW = "1.8";
          }

          return (
            <g key={`node-group-${node.refId}`}>
              {isActive && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="20"
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="1.5"
                  className="animate-pulse"
                  opacity="0.6"
                />
              )}

              <motion.circle
                whileHover={{ scale: 1.15 }}
                cx={node.x}
                cy={node.y}
                r="15"
                fill={fillCol}
                stroke={strokeCol}
                strokeWidth={strokeW}
                className="cursor-pointer transition-all duration-300 shadow-sm"
              />

              <text
                x={node.x}
                y={node.y}
                dy="4"
                textAnchor="middle"
                fill={textCol}
                fontSize="11"
                fontWeight="bold"
                className="font-mono pointer-events-none"
              >
                {node.val}
              </text>

              {isPointerActive && (
                <g transform={`translate(${node.x}, ${node.y - 20})`}>
                  <rect
                    x={-18}
                    y={-10}
                    width={36}
                    height={13}
                    rx={3}
                    fill="#4f46e5"
                    className="stroke-none"
                  />
                  <text
                    y={-1}
                    fill="#ffffff"
                    fontSize="8"
                    fontWeight="extrabold"
                    textAnchor="middle"
                    className={`pointer-tag-label pointer-tag-${ptrs[0].toLowerCase()} font-mono uppercase tracking-wider`}
                  >
                    {ptrs[0]}
                  </text>
                </g>
              )}

              {(() => {
                const resolvedDepth = nodeDepths[node.refId];
                let formulaStr = "";
                if (isActive) {
                  const leftDepth = variables['leftDepth'];
                  const rightDepth = variables['rightDepth'];
                  if (leftDepth !== undefined && rightDepth !== undefined) {
                    formulaStr = `1+max(${leftDepth},${rightDepth})`;
                  }
                }

                const badgeYOffset = isPointerActive ? -32 : -22;

                if (formulaStr) {
                  return (
                    <g transform={`translate(${node.x}, ${node.y + badgeYOffset})`}>
                      <rect
                        x={-38}
                        y={-7}
                        width={76}
                        height={12}
                        rx={3}
                        fill="#4f46e5"
                        className="shadow-sm stroke-none"
                      />
                      <text
                        y={2}
                        fill="#ffffff"
                        fontSize="7.5"
                        fontWeight="extrabold"
                        textAnchor="middle"
                        className="font-mono"
                      >
                        {formulaStr}
                      </text>
                    </g>
                  );
                }

                if (resolvedDepth !== undefined) {
                  return (
                    <g transform={`translate(${node.x}, ${node.y + badgeYOffset})`}>
                      <rect
                        x={-24}
                        y={-7}
                        width={48}
                        height={12}
                        rx={3}
                        fill="#10b981"
                        className="shadow-sm stroke-none"
                      />
                      <text
                        y={2}
                        fill="#ffffff"
                        fontSize="7.5"
                        fontWeight="extrabold"
                        textAnchor="middle"
                        className="font-mono"
                      >
                        {badgeLabel}={resolvedDepth}
                      </text>
                    </g>
                  );
                }

                return null;
              })()}
            </g>
          );
        })}
      </svg>
    );
  };

  const renderOriginalTreeSvg = () => {
    return (
      <svg
        viewBox={`0 0 400 ${originalCanvasHeight}`}
        className="w-full max-w-[480px] overflow-visible"
      >
        {/* Connection Edges */}
        {originalLayout.map(node => {
          const drawConnection = (childId: string) => {
            const child = originalLayout.find(n => n.refId === childId);
            if (!child) return null;

            const fromIdx = originalActivePath.indexOf(node.refId);
            const toIdx = originalActivePath.indexOf(child.refId);
            const isPathActive = fromIdx !== -1 && toIdx !== -1 && toIdx === fromIdx + 1;

            return (
              <g key={`orig-edge-group-${node.refId}-${child.refId}`}>
                <line
                  x1={node.x}
                  y1={node.y}
                  x2={child.x}
                  y2={child.y}
                  stroke={isPathActive ? "#4f46e5" : "#94a3b8"}
                  strokeWidth={isPathActive ? "2.5" : "1.5"}
                  strokeDasharray={isPathActive ? undefined : "3,3"}
                  className="transition-svg"
                />
                {isPathActive && (
                  <motion.circle
                    r="2.5"
                    fill="#4f46e5"
                    animate={{
                      cx: [node.x, child.x],
                      cy: [node.y, child.y]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </g>
            );
          };

          let leftId = null;
          if (node.left) {
            const match = String(node.left).match(/id=([a-fA-F0-9]+)/);
            leftId = match ? match[1] : String(node.left);
          }
          let rightId = null;
          if (node.right) {
            const match = String(node.right).match(/id=([a-fA-F0-9]+)/);
            rightId = match ? match[1] : String(node.right);
          }

          return (
            <g key={`orig-edges-${node.refId}`}>
              {leftId && originalNodes[leftId] && drawConnection(leftId)}
              {rightId && originalNodes[rightId] && drawConnection(rightId)}
            </g>
          );
        })}

        {/* Draw Nodes */}
        {originalLayout.map(node => {
          const ptrs = pointersByRef[node.refId] || [];
          const isPointerActive = ptrs.length > 0;
          const isActive = node.refId === activeNodeId;

          let fillCol = "#f8fafc";
          let strokeCol = "#64748b";
          let textCol = "#475569";
          let strokeW = "1.5";

          if (isActive) {
            fillCol = "#e0f2fe";
            strokeCol = "#0284c7";
            textCol = "#0369a1";
            strokeW = "2.5";
          }

          return (
            <g key={`orig-node-group-${node.refId}`}>
              {isActive && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="20"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="1.5"
                  className="animate-pulse"
                  opacity="0.6"
                />
              )}

              <circle
                cx={node.x}
                cy={node.y}
                r="15"
                fill={fillCol}
                stroke={strokeCol}
                strokeWidth={strokeW}
                className="shadow-sm transition-all duration-300"
              />
              <text
                x={node.x}
                y={node.y}
                dy="4"
                textAnchor="middle"
                fill={textCol}
                fontSize="11"
                fontWeight="bold"
                className="font-mono pointer-events-none"
              >
                {node.val}
              </text>

              {isActive && isPointerActive && (
                <g transform={`translate(${node.x}, ${node.y - 20})`}>
                  <rect
                    x={-18}
                    y={-10}
                    width={36}
                    height={13}
                    rx={3}
                    fill="#4f46e5"
                    className="stroke-none"
                  />
                  <text
                    y={-1}
                    fill="#ffffff"
                    fontSize="8"
                    fontWeight="extrabold"
                    textAnchor="middle"
                    className={`pointer-tag-label pointer-tag-${ptrs[0].toLowerCase()} font-mono uppercase tracking-wider`}
                  >
                    {ptrs[0]}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      {isTwoTreeQuestion ? (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Tree P */}
          <div className="w-full flex flex-col items-center bg-slate-50 rounded-xl p-4 border border-indigo-100/80 relative min-h-[220px] shadow-sm">
            <span className="absolute top-3 left-3 text-[10px] text-indigo-500 font-black uppercase font-mono tracking-wider">
              Tree {rootPointers[0].name}
            </span>
            <div className="w-full flex justify-center mt-6">
              {renderActiveTreeSvg(layoutP, activeNodeP, activePathP, "w-full")}
            </div>
          </div>

          {/* Right Column: Tree Q */}
          <div className="w-full flex flex-col items-center bg-slate-50 rounded-xl p-4 border border-indigo-100/80 relative min-h-[220px] shadow-sm">
            <span className="absolute top-3 left-3 text-[10px] text-indigo-500 font-black uppercase font-mono tracking-wider">
              Tree {rootPointers[1].name}
            </span>
            <div className="w-full flex justify-center mt-6">
              {renderActiveTreeSvg(layoutQ, activeNodeQ, activePathQ, "w-full")}
            </div>
          </div>
        </div>
      ) : isMutatingProblem ? (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Original Tree */}
          <div className="w-full flex flex-col items-center bg-slate-50/50 rounded-xl p-4 border border-slate-200/50 relative min-h-[220px]">
            <span className="absolute top-3 left-3 text-[10px] text-slate-400 font-black uppercase font-mono tracking-wider">
              Original Reference Tree
            </span>
            <div className="w-full flex justify-center mt-6">
              {renderOriginalTreeSvg()}
            </div>
          </div>

          {/* Right Column: Active Mutating Tree */}
          <div className="w-full flex flex-col items-center bg-slate-50 rounded-xl p-4 border border-indigo-100/80 relative min-h-[220px] shadow-inner">
            <span className="absolute top-3 left-3 text-[10px] text-indigo-500 font-black uppercase font-mono tracking-wider">
              Active Mutation State
            </span>
            <div className="w-full flex justify-center mt-6">
              {renderActiveTreeSvg(layout, activeNodeId, activePath, "w-full")}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full flex justify-center bg-slate-50 rounded-xl p-4 border border-slate-200/60 relative min-h-[220px] shadow-inner">
          {renderActiveTreeSvg(layout, activeNodeId, activePath)}
        </div>
      )}
    </div>
  );
};
