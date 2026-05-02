import { workflowLayout } from './workflow'
import { supervisorLayout } from './supervisor'
import { handoffLayout } from './handoff'
import { councilLayout } from './council'
import { hybridLayout } from './hybrid'

const layouts: Record<string, typeof workflowLayout> = {
  '01-workflow': workflowLayout,
  '02-supervisor': supervisorLayout,
  '03-handoff': handoffLayout,
  '04-council': councilLayout,
  '05-hybrid': hybridLayout,
}

export function getLayout(demoId: string) {
  return layouts[demoId]
}
