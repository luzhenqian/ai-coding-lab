/**
 * 做什么：封装 workflow 的启动、审批、取消逻辑，支持从外部初始状态恢复
 * 为什么：状态管理与 UI 分离，通过 onStateChange 回调让父组件负责持久化
 */
'use client'

import { useState, useCallback, useRef, type FormEvent } from 'react'
import type { StepInfo, StepStatus } from './StepStatusBar'
import type { GitHubRepo, RepoTree } from '@/lib/schemas'
import type { WorkflowState } from '@/lib/conversation-store'

export type WorkflowPhase = WorkflowState['phase']

const DEFAULT_STEPS: StepInfo[] = [
  { id: 'parse-url', label: '解析地址', status: 'waiting' },
  { id: 'fetch-data', label: '获取数据', status: 'waiting' },
  { id: 'human-approval', label: '人工审批', status: 'waiting' },
  { id: 'generate-report', label: '生成报告', status: 'waiting' },
]

interface UseWorkflowOptions {
  initialState?: WorkflowState | null
  onStateChange?: (state: WorkflowState) => void
}

/** JSON POST 请求的通用封装 */
async function postJSON(url: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/** 恢复时 running/streaming 视为中断 */
function safeInitPhase(p?: WorkflowPhase): WorkflowPhase {
  return (p === 'running' || p === 'streaming') ? 'error' : (p ?? 'idle')
}

export function useWorkflow(options?: UseWorkflowOptions) {
  const { initialState, onStateChange } = options ?? {}
  const restoredPhase = safeInitPhase(initialState?.phase)
  const [url, setUrl] = useState(initialState?.url ?? '')
  const [phase, setPhase] = useState<WorkflowPhase>(restoredPhase)
  const [steps, setSteps] = useState<StepInfo[]>(initialState?.steps ?? DEFAULT_STEPS)
  const [runId, setRunId] = useState<string | null>(initialState?.runId ?? null)
  const [repoInfo, setRepoInfo] = useState<GitHubRepo | null>(
    (initialState?.repoInfo as GitHubRepo) ?? null
  )
  const [repoTree, setRepoTree] = useState<RepoTree | null>(
    (initialState?.repoTree as RepoTree) ?? null
  )
  const [report, setReport] = useState(initialState?.report ?? '')
  const [error, setError] = useState(
    restoredPhase === 'error' && !initialState?.error
      ? '分析过程因页面刷新而中断，请重新开始'
      : (initialState?.error ?? '')
  )
  const [loading, setLoading] = useState(false)
  const onStateChangeRef = useRef(onStateChange)
  onStateChangeRef.current = onStateChange
  const updateStep = useCallback((id: string, status: StepStatus) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))
  }, [])

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    const newSteps = [...DEFAULT_STEPS]
    newSteps[0] = { ...newSteps[0], status: 'running' }
    setPhase('running')
    setSteps(newSteps)
    setReport('')
    setError('')
    setRepoInfo(null)
    setRepoTree(null)

    try {
      const res = await postJSON('/api/workflow/start', { url: url.trim() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '启动分析失败')
      setRunId(data.runId)

      if (data.status === 'suspended') {
        const suspSteps = DEFAULT_STEPS.map((s) => {
          if (s.id === 'parse-url' || s.id === 'fetch-data') return { ...s, status: 'success' as StepStatus }
          if (s.id === 'human-approval') return { ...s, status: 'suspended' as StepStatus }
          return s
        })
        setSteps(suspSteps)
        setPhase('suspended')
        // 从返回数据中提取仓库信息
        let info: GitHubRepo | null = null
        let tree: RepoTree | null = null
        const fetchOut = data.steps?.['fetch-data'] as
          | { output?: { repoInfo?: GitHubRepo; repoTree?: RepoTree } } | undefined
        if (fetchOut?.output?.repoInfo) { info = fetchOut.output.repoInfo; setRepoInfo(info) }
        if (fetchOut?.output?.repoTree) { tree = fetchOut.output.repoTree; setRepoTree(tree) }
        const approval = data.steps?.['human-approval'] as
          | { output?: { summary?: GitHubRepo } } | undefined
        if (approval?.output?.summary) { info = approval.output.summary; setRepoInfo(info) }
        onStateChangeRef.current?.({
          runId: data.runId, url: url.trim(), phase: 'suspended',
          steps: suspSteps, repoInfo: info, repoTree: tree,
        })
      } else if (data.status === 'completed') {
        const doneSteps = DEFAULT_STEPS.map((s) => ({ ...s, status: 'success' as StepStatus }))
        setSteps(doneSteps)
        setPhase('done')
        onStateChangeRef.current?.({
          runId: data.runId, url: url.trim(), phase: 'done', steps: doneSteps,
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误'
      setError(msg)
      setPhase('error')
      updateStep('parse-url', 'failed')
    }
  }, [url, updateStep])

  const handleApprove = useCallback(async () => {
    if (!runId) return
    setLoading(true)
    const appSteps = steps.map((s) => {
      if (s.id === 'human-approval') return { ...s, status: 'success' as StepStatus }
      if (s.id === 'generate-report') return { ...s, status: 'running' as StepStatus }
      return s
    })
    setSteps(appSteps)
    setPhase('streaming')
    try {
      // 并行：resume workflow（后台）+ 流式生成报告（前台）
      // report API 独立于 workflow，不需要等 resume 完成
      const resumePromise = postJSON('/api/workflow/resume', { runId, approved: true })
      let finalReport = ''
      if (repoInfo && repoTree) {
        const reportRes = await postJSON('/api/workflow/report', { repoInfo, repoTree })
        if (!reportRes.ok || !reportRes.body) throw new Error('生成报告失败')
        const reader = reportRes.body.getReader()
        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          finalReport += decoder.decode(value, { stream: true })
          setReport(finalReport)
        }
      }
      // 确保 resume 也完成（忽略其结果，报告已独立生成）
      await resumePromise.catch(() => {})
      const doneSteps = appSteps.map((s) =>
        s.id === 'generate-report' ? { ...s, status: 'success' as StepStatus } : s
      )
      setSteps(doneSteps)
      setPhase('done')
      onStateChangeRef.current?.({
        runId, url, phase: 'done', steps: doneSteps,
        repoInfo, repoTree, report: finalReport,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : '生成报告时发生错误'
      setError(msg)
      updateStep('generate-report', 'failed')
      setPhase('error')
    } finally {
      setLoading(false)
    }
  }, [runId, repoInfo, repoTree, url, steps, updateStep])

  /** 用户取消分析 */
  const handleCancel = useCallback(async () => {
    if (!runId) return
    setLoading(true)
    try {
      await postJSON('/api/workflow/resume', { runId, approved: false })
      const cancelSteps = steps.map((s) => {
        if (s.id === 'human-approval' || s.id === 'generate-report') {
          return { ...s, status: 'cancelled' as StepStatus }
        }
        return s
      })
      setSteps(cancelSteps)
      setPhase('cancelled')
      onStateChangeRef.current?.({
        runId, url, phase: 'cancelled', steps: cancelSteps,
        repoInfo, repoTree,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '取消操作失败')
      setPhase('error')
    } finally {
      setLoading(false)
    }
  }, [runId, url, steps, repoInfo, repoTree])

  return {
    url, setUrl, phase, steps, repoInfo, report, error, loading,
    handleSubmit, handleApprove, handleCancel,
  }
}
