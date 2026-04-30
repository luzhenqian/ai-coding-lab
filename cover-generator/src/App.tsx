import {useEffect, useRef, useState} from 'react';
import {Cover} from './Cover';
import {Editor} from './Editor';
import {MetadataPanel} from './MetadataPanel';
import {RESOLUTIONS} from './lib/design-tokens';
import {buildFilename, downloadBlob, renderCover} from './lib/export';
import {PRESETS, findPreset} from './lib/presets';
import type {CoverContent, VideoMetadata} from './lib/types';
import './styles/app.css';

const PREVIEW_FIT_PADDING = 80;

type Tab = 'cover' | 'metadata';

export function App() {
  const [presetId, setPresetId] = useState<string>(PRESETS[0].id);
  const [activeTab, setActiveTab] = useState<Tab>('cover');
  const [content, setContent] = useState<CoverContent>(PRESETS[0].cover);
  const [metadata, setMetadata] = useState<VideoMetadata>(PRESETS[0].metadata);
  const [resolutionIdx, setResolutionIdx] = useState(2);
  const [previewScale, setPreviewScale] = useState(0.6);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const coverRef = useRef<HTMLDivElement>(null);
  const previewWrapRef = useRef<HTMLDivElement>(null);

  // Auto-fit preview to available width.
  useEffect(() => {
    function fit() {
      const wrap = previewWrapRef.current;
      if (!wrap) return;
      const available = wrap.clientWidth - PREVIEW_FIT_PADDING;
      const scale = Math.min(1, Math.max(0.3, available / 1280));
      setPreviewScale(scale);
    }
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [activeTab]);

  function handlePresetChange(id: string) {
    const preset = findPreset(id);
    if (!preset) return;
    setPresetId(id);
    setContent(preset.cover);
    setMetadata(preset.metadata);
  }

  async function handleExport() {
    if (!coverRef.current) return;
    const resolution = RESOLUTIONS[resolutionIdx];
    setExporting(true);
    try {
      const result = await renderCover(coverRef.current, resolution);
      const filename = buildFilename(
        content.episode,
        `${result.width}x${result.height}`,
      );
      downloadBlob(result.blob, filename);
      setToast(`✓ 已导出 ${result.width}×${result.height}（${result.sizeMB.toFixed(1)} MB）`);
    } catch (err) {
      console.error(err);
      setToast(`导出失败：${(err as Error).message}`);
    } finally {
      setExporting(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  function resetToCurrentPreset() {
    if (confirm('重置该期所有字段为预设原始内容？当前编辑会丢失。')) {
      const preset = findPreset(presetId);
      if (preset) {
        setContent(preset.cover);
        setMetadata(preset.metadata);
      }
    }
  }

  return (
    <div className="app">
      {activeTab === 'cover' && (
        <aside className="app-sidebar">
          <Editor content={content} onChange={setContent} />
          <div className="sidebar-footer">
            <button className="ghost-btn" onClick={resetToCurrentPreset}>
              重置为预设原始内容
            </button>
          </div>
        </aside>
      )}

      <main className="app-main" ref={previewWrapRef}>
        <div className="app-toolbar">
          <label>选集</label>
          <select
            value={presetId}
            onChange={e => handlePresetChange(e.target.value)}
            className="preset-select"
          >
            {PRESETS.map(p => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          <span className="toolbar-divider" />

          <div className="tab-group">
            <button
              className={`tab-btn ${activeTab === 'cover' ? 'active' : ''}`}
              onClick={() => setActiveTab('cover')}
            >
              封面
            </button>
            <button
              className={`tab-btn ${activeTab === 'metadata' ? 'active' : ''}`}
              onClick={() => setActiveTab('metadata')}
            >
              元数据
            </button>
          </div>

          {activeTab === 'cover' && (
            <>
              <span className="toolbar-divider" />
              <label>分辨率</label>
              <select
                value={resolutionIdx}
                onChange={e => setResolutionIdx(parseInt(e.target.value))}
              >
                {RESOLUTIONS.map((r, i) => (
                  <option key={i} value={i}>
                    {r.label}
                  </option>
                ))}
              </select>
              <span className="res-hint">
                {RESOLUTIONS[resolutionIdx].width} × {RESOLUTIONS[resolutionIdx].height} px
              </span>
              <button
                className={`export-btn ${exporting ? 'exporting' : ''}`}
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? '渲染中...' : '导出 PNG'}
              </button>
            </>
          )}

          {activeTab === 'metadata' && (
            <>
              <span className="res-hint">
                每个平台的字段都可单独复制 · 字数计数器超限会变红
              </span>
              <button
                className="ghost-btn small"
                onClick={resetToCurrentPreset}
              >
                重置
              </button>
            </>
          )}
        </div>

        {activeTab === 'cover' ? (
          <div className="preview-area">
            <div
              className="preview-frame"
              style={{
                width: `${1280 * previewScale}px`,
                height: `${720 * previewScale}px`,
              }}
            >
              <div
                className="preview-scaler"
                style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top left',
                }}
              >
                <Cover ref={coverRef} content={content} />
              </div>
            </div>
            <div className="preview-meta">
              预览缩放 {Math.round(previewScale * 100)}%（实际渲染 1280×720，导出按上方分辨率）
            </div>
          </div>
        ) : (
          <MetadataPanel metadata={metadata} onChange={setMetadata} />
        )}
      </main>

      {toast && <div className="toast show">{toast}</div>}
    </div>
  );
}
