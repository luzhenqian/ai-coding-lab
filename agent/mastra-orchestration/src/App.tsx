import { useState, useEffect, useCallback, useRef } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { DemoSelector } from './components/DemoSelector'
import { FlowCanvas } from './components/FlowCanvas'
import { InputPanel } from './components/InputPanel'
import { OutputPanel } from './components/OutputPanel'
import { useDemo } from './hooks/useDemo'
import type { DemoMeta } from './types'

export default function App() {
  const [demoList, setDemoList] = useState<DemoMeta[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [panelHeight, setPanelHeight] = useState(280)
  const { nodeStates, edgeStates, logs, result, running, runDemo, reset, stop } = useDemo()
  const dragging = useRef(false)
  const startY = useRef(0)
  const startH = useRef(0)

  useEffect(() => {
    fetch('/api/demos')
      .then((r) => r.json())
      .then((list: DemoMeta[]) => {
        setDemoList(list)
        if (list.length > 0) setSelectedId(list[0].id)
      })
  }, [])

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    startY.current = e.clientY
    startH.current = panelHeight
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      const delta = startY.current - ev.clientY
      const newH = Math.max(120, Math.min(window.innerHeight - 200, startH.current + delta))
      setPanelHeight(newH)
    }
    const onUp = () => {
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [panelHeight])

  const selectedDemo = demoList.find((d) => d.id === selectedId)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Agent 编排模式实战</h1>
        <span className="header-badge">Mastra</span>
      </header>
      <div className="app-body">
        <DemoSelector demos={demoList} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); reset() }} />
        <div className="app-main">
          <ReactFlowProvider>
            <div className="canvas-area">
              <FlowCanvas demoId={selectedId} nodeStates={nodeStates} edgeStates={edgeStates} />
            </div>
          </ReactFlowProvider>
          <div className="resize-handle" onMouseDown={onDragStart}>
            <div className="resize-grip" />
          </div>
          <div className="panels" style={{ height: panelHeight }}>
            <InputPanel demo={selectedDemo} running={running} onRun={(input) => runDemo(selectedId, input)} onStop={stop} />
            <OutputPanel logs={logs} result={result} />
          </div>
        </div>
      </div>
    </div>
  )
}
