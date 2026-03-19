"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { UIMessage } from "ai";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { DebugPanel } from "@/components/chat/debug-panel";

interface ChatPanelProps {
  conversationId: string | null;
  onConversationCreated?: (id: string) => void;
}

function extractContent(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function toFlatMessages(
  messages: UIMessage[]
): Array<{ id: string; role: string; content: string }> {
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: extractContent(msg),
  }));
}

/**
 * 原因：我们完全绕过 useChat，直接调用 API。
 * useChat 的 transport 在创建时缓存 conversationId，
 * 因此无法在自动创建对话后立即发送消息，除非完全重新挂载。
 * 使用直接 fetch + 流式传输让我们完全控制请求体。
 */
export function ChatPanel({ conversationId, onConversationCreated }: ChatPanelProps) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [debugRefreshKey, setDebugRefreshKey] = useState(0);

  // 原因：ref 追踪最新的 conversationId 而不触发重新渲染，
  // 使得 send 函数始终读取当前值
  const conversationIdRef = useRef(conversationId);
  conversationIdRef.current = conversationId;

  // 当 conversationId 变化时加载已有消息
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `/api/conversations/${conversationId}/messages`
        );
        if (res.ok) {
          const data = await res.json();
          const uiMessages: UIMessage[] = data.map(
            (msg: { id: string; role: string; content: string }) => ({
              id: msg.id,
              role: msg.role as UIMessage["role"],
              parts: [{ type: "text" as const, text: msg.content }],
            })
          );
          setMessages(uiMessages);
        }
      } catch (error) {
        console.error("获取消息失败:", error);
      }
    };

    fetchMessages();
  }, [conversationId]);

  const handleSubmit = useCallback(async (text: string) => {
    let activeId = conversationIdRef.current;

    // 原因：在第一条消息时自动创建对话，
    // 这样用户无需先点击"新建对话"即可开始聊天
    if (!activeId) {
      try {
        const res = await fetch("/api/conversations", { method: "POST" });
        if (!res.ok) return;
        const data = await res.json();
        activeId = data.id;
        conversationIdRef.current = activeId;
        onConversationCreated?.(data.id);
      } catch (error) {
        console.error("自动创建对话失败:", error);
        return;
      }
    }

    // 乐观地将用户消息添加到 UI
    const userMsg: UIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text }],
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setIsWaiting(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeId,
          messages: [{ role: "user", content: text }],
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "请求失败" }));
        console.error("聊天请求失败:", err);
        setIsLoading(false);
        setIsWaiting(false);
        return;
      }

      // 原因：读取纯文本流并逐步更新助手消息，
      // 使用户能实时看到 token 的到达
      const assistantMsg: UIMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        parts: [{ type: "text", text: "" }],
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsWaiting(false);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 原因：toTextStreamResponse 发送原始文本块，
        // 无需协议解析
        fullText += decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant") {
            updated[updated.length - 1] = {
              ...last,
              parts: [{ type: "text", text: fullText }],
            };
          }
          return updated;
        });
      }
    } catch (error) {
      console.error("聊天流读取失败:", error);
    } finally {
      setIsLoading(false);
      setDebugRefreshKey((prev) => prev + 1);
    }
  }, [onConversationCreated]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <MessageList
        messages={toFlatMessages(messages)}
        isWaiting={isWaiting}
        onSuggestionClick={handleSubmit}
      />
      <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
      <DebugPanel conversationId={conversationId} refreshKey={debugRefreshKey} />
    </div>
  );
}
