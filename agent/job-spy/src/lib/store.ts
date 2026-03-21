import type { ResumeData, PipelineOutputs } from './schemas'

const RESUME_KEY = 'jobspy_resume'
const HISTORY_KEY = 'jobspy_history'

export interface AnalysisRecord {
  id: string
  timestamp: number
  jobTitle: string
  company: string
  rawJD: string
  outputs: PipelineOutputs
  resumeSnapshot: ResumeData
}

// ==================== Resume ====================

export function getResume(): ResumeData | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(RESUME_KEY)
  return data ? JSON.parse(data) : null
}

export function saveResume(data: ResumeData): void {
  localStorage.setItem(RESUME_KEY, JSON.stringify(data))
}

// ==================== History ====================

export function getHistory(): AnalysisRecord[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(HISTORY_KEY)
  return data ? JSON.parse(data) : []
}

export function saveAnalysis(record: AnalysisRecord): void {
  const history = getHistory()
  history.unshift(record)
  // Keep last 20 records
  if (history.length > 20) history.length = 20
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function deleteAnalysis(id: string): void {
  const history = getHistory().filter(r => r.id !== id)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}
