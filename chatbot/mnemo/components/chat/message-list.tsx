"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/chat/message-bubble";
import { TypingIndicator } from "@/components/chat/typing-indicator";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt?: string;
}

interface MessageListProps {
  messages: Message[];
  isWaiting?: boolean;
  onSuggestionClick?: (text: string) => void;
}

const SUGGESTIONS = [
  "介绍一下你的记忆功能",
  "帮我写一段 Python 代码",
  "解释什么是 RAG",
  "总结我们之前的对话",
];

/**
 * 消息列表组件
 * - 使用 ScrollArea 实现可滚动容器
 * - 新消息到达时自动滚动到底部
 * - 无消息时显示欢迎语和建议提示
 * - 等待 AI 回复时显示 typing indicator
 */
export function MessageList({ messages, isWaiting, onSuggestionClick }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // 新消息到达时自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  return (
    <ScrollArea className="flex-1 overflow-hidden">
      <div className="flex flex-col gap-4 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 py-20">
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">你好！我是 Mnemo</p>
              <p className="mt-1 text-sm text-muted-foreground">有什么可以帮你的？</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onSuggestionClick?.(suggestion)}
                  className="rounded-full border bg-background px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              role={message.role as "user" | "assistant" | "system"}
              content={message.content}
              createdAt={message.createdAt}
            />
          ))
        )}
        {isWaiting && <TypingIndicator />}
        {/* 滚动锚点 */}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
