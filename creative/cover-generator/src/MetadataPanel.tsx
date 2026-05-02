import {useState} from 'react';
import {PLATFORM_LIMITS, type VideoMetadata} from './lib/types';

interface MetadataPanelProps {
  metadata: VideoMetadata;
  onChange: (metadata: VideoMetadata) => void;
}

interface ToastFn {
  (msg: string): void;
}

export function MetadataPanel({metadata, onChange}: MetadataPanelProps) {
  const [toast, setToast] = useState<string | null>(null);

  const showToast: ToastFn = msg => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  function update<K extends keyof VideoMetadata>(key: K, value: VideoMetadata[K]) {
    onChange({...metadata, [key]: value});
  }

  return (
    <div className="metadata-panel">
      {/* Shared base info */}
      <div className="meta-base">
        <div className="meta-base-row">
          <Field label="主题">
            <input
              type="text"
              value={metadata.topic}
              onChange={e => update('topic', e.target.value)}
            />
          </Field>
          <Field label="时长">
            <input
              type="text"
              value={metadata.duration}
              onChange={e => update('duration', e.target.value)}
              placeholder="7:09"
              style={{width: '120px'}}
            />
          </Field>
          <Field label="视频路径">
            <input
              type="text"
              value={metadata.videoPath ?? ''}
              onChange={e => update('videoPath', e.target.value || undefined)}
              placeholder="motion-canvas-videos/.../output/project.mp4"
            />
          </Field>
        </div>
        <Field label="一句话简介（共用）">
          <textarea
            rows={2}
            value={metadata.summary}
            onChange={e => update('summary', e.target.value)}
          />
        </Field>
      </div>

      {/* Platform cards 2x2 */}
      <div className="platforms-grid">
        <BilibiliCard
          data={metadata.bilibili}
          onChange={v => update('bilibili', v)}
          showToast={showToast}
        />
        <YouTubeCard
          data={metadata.youtube}
          onChange={v => update('youtube', v)}
          showToast={showToast}
        />
        <XiaohongshuCard
          data={metadata.xiaohongshu}
          onChange={v => update('xiaohongshu', v)}
          showToast={showToast}
        />
        <WeChatChannelsCard
          data={metadata.wechatChannels}
          onChange={v => update('wechatChannels', v)}
          showToast={showToast}
        />
      </div>

      {toast && <div className="copy-toast">{toast}</div>}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Platform card subcomponents
// ----------------------------------------------------------------------------

function BilibiliCard({
  data,
  onChange,
  showToast,
}: {
  data: VideoMetadata['bilibili'];
  onChange: (v: VideoMetadata['bilibili']) => void;
  showToast: ToastFn;
}) {
  const limits = PLATFORM_LIMITS.bilibili;
  return (
    <Card platform="bilibili" name="哔哩哔哩 · Bilibili" icon="B" accent="#fb7299">
      <FieldWithCopy
        label="标题"
        value={data.title}
        onChange={v => onChange({...data, title: v})}
        max={limits.title}
        copyText={data.title}
        showToast={showToast}
      />
      <FieldWithCopy
        label="简介"
        value={data.description}
        onChange={v => onChange({...data, description: v})}
        max={limits.description}
        textarea
        copyText={data.description}
        showToast={showToast}
      />
      <TagsField
        label="标签"
        max={limits.tags}
        tags={data.tags}
        onChange={tags => onChange({...data, tags})}
        showToast={showToast}
      />
      <Field label="分区">
        <input
          type="text"
          value={data.category ?? ''}
          onChange={e => onChange({...data, category: e.target.value || undefined})}
        />
      </Field>
      <CopyAllRow
        showToast={showToast}
        text={[
          `【标题】${data.title}`,
          `【简介】\n${data.description}`,
          `【标签】${data.tags.join(', ')}`,
          data.category ? `【分区】${data.category}` : '',
        ]
          .filter(Boolean)
          .join('\n\n')}
      />
    </Card>
  );
}

function YouTubeCard({
  data,
  onChange,
  showToast,
}: {
  data: VideoMetadata['youtube'];
  onChange: (v: VideoMetadata['youtube']) => void;
  showToast: ToastFn;
}) {
  const limits = PLATFORM_LIMITS.youtube;
  const tagsTotalChars = data.tags.join(',').length;
  return (
    <Card platform="youtube" name="YouTube" icon="▶" accent="#ff0033">
      <FieldWithCopy
        label="Title"
        value={data.title}
        onChange={v => onChange({...data, title: v})}
        max={limits.title}
        copyText={data.title}
        showToast={showToast}
      />
      <FieldWithCopy
        label="Description (chapters supported)"
        value={data.description}
        onChange={v => onChange({...data, description: v})}
        max={limits.description}
        textarea
        rows={6}
        copyText={data.description}
        showToast={showToast}
      />
      <TagsField
        label={`Tags (combined ${tagsTotalChars}/${limits.tagsTotalChars})`}
        tagsCounter={false}
        max={Infinity}
        tags={data.tags}
        onChange={tags => onChange({...data, tags})}
        showToast={showToast}
      />
      <TagsField
        label="Hashtags (top 3 show above title)"
        tagsCounter={false}
        max={Infinity}
        prefix="#"
        tags={data.hashtags}
        onChange={hashtags => onChange({...data, hashtags})}
        showToast={showToast}
      />
      <CopyAllRow
        showToast={showToast}
        text={[
          `[Title]\n${data.title}`,
          `[Description]\n${data.description}`,
          `[Tags]\n${data.tags.join(', ')}`,
          `[Hashtags]\n${data.hashtags.map(h => '#' + h).join(' ')}`,
        ].join('\n\n')}
      />
    </Card>
  );
}

function XiaohongshuCard({
  data,
  onChange,
  showToast,
}: {
  data: VideoMetadata['xiaohongshu'];
  onChange: (v: VideoMetadata['xiaohongshu']) => void;
  showToast: ToastFn;
}) {
  const limits = PLATFORM_LIMITS.xiaohongshu;
  return (
    <Card platform="xhs" name="小红书 · Xiaohongshu" icon="📕" accent="#ff2e4d">
      <FieldWithCopy
        label="标题"
        value={data.title}
        onChange={v => onChange({...data, title: v})}
        max={limits.title}
        copyText={data.title}
        showToast={showToast}
      />
      <FieldWithCopy
        label="正文"
        value={data.body}
        onChange={v => onChange({...data, body: v})}
        max={limits.body}
        textarea
        rows={8}
        copyText={data.body}
        showToast={showToast}
      />
      <TagsField
        label={`话题 (最多 ${limits.topics})`}
        max={limits.topics}
        prefix="#"
        suffix="#"
        tags={data.topics}
        onChange={topics => onChange({...data, topics})}
        showToast={showToast}
      />
      <CopyAllRow
        showToast={showToast}
        text={[
          data.title,
          '',
          data.body,
          '',
          data.topics.map(t => `#${t}#`).join(' '),
        ].join('\n')}
      />
    </Card>
  );
}

function WeChatChannelsCard({
  data,
  onChange,
  showToast,
}: {
  data: VideoMetadata['wechatChannels'];
  onChange: (v: VideoMetadata['wechatChannels']) => void;
  showToast: ToastFn;
}) {
  const limits = PLATFORM_LIMITS.wechat;
  return (
    <Card platform="wechat" name="视频号 · WeChat Channels" icon="💬" accent="#07c160">
      <FieldWithCopy
        label="标题"
        value={data.title}
        onChange={v => onChange({...data, title: v})}
        max={limits.title}
        copyText={data.title}
        showToast={showToast}
      />
      <FieldWithCopy
        label="描述"
        value={data.description}
        onChange={v => onChange({...data, description: v})}
        max={limits.description}
        textarea
        rows={5}
        copyText={data.description}
        showToast={showToast}
      />
      <TagsField
        label={`话题 (最多 ${limits.tags})`}
        max={limits.tags}
        prefix="#"
        tags={data.tags}
        onChange={tags => onChange({...data, tags})}
        showToast={showToast}
      />
      <CopyAllRow
        showToast={showToast}
        text={[
          data.title,
          '',
          data.description,
          '',
          data.tags.map(t => `#${t}`).join(' '),
        ].join('\n')}
      />
    </Card>
  );
}

// ----------------------------------------------------------------------------
// Generic UI primitives
// ----------------------------------------------------------------------------

function Card({
  platform,
  name,
  icon,
  accent,
  children,
}: {
  platform: string;
  name: string;
  icon: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`platform-card pc-${platform}`}>
      <div className="pc-header" style={{borderBottomColor: accent}}>
        <div className="pc-icon" style={{background: accent}}>
          {icon}
        </div>
        <span className="pc-name">{name}</span>
      </div>
      <div className="pc-body">{children}</div>
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
    <label className="meta-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

interface FieldWithCopyProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  textarea?: boolean;
  rows?: number;
  copyText: string;
  showToast: ToastFn;
}

function FieldWithCopy({
  label,
  value,
  onChange,
  max,
  textarea,
  rows = 3,
  copyText,
  showToast,
}: FieldWithCopyProps) {
  const len = value.length;
  const over = len > max;
  return (
    <label className="meta-field">
      <span className="field-label-row">
        <span>{label}</span>
        <span className="field-tools">
          <span className={`field-counter ${over ? 'over' : ''}`}>
            {len}/{isFinite(max) ? max : '∞'}
          </span>
          <button
            className="copy-btn-inline"
            onClick={() => copyToClipboard(copyText, showToast)}
            type="button"
          >
            复制
          </button>
        </span>
      </span>
      {textarea ? (
        <textarea
          rows={rows}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

interface TagsFieldProps {
  label: string;
  max: number;
  tagsCounter?: boolean;
  prefix?: string;
  suffix?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  showToast: ToastFn;
}

function TagsField({
  label,
  max,
  tagsCounter = true,
  prefix,
  suffix,
  tags,
  onChange,
  showToast,
}: TagsFieldProps) {
  const text = tags.join(', ');
  const over = tags.length > max;
  const formatted = tags
    .map(t => `${prefix ?? ''}${t}${suffix ?? ''}`)
    .join(' ');
  return (
    <label className="meta-field">
      <span className="field-label-row">
        <span>{label}</span>
        <span className="field-tools">
          {tagsCounter && (
            <span className={`field-counter ${over ? 'over' : ''}`}>
              {tags.length}/{isFinite(max) ? max : '∞'}
            </span>
          )}
          <button
            className="copy-btn-inline"
            onClick={() => copyToClipboard(formatted || text, showToast)}
            type="button"
          >
            复制
          </button>
        </span>
      </span>
      <input
        type="text"
        value={text}
        onChange={e =>
          onChange(
            e.target.value
              .split(',')
              .map(t => t.trim())
              .filter(Boolean),
          )
        }
        placeholder="逗号分隔"
      />
    </label>
  );
}

function CopyAllRow({
  text,
  showToast,
}: {
  text: string;
  showToast: ToastFn;
}) {
  return (
    <div className="copy-all-row">
      <button
        className="copy-all-btn"
        onClick={() => copyToClipboard(text, showToast)}
        type="button"
      >
        📋 全部复制
      </button>
    </div>
  );
}

async function copyToClipboard(text: string, showToast: ToastFn) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('✓ 已复制到剪贴板');
  } catch (err) {
    showToast(`复制失败：${(err as Error).message}`);
  }
}
