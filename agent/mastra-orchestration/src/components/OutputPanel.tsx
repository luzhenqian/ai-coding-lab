import { useEffect, useRef } from 'react'
import type { LogEntry } from '../hooks/useDemo'

interface Props {
  logs: LogEntry[]
  result: unknown
}

function IconActive() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="6" cy="6" r="5" stroke="#fbbf24" strokeWidth="1.5" />
      <circle cx="6" cy="6" r="2" fill="#fbbf24">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

function IconComplete() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="6" cy="6" r="5" fill="#4ade80" fillOpacity="0.15" stroke="#4ade80" strokeWidth="1.5" />
      <path d="M3.5 6L5.5 8L8.5 4" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconError() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="6" cy="6" r="5" fill="#f87171" fillOpacity="0.15" stroke="#f87171" strokeWidth="1.5" />
      <path d="M4 4L8 8M8 4L4 8" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function tryFormatJson(text: string): { isJson: boolean; formatted: string; parsed?: Record<string, unknown> } {
  const trimmed = text.trim()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return { isJson: false, formatted: text }
  }
  try {
    const parsed = JSON.parse(trimmed)
    return { isJson: true, formatted: JSON.stringify(parsed, null, 2), parsed }
  } catch {
    return { isJson: false, formatted: text }
  }
}

function StreamContent({ text }: { text: string }) {
  const { isJson, formatted } = tryFormatJson(text)
  if (isJson) {
    return <code className="log-json">{formatted}</code>
  }
  return <>{text}</>
}

function LogItem({ log }: { log: LogEntry }) {
  if (log.type === 'stream:chunk') {
    return (
      <div className="log-entry log-entry-stream">
        <StreamContent text={log.text} />
      </div>
    )
  }

  const icon =
    log.className === 'log-active' ? <IconActive /> :
    log.className === 'log-complete' ? <IconComplete /> :
    log.className === 'log-error' ? <IconError /> : null

  return (
    <div className={`log-entry ${log.className}`}>
      {icon}
      <span>{log.text}</span>
    </div>
  )
}

export function OutputPanel({ logs, result }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs, result])

  return (
    <div className="output-panel" ref={containerRef}>
      <div className="panel-title">输出</div>
      <div className="log-list">
        {logs.map((log, i) => (
          <LogItem key={i} log={log} />
        ))}
        {result != null && (
          <div className="log-entry log-entry-result">
            <div className="result-header">运行结果</div>
            <code className="log-json">{JSON.stringify(result, null, 2)}</code>
          </div>
        )}
      </div>
    </div>
  )
}
