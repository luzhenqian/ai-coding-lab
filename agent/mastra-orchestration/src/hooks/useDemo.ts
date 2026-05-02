import { useState, useCallback, useRef } from 'react'
import type { SSEEvent, NodeStatus, EdgeStatus } from '../types'

interface LogEntry {
  type: string
  text: string
  className: string
}

export function useDemo() {
  const [nodeStates, setNodeStates] = useState<Record<string, NodeStatus>>({})
  const [edgeStates, setEdgeStates] = useState<Record<string, EdgeStatus>>({})
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [result, setResult] = useState<unknown>(null)
  const [running, setRunning] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const addLog = (type: string, text: string, className: string) => {
    setLogs((prev) => [...prev, { type, text, className }])
  }

  const handleEvent = useCallback((event: SSEEvent) => {
    switch (event.type) {
      case 'node:active':
        setNodeStates((prev) => ({ ...prev, [event.nodeId]: 'active' }))
        addLog(event.type, `⚡ ${event.nodeId} started`, 'log-active')
        break
      case 'node:complete':
        setNodeStates((prev) => ({ ...prev, [event.nodeId]: 'complete' }))
        addLog(event.type, `✅ ${event.nodeId} complete`, 'log-complete')
        break
      case 'node:error':
        setNodeStates((prev) => ({ ...prev, [event.nodeId]: 'error' }))
        addLog(event.type, `❌ ${event.nodeId}: ${event.error}`, 'log-error')
        break
      case 'edge:active':
        setEdgeStates((prev) => ({ ...prev, [event.edgeId]: 'active' }))
        break
      case 'edge:complete':
        setEdgeStates((prev) => ({ ...prev, [event.edgeId]: 'complete' }))
        break
      case 'stream:chunk':
        addLog(event.type, event.text, '')
        break
      case 'run:complete':
        setResult(event.result)
        break
    }
  }, [])

  const runDemo = useCallback(async (demoId: string, input: Record<string, string>) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setNodeStates({})
    setEdgeStates({})
    setLogs([])
    setResult(null)
    setRunning(true)

    try {
      const res = await fetch(`/api/demos/${demoId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: controller.signal,
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: SSEEvent = JSON.parse(line.slice(6))
              handleEvent(event)
            } catch {
              // skip malformed events
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        addLog('error', `Connection error: ${err}`, 'log-error')
      }
    } finally {
      setRunning(false)
    }
  }, [handleEvent])

  return { nodeStates, edgeStates, logs, result, running, runDemo }
}
