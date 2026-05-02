import { useMemo } from 'react'
import { ReactFlow, Background, type Node, type Edge } from '@xyflow/react'
import { AgentNode } from './AgentNode'
import { AnimatedEdge } from './AnimatedEdge'
import { getLayout } from '../layouts/index'
import type { NodeStatus, EdgeStatus } from '../types'

const nodeTypes = { agent: AgentNode }
const edgeTypes = { animated: AnimatedEdge }

interface Props {
  demoId: string
  nodeStates: Record<string, NodeStatus>
  edgeStates: Record<string, EdgeStatus>
}

export function FlowCanvas({ demoId, nodeStates, edgeStates }: Props) {
  const { nodes, edges } = useMemo(() => {
    const layout = getLayout(demoId)
    if (!layout) return { nodes: [], edges: [] }

    const n: Node[] = layout.nodes.map((node) => ({
      ...node,
      type: 'agent',
      data: { ...node.data, status: nodeStates[node.id] || 'idle' },
    }))

    const e: Edge[] = layout.edges.map((edge) => ({
      ...edge,
      type: 'animated',
      data: { ...edge.data, status: edgeStates[edge.id] || 'idle' },
    }))

    return { nodes: n, edges: e }
  }, [demoId, nodeStates, edgeStates])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#1a1b24" gap={24} />
    </ReactFlow>
  )
}
