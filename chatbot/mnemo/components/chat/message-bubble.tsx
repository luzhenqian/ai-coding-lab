"use client";

import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { User, Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
}

/**
 * 消息气泡组件
 * - 用户消息右对齐蓝色，助手消息左对齐灰色
 * - 带头像（用户/机器人图标）
 * - 使用 streamdown 渲染 Markdown（针对 AI 流式输出优化）
 * - 入场动画 fade-in + slide-up
 * - system 消息不渲染
 */
export function MessageBubble({ role, content, createdAt }: MessageBubbleProps) {
  if (role === "system") return null;

  const isUser = role === "user";

  const formattedTime = createdAt
    ? new Date(createdAt).toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : null;

  return (
    <div
      className={cn(
        "flex w-full animate-in fade-in slide-in-from-bottom-2 animation-duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[80%] items-end gap-2",
          isUser && "flex-row-reverse"
        )}
      >
        <Avatar size="sm">
          <AvatarFallback>
            {isUser ? (
              <User className="size-3.5" />
            ) : (
              <Bot className="size-3.5" />
            )}
          </AvatarFallback>
        </Avatar>
        <div>
          <div
            className={cn(
              "rounded-2xl px-4 py-2",
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            )}
          >
            {/* 原因：Streamdown 在流式传输过程中能优雅地处理不完整的 Markdown，
                而 react-markdown 在接收到部分 token 时会闪烁 */}
            <div className="prose prose-sm dark:prose-invert max-w-none break-words">
              <Streamdown
                plugins={{ code }}
                shikiTheme={["github-light", "github-dark"]}
                controls={{ code: { copy: true, download: false } }}
              >
                {content}
              </Streamdown>
            </div>
          </div>
          {formattedTime && (
            <p
              className={cn(
                "mt-1 text-xs",
                isUser ? "text-right text-muted-foreground" : "text-muted-foreground"
              )}
            >
              {formattedTime}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
