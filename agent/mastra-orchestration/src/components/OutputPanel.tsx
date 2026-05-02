interface LogEntry {
  type: string
  text: string
  className: string
}

interface Props {
  logs: LogEntry[]
  result: unknown
}

export function OutputPanel({ logs, result }: Props) {
  return (
    <div className="output-panel">
      <pre>
        {logs.map((log, i) => (
          <div key={i} className={log.className}>{log.text}</div>
        ))}
        {result && (
          <div className="log-result">
            {'\n=== Result ===\n'}
            {JSON.stringify(result, null, 2)}
          </div>
        )}
      </pre>
    </div>
  )
}
