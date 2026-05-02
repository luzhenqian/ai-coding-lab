import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { NodeStatus } from '../types'

export interface AgentNodeData {
  label: string
  sublabel?: string
  status: NodeStatus
  [key: string]: unknown
}

const statusColors: Record<NodeStatus, string> = {
  idle: '#2a2b36',
  active: '#fbbf24',
  complete: '#4ade80',
  error: '#f87171',
}

export function AgentNode({ data }: NodeProps) {
  const nodeData = data as AgentNodeData
  const status = nodeData.status || 'idle'
  const borderColor = statusColors[status]
  const isActive = status === 'active'

  return (
    <div
      style={{
        background: '#12131a',
        border: `2px solid ${borderColor}`,
        borderRadius: 8,
        padding: '10px 16px',
        minWidth: 140,
        textAlign: 'center',
        boxShadow: isActive ? `0 0 16px ${borderColor}40` : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: borderColor }} />
      <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0' }}>{nodeData.label}</div>
      {nodeData.sublabel && (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{nodeData.sublabel}</div>
      )}
      {isActive && (
        <div style={{ fontSize: 10, color: '#fbbf24', marginTop: 4 }}>working...</div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: borderColor }} />
    </div>
  )
}
