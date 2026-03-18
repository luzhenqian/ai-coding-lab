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
 * Why: we bypass useChat entirely and call the API directly.
 * useChat's transport caches conversationId at creation time,
 * so auto-creating a conversation then immediately sending a
 * message is impossible without a full re-mount. Direct fetch
 * with streaming gives us full control over the request body.
 */
export function ChatPanel({ conversationId, onConversationCreated }: ChatPanelProps) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [debugRefreshKey, setDebugRefreshKey] = useState(0);

  // Why: ref tracks the latest conversationId without triggering re-renders,
  // so the send function always reads the current value
  const conversationIdRef = useRef(conversationId);
  conversationIdRef.current = conversationId;

  // Load existing messages when conversationId changes
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

    // Why: auto-create conversation on first message so users
    // don't need to click "new conversation" before chatting
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

    // Optimistically add the user message to the UI
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

      // Why: read the plain text stream and progressively update the
      // assistant message so the user sees tokens arrive in real time
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

        // Why: toTextStreamResponse sends raw text chunks,
        // no protocol parsing needed
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
