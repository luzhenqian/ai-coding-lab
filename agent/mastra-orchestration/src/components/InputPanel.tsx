import { useState } from 'react'
import type { DemoMeta } from '../types'

interface Props {
  demo: DemoMeta | undefined
  running: boolean
  onRun: (input: Record<string, string>) => void
}

export function InputPanel({ demo, running, onRun }: Props) {
  const [values, setValues] = useState<Record<string, string>>({})

  if (!demo) return <div className="input-panel" />

  const handleRun = () => {
    onRun(values)
  }

  return (
    <div className="input-panel">
      {demo.inputs.map((inp) => (
        <div key={inp.id}>
          <label>{inp.label}</label>
          {inp.type === 'textarea' ? (
            <textarea
              placeholder={inp.placeholder}
              value={values[inp.id] || ''}
              onChange={(e) => setValues({ ...values, [inp.id]: e.target.value })}
            />
          ) : (
            <input
              type="text"
              placeholder={inp.placeholder}
              value={values[inp.id] || ''}
              onChange={(e) => setValues({ ...values, [inp.id]: e.target.value })}
            />
          )}
        </div>
      ))}
      <button className="run-btn" disabled={running} onClick={handleRun}>
        {running ? 'Running...' : 'Run'}
      </button>
    </div>
  )
}
