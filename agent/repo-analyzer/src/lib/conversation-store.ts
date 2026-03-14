/**
 * 对话存储模块
 *
 * 做什么：用 localStorage 实现对话和 workflow 数据的持久化存储，提供 CRUD 操作
 * 为什么：用户刷新页面后对话和 workflow 分析数据不会丢失，支持统一管理
 */

import { z } from 'zod'
import type { UIMessage } from '@ai-sdk/react'
import type { StepInfo } from '@/app/components/StepStatusBar'
import type { GitHubRepo, RepoTree } from '@/lib/schemas'

/** localStorage 存储键 */
const STORAGE_KEY = 'repo-analyzer:conversations'

/** 持久化消息格式 —— UIMessage 的序列化子集 */
const storedMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  parts: z.array(z.unknown()),
  createdAt: z.string().optional(),
})

/** Workflow 状态快照 —— 保存 workflow 各阶段的完整状态用于恢复 */
const workflowStateSchema = z.object({
  runId: z.string(),
  url: z.string(),
  phase: z.enum(['idle', 'running', 'suspended', 'streaming', 'done', 'error', 'cancelled']),
  steps: z.array(z.object({
    id: z.string(),
    label: z.string(),
    status: z.enum(['waiting', 'running', 'success', 'suspended', 'failed', 'cancelled']),
  })),
  repoInfo: z.unknown().nullable().optional(),
  repoTree: z.unknown().nullable().optional(),
  report: z.string().optional(),
  error: z.string().optional(),
})

/** 持久化对话格式 —— type 字段区分 chat 和 workflow */
const storedConversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['chat', 'workflow']).default('chat'),
  createdAt: z.string(),
  updatedAt: z.string(),
  messages: z.array(storedMessageSchema),
  workflowState: workflowStateSchema.nullable().optional(),
})

type StoredMessage = z.infer<typeof storedMessageSchema>
export type WorkflowState = {
  runId: string
  url: string
  phase: 'idle' | 'running' | 'suspended' | 'streaming' | 'done' | 'error' | 'cancelled'
  steps: StepInfo[]
  repoInfo?: GitHubRepo | null
  repoTree?: RepoTree | null
  report?: string
  error?: string
}
export type StoredConversation = z.infer<typeof storedConversationSchema>

/** 从 localStorage 读取所有对话，校验失败时返回空数组（优雅降级） */
export function getAllConversations(): StoredConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    const result = z.array(storedConversationSchema).safeParse(parsed)
    if (!result.success) return []
    return result.data.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  } catch {
    return []
  }
}

/** 根据 ID 获取单个对话 */
export function getConversationById(id: string): StoredConversation | null {
  return getAllConversations().find((c) => c.id === id) ?? null
}

/** 创建新的空对话（chat 类型） */
export function createConversation(): StoredConversation {
  const now = new Date().toISOString()
  const conversation: StoredConversation = {
    id: crypto.randomUUID(),
    title: '',
    type: 'chat',
    createdAt: now,
    updatedAt: now,
    messages: [],
  }
  const all = getAllConversations()
  all.unshift(conversation)
  saveAll(all)
  return conversation
}

/** 创建 workflow 类型的对话条目 */
export function createWorkflowConversation(title: string): StoredConversation {
  const now = new Date().toISOString()
  const conversation: StoredConversation = {
    id: crypto.randomUUID(),
    title,
    type: 'workflow',
    createdAt: now,
    updatedAt: now,
    messages: [],
    workflowState: null,
  }
  const all = getAllConversations()
  all.unshift(conversation)
  saveAll(all)
  return conversation
}

/** 更新 workflow 对话的状态快照 */
export function updateWorkflowState(
  id: string,
  state: WorkflowState
): StoredConversation | null {
  return updateConversation(id, { workflowState: state })
}

/** 更新对话（标题、消息或 workflow 状态） */
export function updateConversation(
  id: string,
  updates: { title?: string; messages?: StoredMessage[]; workflowState?: WorkflowState | null }
): StoredConversation | null {
  const all = getAllConversations()
  const index = all.findIndex((c) => c.id === id)
  if (index === -1) return null
  const updated = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  all[index] = updated
  saveAll(all)
  return updated
}

/** 删除对话 */
export function deleteConversation(id: string): void {
  const all = getAllConversations().filter((c) => c.id !== id)
  saveAll(all)
}

/** UIMessage → 持久化格式 */
export function toStoredMessage(message: UIMessage): StoredMessage {
  return {
    id: message.id,
    role: message.role as StoredMessage['role'],
    parts: message.parts,
  }
}

/** 持久化格式 → useChat 的 messages 参数格式 */
export function toInitialMessage(stored: StoredMessage): UIMessage {
  return {
    id: stored.id,
    role: stored.role,
    parts: stored.parts as UIMessage['parts'],
  }
}

/** 从第一条用户消息生成对话标题（截取前 20 字符） */
export function generateTitle(messages: StoredMessage[]): string {
  const firstUserMsg = messages.find((m) => m.role === 'user')
  if (!firstUserMsg) return '新对话'
  const textPart = firstUserMsg.parts.find(
    (p): p is { type: string; text: string } =>
      typeof p === 'object' && p !== null && 'type' in p && (p as { type: string }).type === 'text'
  )
  if (!textPart?.text) return '新对话'
  return textPart.text.slice(0, 20) + (textPart.text.length > 20 ? '...' : '')
}

/** 写入 localStorage，捕获配额溢出 */
function saveAll(conversations: StoredConversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      throw new Error('存储空间不足，请删除部分旧对话后重试')
    }
    throw e
  }
}
