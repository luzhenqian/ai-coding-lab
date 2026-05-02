import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react'
import type { EdgeStatus } from '../types'

export interface AnimatedEdgeData {
  status: EdgeStatus
  [key: string]: unknown
}

export function AnimatedEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data } = props
  const edgeData = data as AnimatedEdgeData | undefined
  const status = edgeData?.status || 'idle'

  const [edgePath] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition })

  const colors: Record<EdgeStatus, string> = {
    idle: '#2a2b36',
    active: '#fbbf24',
    complete: '#4ade80',
  }

  return (
    <BaseEdge
      path={edgePath}
      style={{
        stroke: colors[status],
        strokeWidth: status === 'idle' ? 1 : 2,
        strokeDasharray: status === 'active' ? '6 4' : 'none',
        animation: status === 'active' ? 'dash 0.6s linear infinite' : 'none',
        transition: 'stroke 0.3s ease',
      }}
    />
  )
}
