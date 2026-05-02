import { useEffect, useRef } from 'react'
import type { LogEntry } from '../hooks/useDemo'

interface Props {
  logs: LogEntry[]
  result: unknown
}

export function OutputPanel({ logs, result }: Props) {
  const preRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    if (preRef.current) {
      preRef.current.scrollTop = preRef.current.scrollHeight
    }
  }, [logs, result])

  return (
    <div className="output-panel">
      <div className="panel-title">输出</div>
      <pre ref={preRef}>
        {logs.map((log, i) => (
          <div key={i} className={log.className}>{log.text}</div>
        ))}
        {result != null && (
          <div className="log-result">
            {'\n=== 运行结果 ===\n'}
            {JSON.stringify(result, null, 2) as string}
          </div>
        )}
      </pre>
    </div>
  )
}
