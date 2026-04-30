import type {
  CoverContent,
  LayerColor,
  LayerItem,
  StatColor,
  StatItem,
  SubtitleSegment,
} from './lib/types';

interface EditorProps {
  content: CoverContent;
  onChange: (content: CoverContent) => void;
}

const LAYER_COLORS: LayerColor[] = [
  'hook',
  'classifier',
  'deny',
  'allow',
  'mode',
  'dialog',
];

const STAT_COLORS: StatColor[] = ['default', 'green', 'red', 'yellow'];

export function Editor({content, onChange}: EditorProps) {
  function update<K extends keyof CoverContent>(key: K, value: CoverContent[K]) {
    onChange({...content, [key]: value});
  }

  function updateStat(idx: number, patch: Partial<StatItem>) {
    const stats = content.stats.map((s, i) => (i === idx ? {...s, ...patch} : s));
    update('stats', stats);
  }

  function addStat() {
    update('stats', [
      ...content.stats,
      {value: 'N', label: 'LABEL', color: 'default'},
    ]);
  }

  function removeStat(idx: number) {
    update(
      'stats',
      content.stats.filter((_, i) => i !== idx),
    );
  }

  function updateLayer(idx: number, patch: Partial<LayerItem>) {
    const layers = content.layers.map((l, i) => (i === idx ? {...l, ...patch} : l));
    update('layers', layers);
  }

  function addLayer() {
    update('layers', [
      ...content.layers,
      {
        layer: `LAYER ${content.layers.length + 1}`,
        name: `LAYER ${content.layers.length + 1}`,
        desc: '',
        badge: 'TODO',
        color: 'hook',
        icon: '◆',
      },
    ]);
  }

  function removeLayer(idx: number) {
    update(
      'layers',
      content.layers.filter((_, i) => i !== idx),
    );
  }

  function updateSubtitleSeg(idx: number, patch: Partial<SubtitleSegment>) {
    const next = content.subtitleLine1.map((s, i) =>
      i === idx ? {...s, ...patch} : s,
    );
    update('subtitleLine1', next);
  }
  function addSubtitleSeg() {
    update('subtitleLine1', [...content.subtitleLine1, {text: ' '}]);
  }
  function removeSubtitleSeg(idx: number) {
    update(
      'subtitleLine1',
      content.subtitleLine1.filter((_, i) => i !== idx),
    );
  }

  function updateTag(idx: number, value: string) {
    const next = content.techTags.map((t, i) => (i === idx ? value : t));
    update('techTags', next);
  }
  function addTag() {
    update('techTags', [...content.techTags, '']);
  }
  function removeTag(idx: number) {
    update(
      'techTags',
      content.techTags.filter((_, i) => i !== idx),
    );
  }

  return (
    <div className="editor">
      <h2 className="editor-title">封面内容</h2>

      <Section title="标题区">
        <Field label="系列名">
          <input
            type="text"
            value={content.series}
            onChange={e => update('series', e.target.value)}
          />
        </Field>
        <Field label="集数">
          <input
            type="text"
            value={content.episode}
            onChange={e => update('episode', e.target.value)}
          />
        </Field>
        <Field label="标题 · 高亮词（渐变）">
          <input
            type="text"
            value={content.titleHighlight}
            onChange={e => update('titleHighlight', e.target.value)}
          />
        </Field>
        <Field label="标题 · 副句">
          <input
            type="text"
            value={content.titleRest}
            onChange={e => update('titleRest', e.target.value)}
          />
        </Field>
      </Section>

      <Section title="副标题">
        {content.subtitleLine1.map((seg, i) => (
          <div key={i} className="row-inline">
            <input
              type="text"
              value={seg.text}
              onChange={e => updateSubtitleSeg(i, {text: e.target.value})}
              placeholder="片段文字"
              style={{flex: 1}}
            />
            <label className="checkbox-inline">
              <input
                type="checkbox"
                checked={!!seg.accent}
                onChange={e => updateSubtitleSeg(i, {accent: e.target.checked})}
              />
              <span>强调</span>
            </label>
            <button className="mini-btn" onClick={() => removeSubtitleSeg(i)}>
              ×
            </button>
          </div>
        ))}
        <button className="add-btn" onClick={addSubtitleSeg}>
          + 加片段
        </button>
        <Field label="第二行（可选）">
          <input
            type="text"
            value={content.subtitleLine2 ?? ''}
            onChange={e => update('subtitleLine2', e.target.value || undefined)}
          />
        </Field>
      </Section>

      <Section title="统计 (3 项)">
        {content.stats.map((s, i) => (
          <div key={i} className="card-block">
            <div className="row-inline">
              <input
                type="text"
                value={s.value}
                onChange={e => updateStat(i, {value: e.target.value})}
                placeholder="数值"
                style={{flex: 1}}
              />
              <select
                value={s.color ?? 'default'}
                onChange={e => updateStat(i, {color: e.target.value as StatColor})}
              >
                {STAT_COLORS.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button className="mini-btn" onClick={() => removeStat(i)}>
                ×
              </button>
            </div>
            <input
              type="text"
              value={s.label}
              onChange={e => updateStat(i, {label: e.target.value})}
              placeholder="标签"
            />
          </div>
        ))}
        <button className="add-btn" onClick={addStat}>
          + 加统计
        </button>
      </Section>

      <Section title="管道层 (建议 5–6 个)">
        {content.layers.map((l, i) => (
          <div key={i} className="card-block">
            <div className="row-inline">
              <input
                type="text"
                value={l.icon}
                onChange={e => updateLayer(i, {icon: e.target.value})}
                placeholder="图标"
                style={{width: '50px'}}
              />
              <select
                value={l.color}
                onChange={e =>
                  updateLayer(i, {color: e.target.value as LayerColor})
                }
              >
                {LAYER_COLORS.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button className="mini-btn" onClick={() => removeLayer(i)}>
                ×
              </button>
            </div>
            <input
              type="text"
              value={l.name}
              onChange={e => updateLayer(i, {name: e.target.value, layer: e.target.value})}
              placeholder="名称（也用作 layer 标签）"
            />
            <input
              type="text"
              value={l.desc}
              onChange={e => updateLayer(i, {desc: e.target.value})}
              placeholder="描述"
            />
            <input
              type="text"
              value={l.badge}
              onChange={e => updateLayer(i, {badge: e.target.value})}
              placeholder="徽章"
            />
          </div>
        ))}
        <button className="add-btn" onClick={addLayer}>
          + 加层
        </button>
      </Section>

      <Section title="底部技术标签">
        {content.techTags.map((tag, i) => (
          <div key={i} className="row-inline">
            <input
              type="text"
              value={tag}
              onChange={e => updateTag(i, e.target.value)}
              style={{flex: 1}}
            />
            <button className="mini-btn" onClick={() => removeTag(i)}>
              ×
            </button>
          </div>
        ))}
        <button className="add-btn" onClick={addTag}>
          + 加标签
        </button>
      </Section>

      <Section title="幽灵代码（可选）">
        <Field label="顶部">
          <textarea
            rows={4}
            value={content.ghostCodeTop ?? ''}
            onChange={e => update('ghostCodeTop', e.target.value || undefined)}
          />
        </Field>
        <Field label="底部">
          <textarea
            rows={3}
            value={content.ghostCodeBottom ?? ''}
            onChange={e => update('ghostCodeBottom', e.target.value || undefined)}
          />
        </Field>
      </Section>
    </div>
  );
}

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <div className="section">
      <div className="section-title">{title}</div>
      <div className="section-body">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
