import { useState } from 'react'
import type { DemoMeta } from '../types'

interface Props {
  demo: DemoMeta | undefined
  running: boolean
  onRun: (input: Record<string, string>) => void
  onStop: () => void
}

export function InputPanel({ demo, running, onRun, onStop }: Props) {
  const [values, setValues] = useState<Record<string, string>>({})

  if (!demo) return <div className="input-panel" />

  return (
    <div className="input-panel">
      <div className="panel-title">输入</div>
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
      {running ? (
        <button className="stop-btn" onClick={onStop}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="2" y="2" width="8" height="8" rx="1.5" fill="currentColor" />
          </svg>
          停止
        </button>
      ) : (
        <button className="run-btn" onClick={() => onRun(values)}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 1.5L10.5 6L3 10.5V1.5Z" fill="currentColor" />
          </svg>
          运行
        </button>
      )}
    </div>
  )
}
