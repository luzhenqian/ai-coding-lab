"use client";

import {
  useState,
  useEffect,
  useCallback,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatWelcome } from "@/components/chat/chat-welcome";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { KnowledgeDrawer } from "@/components/knowledge-drawer";
import type { Conversation, SourceCitation } from "@/types";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sourcesMap, setSourcesMap] = useState<
    Record<string, SourceCitation[]>
  >({});
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);

  const refreshConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data: Conversation[] = await res.json();
        setConversations(data);
      }
    } catch {
      // Silently fail
    }
  }, []);

  const { messages, sendMessage, stop, status, setMessages } = useChat({
    onFinish() {
      refreshConversations();
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/conversations");
        if (res.ok && !cancelled) {
          const data: Conversation[] = await res.json();
          setConversations(data);
        }
      } catch {
        // Silently fail
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isLoading) return;
      setInput("");
      sendMessage(
        { text: trimmed },
        activeConversationId
          ? { body: { conversationId: activeConversationId } }
          : undefined
      );
    },
    [input, isLoading, sendMessage, activeConversationId]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const handleSendExample = useCallback(
    (question: string) => {
      sendMessage(
        { text: question },
        activeConversationId
          ? { body: { conversationId: activeConversationId } }
          : undefined
      );
    },
    [sendMessage, activeConversationId]
  );

  const handleSelectConversation = useCallback(
    async (id: string) => {
      setActiveConversationId(id);
      setSidebarOpen(false);
      setSourcesMap({});

      try {
        const res = await fetch(`/api/conversations/${id}/messages`);
        if (res.ok) {
          const dbMessages: Array<{
            id: string;
            role: string;
            content: string;
            sources: SourceCitation[] | null;
            createdAt: string;
          }> = await res.json();

          const uiMessages: UIMessage[] = dbMessages.map((msg) => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            parts: [{ type: "text" as const, text: msg.content }],
          }));

          const newSources: Record<string, SourceCitation[]> = {};
          for (const msg of dbMessages) {
            if (
              msg.role === "assistant" &&
              msg.sources &&
              msg.sources.length > 0
            ) {
              newSources[msg.id] = msg.sources;
            }
          }

          setMessages(uiMessages);
          setSourcesMap(newSources);
        }
      } catch {
        // Silently fail
      }
    },
    [setMessages]
  );

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/conversations/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          window.alert("删除会话失败，请重试。");
          return;
        }
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConversationId === id) {
          setActiveConversationId(null);
          setMessages([]);
          setSourcesMap({});
          setInput("");
        }
      } catch {
        window.alert("删除会话失败，请重试。");
      }
    },
    [activeConversationId, setMessages]
  );

  const handleRenameConversation = useCallback(
    async (id: string, title: string) => {
      try {
        const res = await fetch(`/api/conversations/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        if (!res.ok) {
          window.alert("重命名失败，请重试。");
          return;
        }
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title } : c))
        );
      } catch {
        window.alert("重命名失败，请重试。");
      }
    },
    []
  );

  const handleNewConversation = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setSourcesMap({});
    setInput("");
    setSidebarOpen(false);
  }, [setMessages]);

  return (
    <div className="flex h-dvh">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={handleSelectConversation}
          onNew={handleNewConversation}
          onOpenKnowledge={() => setKnowledgeOpen(true)}
          onDelete={handleDeleteConversation}
          onRename={handleRenameConversation}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50">
            <ChatSidebar
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={handleSelectConversation}
              onNew={handleNewConversation}
              onClose={() => setSidebarOpen(false)}
              onOpenKnowledge={() => {
                setSidebarOpen(false);
                setKnowledgeOpen(true);
              }}
              onDelete={handleDeleteConversation}
              onRename={handleRenameConversation}
            />
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center border-b border-gray-200 px-4 py-2 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
            aria-label="打开侧边栏"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <span className="ml-2 truncate text-sm font-medium text-gray-700">
            {activeConversationId
              ? conversations.find((c) => c.id === activeConversationId)
                  ?.title ?? "会话"
              : "新会话"}
          </span>
        </div>

        {messages.length === 0 && !isLoading ? (
          <ChatWelcome onSendExample={handleSendExample} />
        ) : (
          <ChatMessages
            messages={messages}
            status={status}
            sourcesMap={sourcesMap}
          />
        )}
        <ChatInput
          input={input}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onStop={stop}
          isLoading={isLoading}
        />
      </div>

      {/* Knowledge base drawer */}
      <KnowledgeDrawer
        open={knowledgeOpen}
        onClose={() => setKnowledgeOpen(false)}
      />
    </div>
  );
}
