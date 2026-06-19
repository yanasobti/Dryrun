import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface GraphVisualizerProps {
  name: string;
  rootRefId: string;
  nodes: Record<string, any>; // completeHeap containing all nodes
  variables: Record<string, any>;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ name, rootRefId, nodes, variables }) => {
  // 1. Gather all reachable nodes in the graph
  const graphNodes = useMemo(() => {
    const visited = new Set<string>();
    const result: Record<string, { refId: string; val: number; neighbors: string[] }> = {};
    const queue = [rootRefId];

    // Helper to extract neighbor IDs from JDB ArrayList string
    const matchAllIds = (str: string): string[] => {
      const ids: string[] = [];
      const regex = /id=([a-fA-F0-9]+)/g;
      let match;
      while ((match = regex.exec(str)) !== null) {
        ids.push(match[1]);
      }
      return ids;
    };

    while (queue.length > 0) {
      const id = queue.shift()!;
      if (!id || visited.has(id)) continue;
      visited.add(id);

      const rawNode = nodes[id];
      if (rawNode) {
        const val = rawNode.val !== undefined ? parseInt(rawNode.val) : 0;
        const neighborsStr = String(rawNode.neighbors || "");
        const neighbors = matchAllIds(neighborsStr);
        
        result[id] = { refId: id, val, neighbors };
        
        neighbors.forEach(nId => {
          if (!visited.has(nId)) {
            queue.push(nId);
          }
        });
      }
    }
    return result;
  }, [rootRefId, nodes]);

  // Determine active node (if any variable points to a Node id)
  const activeNodeId = useMemo(() => {
    let activeId = "";
    Object.entries(variables).forEach(([k, v]) => {
      if (k === 'args') return;
      if (typeof v === 'string') {
        const match = v.match(/id=([a-fA-F0-9]+)/);
        if (match && graphNodes[match[1]]) {
          activeId = match[1];
        }
      }
    });
    return activeId;
  }, [variables, graphNodes]);

  const nodeIds = Object.keys(graphNodes);
  const N = nodeIds.length;
  const radius = 60;
  const cx = 100;
  const cy = 100;

  // 2. Position nodes in a circle
  const nodePositions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    nodeIds.forEach((id, index) => {
      const angle = (index / N) * 2 * Math.PI - Math.PI / 2;
      pos[id] = {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
      };
    });
    return pos;
  }, [nodeIds, N]);

  // 3. Collect unique edges to render
  const edges = useMemo(() => {
    const list: { from: string; to: string; key: string }[] = [];
    const seen = new Set<string>();

    nodeIds.forEach(fromId => {
      const neighbors = graphNodes[fromId].neighbors;
      neighbors.forEach(toId => {
        if (graphNodes[toId]) {
          const edgeKey = [fromId, toId].sort().join('-');
          if (!seen.has(edgeKey)) {
            seen.add(edgeKey);
            list.push({ from: fromId, to: toId, key: edgeKey });
          }
        }
      });
    });
    return list;
  }, [nodeIds, graphNodes]);

  if (N === 0) return null;

  return (
    <div className="w-full flex flex-col items-center p-4 bg-slate-50 border border-slate-200/60 rounded-xl shadow-inner">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
        Graph: <span className="text-slate-800 font-bold">{name}</span>
      </div>

      <div className="w-full max-w-[280px]">
        <svg viewBox="0 0 200 200" className="w-full overflow-visible">
          {/* Draw Connection Edges */}
          {edges.map(edge => {
            const p1 = nodePositions[edge.from];
            const p2 = nodePositions[edge.to];
            if (!p1 || !p2) return null;

            const isEdgeActive = edge.from === activeNodeId || edge.to === activeNodeId;
            return (
              <line
                key={edge.key}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={isEdgeActive ? "#3b82f6" : "#cbd5e1"}
                strokeWidth={isEdgeActive ? 2.5 : 1.5}
                className="transition-all duration-300"
              />
            );
          })}

          {/* Draw Nodes */}
          {nodeIds.map(id => {
            const pos = nodePositions[id];
            if (!pos) return null;

            const node = graphNodes[id];
            const isActive = id === activeNodeId;

            return (
              <g key={`node-${id}`} transform={`translate(${pos.x}, ${pos.y})`}>
                {/* Active node outer pulse circle */}
                {isActive && (
                  <circle
                    r={18}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    className="animate-pulse"
                  />
                )}
                
                <motion.circle
                  r={12}
                  fill={isActive ? "#dbeafe" : "#ffffff"}
                  stroke={isActive ? "#2563eb" : "#94a3b8"}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  whileHover={{ scale: 1.15 }}
                  className="cursor-pointer"
                />

                <text
                  dy="3.5"
                  textAnchor="middle"
                  fill={isActive ? "#1d4ed8" : "#334155"}
                  fontSize={8}
                  fontWeight="bold"
                  className="font-mono pointer-events-none"
                >
                  {node.val}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
