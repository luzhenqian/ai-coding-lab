"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { SendHorizonal } from "lucide-react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
}

/**
 * 聊天输入框组件
 * - 多行 Textarea，自动调整高度
 * - Enter 发送，Shift+Enter 换行
 * - 发送后清空并重置高度
 * - 加载中禁用输入和按钮
 */
export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setValue("");
    resetHeight();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 发送消息，Shift+Enter 换行
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t bg-background p-4">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入消息..."
        disabled={isLoading}
        rows={1}
        className="min-h-[40px] max-h-[200px] flex-1 resize-none"
      />
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !value.trim()}
              size="icon"
              className="shrink-0"
              aria-label="发送消息"
            />
          }
        >
          <SendHorizonal className="size-4" />
        </TooltipTrigger>
        <TooltipContent>发送</TooltipContent>
      </Tooltip>
    </div>
  );
}
