import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { NodeStatus } from '../types'

export interface AgentNodeData {
  label: string
  sublabel?: string
  status: NodeStatus
  [key: string]: unknown
}

const statusConfig: Record<NodeStatus, { color: string; bg: string; glow: string }> = {
  idle: { color: '#52525b', bg: 'rgba(255,255,255,0.02)', glow: 'none' },
  active: { color: '#fbbf24', bg: 'rgba(251,191,36,0.05)', glow: '0 0 20px rgba(251,191,36,0.15), inset 0 0 20px rgba(251,191,36,0.03)' },
  complete: { color: '#4ade80', bg: 'rgba(74,222,128,0.04)', glow: 'none' },
  error: { color: '#f87171', bg: 'rgba(248,113,113,0.05)', glow: '0 0 20px rgba(248,113,113,0.15)' },
}

export function AgentNode({ data }: NodeProps) {
  const nodeData = data as AgentNodeData
  const status = nodeData.status || 'idle'
  const config = statusConfig[status]
  const isActive = status === 'active'

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${config.bg}, rgba(15,15,18,0.95))`,
        border: `1px solid ${status === 'idle' ? 'rgba(255,255,255,0.06)' : config.color + '60'}`,
        borderRadius: 10,
        padding: '12px 20px',
        minWidth: 150,
        textAlign: 'center',
        boxShadow: config.glow,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: isActive ? 'pulse-glow 2s ease-in-out infinite' : 'none',
        position: 'relative',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: config.color, width: 6, height: 6, border: 'none' }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 2 }}>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: config.color,
            boxShadow: status !== 'idle' ? `0 0 8px ${config.color}` : 'none',
            transition: 'all 0.3s ease',
          }}
        />
        <div style={{ fontSize: 13, fontWeight: 600, color: status === 'idle' ? '#a1a1aa' : '#fafafa', letterSpacing: '-0.01em' }}>
          {nodeData.label}
        </div>
      </div>

      {nodeData.sublabel && (
        <div style={{ fontSize: 11, color: '#52525b', marginTop: 2, fontWeight: 400 }}>
          {nodeData.sublabel}
        </div>
      )}

      {isActive && (
        <div style={{
          fontSize: 10,
          color: '#fbbf24',
          marginTop: 6,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.02em',
          opacity: 0.8,
        }}>
          运行中...
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: config.color, width: 6, height: 6, border: 'none' }}
      />
    </div>
  )
}
