/**
 * 聊天面板组件
 *
 * 做什么：提供用户与 Agent 对话的聊天界面，展示消息列表、工具调用状态和输入框
 * 为什么：这是 AI SDK v5 useChat 的前端集成，通过 parts 渲染模式
 *        正确展示文本内容和工具调用过程，让用户看到 Agent 的推理和行动
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat, type UIMessage } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { motion } from 'motion/react'
import { Send, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { slideUp } from '@/lib/animations'
import { ToolStatusBadge } from './ToolStatusBadge'
import { StreamdownRenderer } from './StreamdownRenderer'
import {
  getConversationById,
  toInitialMessage,
} from '@/lib/conversation-store'

const transport = new DefaultChatTransport({ api: '/api/chat' })

interface ChatPanelProps {
  conversationId: string | null
  onMessagesChange?: (messages: UIMessage[]) => void
}

export function ChatPanel({ conversationId, onMessagesChange }: ChatPanelProps) {
  const savedMessages = conversationId
    ? (getConversationById(conversationId)?.messages ?? []).map(toInitialMessage)
    : undefined

  const [input, setInput] = useState('')
  const { messages, sendMessage, status, stop } = useChat({
    transport,
    messages: savedMessages,
  })

  const onMessagesChangeRef = useRef(onMessagesChange)
  onMessagesChangeRef.current = onMessagesChange

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messages.length > 0 && onMessagesChangeRef.current) {
      onMessagesChangeRef.current(messages)
    }
  }, [messages])

  /** 自动滚动到底部 */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const isLoading = status === 'streaming' || status === 'submitted'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    sendMessage({ text: trimmed })
    setInput('')
  }

  return (
    <div className="flex h-full flex-col">
      {/* 消息列表区域 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex h-full min-h-[400px] items-center justify-center text-muted-foreground">
              <p>输入 GitHub 仓库地址开始分析，例如：分析一下 vercel/next.js</p>
            </div>
          )}

          {messages.map((message) => (
            <motion.div
              key={message.id}
              variants={slideUp}
              initial="hidden"
              animate="visible"
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-4 py-3 transition-colors',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground shadow-[0_0_12px_var(--neon-cyan-glow)]'
                    : 'bg-card text-card-foreground border border-border'
                )}
              >
                {message.parts.map((part, index) => {
                  if (part.type === 'text') {
                    if (message.role === 'assistant') {
                      return (
                        <div key={index}>
                          <StreamdownRenderer
                            content={part.text}
                            isStreaming={status === 'streaming'}
                          />
                        </div>
                      )
                    }
                    return (
                      <div key={index} className="whitespace-pre-wrap">
                        {part.text}
                      </div>
                    )
                  }

                  if (part.type.startsWith('tool-')) {
                    const toolName = part.type.replace('tool-', '')
                    const toolPart = part as {
                      type: string
                      toolCallId: string
                      state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error'
                      errorText?: string
                    }
                    return (
                      <div key={toolPart.toolCallId ?? index} className="my-2">
                        <ToolStatusBadge
                          toolName={toolName}
                          state={toolPart.state}
                        />
                        {toolPart.state === 'output-error' && toolPart.errorText && (
                          <div className="mt-1 rounded bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                            {toolPart.errorText}
                          </div>
                        )}
                      </div>
                    )
                  }

                  return null
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 输入区域 */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-border bg-card/50 backdrop-blur-sm p-4"
      >
        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入 GitHub 仓库地址或问题..."
            className="flex-1 bg-input border-border focus-visible:ring-primary"
            disabled={isLoading}
          />
          {isLoading ? (
            <Button
              type="button"
              onClick={stop}
              variant="destructive"
              size="icon"
              className="shrink-0"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!input.trim()}
              className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_8px_var(--neon-cyan-glow)]"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
