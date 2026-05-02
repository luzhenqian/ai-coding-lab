export type SSEEvent =
  | { type: 'node:active'; nodeId: string }
  | { type: 'node:complete'; nodeId: string; output?: unknown }
  | { type: 'node:error'; nodeId: string; error: string }
  | { type: 'edge:active'; edgeId: string }
  | { type: 'edge:complete'; edgeId: string }
  | { type: 'stream:chunk'; nodeId: string; text: string }
  | { type: 'run:complete'; result: unknown }

export interface DemoInput {
  id: string
  label: string
  type: 'text' | 'textarea'
  placeholder: string
}

export interface DemoMeta {
  id: string
  name: string
  nameZh: string
  pattern: string
  description: string
  inputs: DemoInput[]
}

export type NodeStatus = 'idle' | 'active' | 'complete' | 'error'
export type EdgeStatus = 'idle' | 'active' | 'complete'
