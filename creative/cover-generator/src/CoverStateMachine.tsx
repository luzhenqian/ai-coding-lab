import {NODE_PALETTE} from './lib/design-tokens';
import type {NodeColor, StateEdge, StateNode} from './lib/types';

interface CoverStateMachineProps {
  nodes: StateNode[];
  edges: StateEdge[];
  streamingLines?: boolean;
  yieldBadge?: string;
}

/**
 * State-machine variant for the right side of the cover.
 *
 * Designed for episodes where a 5/6-layer pipeline doesn't fit the topic
 * (e.g. recovery flows, generators, retry trees). Author writes node positions
 * and edge SVG paths explicitly — automatic layout would feel generic.
 *
 * Coordinate space: 460×500, top-left origin. Nodes are absolutely positioned
 * within this area; edges are SVG <path> elements drawn over the same area.
 *
 * Each edge color is mapped to one of 5 semantic NodeColor slots so the SVG
 * arrow markers can be defined once and referenced by `marker-end="url(#...)"`.
 */
export function CoverStateMachine({
  nodes,
  edges,
  streamingLines,
  yieldBadge,
}: CoverStateMachineProps) {
  return (
    <>
      {streamingLines && <StreamingLines />}
      {yieldBadge && <div className="yield-badge">{yieldBadge}</div>}

      <div className="state-area">
        <svg
          className="state-edges"
          viewBox="0 0 460 500"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {(['primary', 'success', 'warning', 'danger', 'final'] as NodeColor[]).map(
              c => (
                <marker
                  key={c}
                  id={`arrow-${c}`}
                  markerWidth="6"
                  markerHeight="6"
                  refX="5"
                  refY="3"
                  orient="auto"
                >
                  <path
                    d="M 0 0 L 6 3 L 0 6 Z"
                    fill={arrowFill(c)}
                  />
                </marker>
              ),
            )}
          </defs>

          {edges.map((edge, i) => (
            <path
              key={i}
              d={edge.path}
              stroke={edgeStroke(edge.color)}
              strokeWidth={1.5}
              fill="none"
              strokeDasharray={edge.style === 'dashed' ? '5 3' : undefined}
              markerEnd={`url(#arrow-${edge.color})`}
            />
          ))}
        </svg>

        {nodes.map(node => {
          const palette = NODE_PALETTE[node.color];
          return (
            <div
              key={node.id}
              className={`state-node emp-${node.emphasis ?? 'normal'}`}
              style={{
                left: `${node.position[0]}px`,
                top: `${node.position[1]}px`,
                color: palette.text,
                borderColor: palette.border,
                background: palette.bg,
                ...(node.fontSize ? {fontSize: `${node.fontSize}px`} : null),
              }}
            >
              {node.label}
            </div>
          );
        })}
      </div>
    </>
  );
}

function StreamingLines() {
  // 7 horizontal gradient lines with varying widths/opacities — purely decorative.
  const lines = [
    {top: 120, width: 350, opacity: 1},
    {top: 195, width: 280, opacity: 0.6},
    {top: 270, width: 420, opacity: 0.8},
    {top: 345, width: 200, opacity: 0.4},
    {top: 420, width: 380, opacity: 0.7},
    {top: 500, width: 300, opacity: 0.5},
    {top: 575, width: 180, opacity: 0.3},
  ];
  return (
    <div className="stream-lines">
      {lines.map((l, i) => (
        <div
          key={i}
          className="stream-line"
          style={{top: `${l.top}px`, width: `${l.width}px`, opacity: l.opacity}}
        />
      ))}
    </div>
  );
}

function edgeStroke(c: NodeColor): string {
  switch (c) {
    case 'primary': return 'rgba(99,102,241,0.3)';
    case 'success': return 'rgba(52,211,153,0.3)';
    case 'warning': return 'rgba(251,191,36,0.25)';
    case 'danger':  return 'rgba(251,146,60,0.25)';
    case 'final':   return 'rgba(167,139,250,0.3)';
  }
}

function arrowFill(c: NodeColor): string {
  switch (c) {
    case 'primary': return 'rgba(99,102,241,0.5)';
    case 'success': return 'rgba(52,211,153,0.5)';
    case 'warning': return 'rgba(251,191,36,0.5)';
    case 'danger':  return 'rgba(251,146,60,0.5)';
    case 'final':   return 'rgba(167,139,250,0.5)';
  }
}
