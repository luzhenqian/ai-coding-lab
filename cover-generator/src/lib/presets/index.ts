import type {CoverContent, VideoMetadata} from '../types';
import {ep01Overview} from './ep01-overview';
import {ep02QueryEngine} from './ep02-query-engine';
import {ep03ToolSystem} from './ep03-tool-system';
import {ep04AgentOrchestration} from './ep04-agent-orchestration';

/**
 * Registry of all episode bundles.
 *
 * Each preset is the full deliverable set for one episode:
 *   • `cover`    — CoverContent for the thumbnail (theme + variant)
 *   • `metadata` — title/description/tags for B站 / YouTube / 小红书 / 视频号
 *
 * To add a new episode:
 *   1. Create `presets/ep0X-<slug>.ts` exporting `cover` + `metadata` constants
 *   2. Import it here and prepend to the array below (newest first)
 *   3. The dropdown picks it up automatically
 */
export interface Preset {
  id: string;
  label: string;
  cover: CoverContent;
  metadata: VideoMetadata;
}

export const PRESETS: Preset[] = [
  {
    id: 'ep04-agent-orchestration',
    label: 'EP04 · Agent 编排（rose / pipeline）',
    cover: ep04AgentOrchestration.cover,
    metadata: ep04AgentOrchestration.metadata,
  },
  {
    id: 'ep03-tool-system',
    label: 'EP03 · 工具系统（emerald / pipeline）',
    cover: ep03ToolSystem.cover,
    metadata: ep03ToolSystem.metadata,
  },
  {
    id: 'ep02-query-engine',
    label: 'EP02 · 查询引擎（indigo / state-machine）',
    cover: ep02QueryEngine.cover,
    metadata: ep02QueryEngine.metadata,
  },
  {
    id: 'ep01-overview',
    label: 'EP01 · 50 万行 AI CLI 全景（orange / pipeline-chips）',
    cover: ep01Overview.cover,
    metadata: ep01Overview.metadata,
  },
];

export function findPreset(id: string): Preset | undefined {
  return PRESETS.find(p => p.id === id);
}
