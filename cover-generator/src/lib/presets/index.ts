import type {CoverContent} from '../types';
import {ep03ToolSystem} from './ep03-tool-system';
import {ep04AgentOrchestration} from './ep04-agent-orchestration';

/**
 * Registry of all available cover presets.
 *
 * To add a new episode:
 *   1. Create `presets/ep0X-<slug>.ts` exporting a `CoverContent` constant
 *   2. Import it here and append to the array below
 *   3. The dropdown in the UI picks it up automatically
 *
 * Convention: list newest first so the latest episode is the default.
 */
export interface Preset {
  /** Stable id used in URL hash and dropdown value. Snake-case, no spaces. */
  id: string;
  /** Human-friendly label shown in the dropdown. */
  label: string;
  content: CoverContent;
}

export const PRESETS: Preset[] = [
  {
    id: 'ep04-agent-orchestration',
    label: 'EP04 · Agent 编排（四种模式）',
    content: ep04AgentOrchestration,
  },
  {
    id: 'ep03-tool-system',
    label: 'EP03 · 工具系统（Claude Code 源码）',
    content: ep03ToolSystem,
  },
];

export function findPreset(id: string): Preset | undefined {
  return PRESETS.find(p => p.id === id);
}
