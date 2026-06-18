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
            depths[refId] = parseInt(f.returnValue);
          }
        }
      }
    }
    return depths;
  }, [frames, currentFrameIndex]);

  const originalRootRefId = useMemo(() => {
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
  }, [frames, rootRefId, nodes]);

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

    const findPath = (currId: string, targetId: string, visited = new Set<string>()): string[] | null => {
      if (!currId || visited.has(currId)) return null;
      visited.add(currId);
      
      if (currId === targetId) return [currId];
      
      const node = nodes[currId];
      if (node) {
        // Resolve left child ID
        let leftId = null;
        if (node.left) {
          const match = String(node.left).match(/id=([a-fA-F0-9]+)/);
          leftId = match ? match[1] : String(node.left);
        }
        
        // Resolve right child ID
        let rightId = null;
        if (node.right) {
          const match = String(node.right).match(/id=([a-fA-F0-9]+)/);
          rightId = match ? match[1] : String(node.right);
        }

        if (leftId) {
          const leftPath = findPath(leftId, targetId, visited);
          if (leftPath) return [currId, ...leftPath];
        }
        if (rightId) {
          const rightPath = findPath(rightId, targetId, visited);
          if (rightPath) return [currId, ...rightPath];
        }
      }
      return null;
    };

    return findPath(originalRootRefId, activeNodeId) || [];
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

  if (layout.length === 0) return null;

  // Maximum depth to size SVG height dynamically
  const maxDepth = Math.max(...layout.map(n => Math.round((n.y - 30) / 56)), 0);
  const canvasHeight = 60 + maxDepth * 56 + 10;

  return (
    <div className="w-full flex flex-col items-center">



      {/* SVG Canvas Container */}
      <div className="w-full flex justify-center bg-slate-50 rounded-xl p-4 border border-slate-200/60 relative min-h-[220px] shadow-inner">
        <svg
          viewBox={`0 0 400 ${canvasHeight}`}
          className="w-full max-w-[480px] overflow-visible"
        >
          {/* Defs for gradients & indicators */}
          <defs>
            <linearGradient id="edgeActiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>

          {/* Connection Edges */}
          {layout.map(node => {
            const drawConnection = (childId: string) => {
              const child = layout.find(n => n.refId === childId);
              if (!child) return null;

              const fromIdx = activePath.indexOf(node.refId);
              const toIdx = activePath.indexOf(child.refId);
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
                  {/* Glowing execution trace particle going DOWN (blue) */}
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
                  {/* Floating return bubble going UP (green) */}
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

            // Resolve left & right child refIds
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
          {layout.map(node => {
            const ptrs = pointersByRef[node.refId] || [];
            const isPointerActive = ptrs.length > 0;
            const isActive = node.refId === activeNodeId;
            const resolvedDepth = nodeDepths[node.refId];
            const isCompleted = resolvedDepth !== undefined;
            const isVisited = activePath.includes(node.refId);

            let fillCol = "#ffffff";
            let strokeCol = "#cbd5e1";
            let textCol = "#334155";
            let strokeW = "1.5";

            if (isActive) {
              fillCol = "#e0f2fe"; // sky-100
              strokeCol = "#0284c7"; // sky-600
              textCol = "#0369a1"; // sky-700
              strokeW = "2.5";
            } else if (isCompleted) {
              fillCol = "#f0fdf4"; // green-50
              strokeCol = "#16a34a"; // green-600
              textCol = "#15803d"; // green-700
              strokeW = "2";
            } else if (isVisited) {
              fillCol = "#f0fdfa"; // teal-50
              strokeCol = "#0d9488"; // teal-600
              textCol = "#0f766e"; // teal-700
              strokeW = "1.8";
            }

            return (
              <g key={`node-group-${node.refId}`}>
                {/* Node Outer Glow Ring */}
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

                {/* Main Node Circle */}
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

                {/* Node Value */}
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

                {/* Pointer tags positioned neatly above the nodes */}
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

                {/* Floating depth or formula badge */}
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
                          x={-22}
                          y={-7}
                          width={44}
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
                          depth={resolvedDepth}
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
      </div>
    </div>
  );
};
