/**
 * 对话列表侧边栏
 *
 * 做什么：展示所有历史对话，支持新建、切换、删除操作
 * 为什么：用户可能需要同时管理多个仓库分析对话，
 *        侧边栏提供快速切换和组织能力
 */

'use client'

import { motion } from 'motion/react'
import { Plus, X, GitBranch, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { staggerItem } from '@/lib/animations'
import type { StoredConversation } from '@/lib/conversation-store'

interface ConversationListProps {
  conversations: StoredConversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onCreate,
  onDelete,
}: ConversationListProps) {
  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      {/* 新建对话按钮 */}
      <div className="border-b border-border p-3">
        <Button
          onClick={onCreate}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_12px_var(--neon-cyan-glow)]"
        >
          <Plus className="mr-2 h-4 w-4" />
          新对话
        </Button>
      </div>

      {/* 对话列表 */}
      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            暂无对话记录
          </div>
        ) : (
          conversations.map((conv) => (
            <motion.div
              key={conv.id}
              variants={staggerItem}
              initial="hidden"
              animate="visible"
              onClick={() => onSelect(conv.id)}
              className={cn(
                'group flex cursor-pointer items-center justify-between border-b border-border/50 px-3 py-3 transition-colors duration-200',
                conv.id === activeId
                  ? 'bg-accent border-l-2 border-l-primary'
                  : 'hover:bg-accent/50'
              )}
            >
              <div className="mr-2 flex-shrink-0">
                {conv.type === 'workflow' ? (
                  <GitBranch className="h-4 w-4 text-primary" />
                ) : (
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">
                  {conv.title || (conv.type === 'workflow' ? '新 Workflow' : '新对话')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatRelativeTime(conv.updatedAt)}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(conv.id)
                }}
                className="ml-2 hidden rounded p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive group-hover:block transition-colors"
                title="删除对话"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))
        )}
      </ScrollArea>
    </div>
  )
}
