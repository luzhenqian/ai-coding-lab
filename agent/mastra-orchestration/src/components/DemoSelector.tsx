import type { DemoMeta } from '../types'

interface Props {
  demos: DemoMeta[]
  selectedId: string
  onSelect: (id: string) => void
}

export function DemoSelector({ demos, selectedId, onSelect }: Props) {
  return (
    <div className="demo-selector">
      <div className="sidebar-section-title">编排模式</div>
      {demos.map((demo) => (
        <div
          key={demo.id}
          className={`demo-item ${demo.id === selectedId ? 'active' : ''}`}
          onClick={() => onSelect(demo.id)}
        >
          <div className="pattern">{demo.pattern}</div>
          <div className="name">{demo.nameZh}</div>
          <div className="description">{demo.description}</div>
        </div>
      ))}
    </div>
  )
}
