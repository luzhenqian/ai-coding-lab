import type { Demo } from '../types.js'
import { workflow } from './01-workflow.js'

export const demos: Record<string, Demo> = {
  '01-workflow': workflow,
}
