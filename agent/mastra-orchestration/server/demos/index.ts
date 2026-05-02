import type { Demo } from '../types.js'
import { workflow } from './01-workflow.js'
import { supervisorDemo } from './02-supervisor.js'

export const demos: Record<string, Demo> = {
  '01-workflow': workflow,
  '02-supervisor': supervisorDemo,
}
