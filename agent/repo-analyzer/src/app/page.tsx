/**
 * 做什么：渲染应用主界面，统一管理 chat 和 workflow 对话列表
 * 为什么：支持两种模式切换，侧边栏在两种模式下都可见，workflow 数据可持久化恢复
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { UIMessage } from '@ai-sdk/react'
import { ChatPanel } from '@/app/components/ChatPanel'
import { WorkflowPanel } from '@/app/components/WorkflowPanel'
import { ModeSwitcher, type AppMode } from '@/app/components/ModeSwitcher'
import { ConversationList } from '@/app/components/ConversationList'
import { ThemeToggle } from '@/app/components/ThemeToggle'
import { Separator } from '@/components/ui/separator'
import { fadeIn } from '@/lib/animations'
import {
  getAllConversations,
  createConversation,
  createWorkflowConversation,
  updateConversation,
  updateWorkflowState,
  deleteConversation,
  toStoredMessage,
  generateTitle,
  type StoredConversation,
  type WorkflowState,
} from '@/lib/conversation-store'

export default function Home() {
  const [mode, setMode] = useState<AppMode>('chat')
  const [conversations, setConversations] = useState<StoredConversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null
  useEffect(() => {
    const all = getAllConversations()
    if (all.length === 0) {
      const newConv = createConversation()
      setConversations([newConv])
      setActiveId(newConv.id)
    } else {
      setConversations(all)
      setActiveId(all[0].id)
      // 根据第一个对话的类型设置初始模式
      if (all[0].type === 'workflow') setMode('workflow')
    }
  }, [])

  const handleCreate = useCallback(() => {
    const newConv = mode === 'workflow'
      ? createWorkflowConversation('新 Workflow')
      : createConversation()
    setConversations((prev) => [newConv, ...prev])
    setActiveId(newConv.id)
  }, [mode])

  const handleSelect = useCallback((id: string) => {
    setActiveId(id)
    const conv = conversations.find((c) => c.id === id)
    setMode(conv?.type === 'workflow' ? 'workflow' : 'chat')
  }, [conversations])

  const handleDelete = useCallback((id: string) => {
    deleteConversation(id)
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id)
      if (id === activeId) {
        if (remaining.length === 0) {
          const newConv = createConversation()
          setActiveId(newConv.id)
          setMode('chat')
          return [newConv]
        }
        setActiveId(remaining[0].id)
        setMode(remaining[0].type === 'workflow' ? 'workflow' : 'chat')
      }
      return remaining
    })
  }, [activeId])

  const handleMessagesChange = useCallback((messages: UIMessage[]) => {
    if (!activeId) return
    const storedMessages = messages.map(toStoredMessage)
    const title = generateTitle(storedMessages)
    const updated = updateConversation(activeId, { messages: storedMessages, title })
    if (updated) {
      setConversations((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      )
    }
  }, [activeId])

  const handleWorkflowStateChange = useCallback((state: WorkflowState) => {
    const repo = state.repoInfo as { owner?: string; repo?: string } | null | undefined
    const title = repo?.owner && repo?.repo
      ? `Workflow: ${repo.owner}/${repo.repo}` : `Workflow: ${state.url}`
    if (!activeId || activeConversation?.type !== 'workflow') {
      const newConv = createWorkflowConversation(title)
      updateWorkflowState(newConv.id, state)
      const now = new Date().toISOString()
      setConversations((prev) => [
        { ...newConv, title, workflowState: state, updatedAt: now },
        ...prev.filter((c) => c.id !== newConv.id),
      ])
      setActiveId(newConv.id)
    } else {
      updateConversation(activeId, { workflowState: state, title })
      const now = new Date().toISOString()
      setConversations((prev) =>
        prev.map((c) => c.id === activeId ? { ...c, title, workflowState: state, updatedAt: now } : c)
      )
    }
  }, [activeId, activeConversation?.type])

  const handleModeChange = useCallback((newMode: AppMode) => {
    setMode(newMode)
    const needsSwitch = (newMode === 'workflow') !== (activeConversation?.type === 'workflow')
    if (!needsSwitch) return
    const existing = conversations.find((c) =>
      newMode === 'workflow' ? c.type === 'workflow' : c.type !== 'workflow'
    )
    if (existing) { setActiveId(existing.id); return }
    const newConv = newMode === 'workflow'
      ? createWorkflowConversation('新 Workflow')
      : createConversation()
    setConversations((prev) => [newConv, ...prev])
    setActiveId(newConv.id)
  }, [activeConversation?.type, conversations])

  return (
    <main className="flex h-screen flex-col bg-background">
      {/* 页面标题栏 */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-green bg-clip-text text-transparent">
              GitHub 仓库智能分析助手
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              输入仓库地址，AI 助手将为你分析项目概况、技术栈和目录结构
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ModeSwitcher mode={mode} onModeChange={handleModeChange} />
            <Separator orientation="vertical" className="h-6" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 侧边栏在两种模式下都可见 */}
      <div className="flex flex-1 overflow-hidden">
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
          onCreate={handleCreate}
          onDelete={handleDelete}
        />
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {mode === 'chat' ? (
              <motion.div
                key={`chat-${activeId}`}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="h-full"
              >
                <ChatPanel
                  conversationId={activeId}
                  onMessagesChange={handleMessagesChange}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`workflow-${activeId}`}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="h-full"
              >
                <WorkflowPanel
                  initialState={activeConversation?.workflowState as WorkflowState | null}
                  onStateChange={handleWorkflowStateChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
