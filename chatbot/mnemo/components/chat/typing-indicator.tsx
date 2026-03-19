"use client";

import { Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/**
 * 输入指示器：等待 AI 回复时显示的三点跳动动画。
 * 样式与助手消息气泡一致，带头像。
 */
export function TypingIndicator() {
  return (
    <div className="flex w-full justify-start animate-in fade-in animation-duration-200">
      <div className="flex items-end gap-2">
        <Avatar size="sm">
          <AvatarFallback>
            <Bot className="size-3.5" />
          </AvatarFallback>
        </Avatar>
        <div className="rounded-2xl bg-muted px-4 py-3">
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1.5 rounded-full bg-muted-foreground"
                style={{
                  animation: "typing-bounce 1s ease-in-out infinite",
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
