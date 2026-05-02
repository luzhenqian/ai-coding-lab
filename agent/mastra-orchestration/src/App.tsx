import { useState, useEffect } from 'react'
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
  const { nodeStates, edgeStates, logs, result, running, runDemo } = useDemo()

  useEffect(() => {
    fetch('/api/demos')
      .then((r) => r.json())
      .then((list: DemoMeta[]) => {
        setDemoList(list)
        if (list.length > 0) setSelectedId(list[0].id)
      })
  }, [])

  const selectedDemo = demoList.find((d) => d.id === selectedId)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Agent 编排模式实战</h1>
      </header>
      <div className="app-body">
        <DemoSelector demos={demoList} selectedId={selectedId} onSelect={setSelectedId} />
        <div className="app-main">
          <ReactFlowProvider>
            <div className="canvas-area">
              <FlowCanvas demoId={selectedId} nodeStates={nodeStates} edgeStates={edgeStates} />
            </div>
          </ReactFlowProvider>
          <div className="panels">
            <InputPanel demo={selectedDemo} running={running} onRun={(input) => runDemo(selectedId, input)} />
            <OutputPanel logs={logs} result={result} />
          </div>
        </div>
      </div>
    </div>
  )
}
