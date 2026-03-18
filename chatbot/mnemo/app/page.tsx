"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/sidebar/sidebar";
import { ChatPanel } from "@/components/chat/chat-panel";

interface Conversation {
  id: string;
  title: string | null;
  updatedAt: string;
}

/**
 * T028: 主页面
 * - 管理对话列表和选中状态
 * - 左侧 Sidebar + 右侧 ChatPanel 的 flex 布局
 */
export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  // 获取对话列表
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("获取对话列表失败:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // 初始加载对话列表
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 新建对话
  const handleNewConversation = async () => {
    try {
      const res = await fetch("/api/conversations", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSelectedConversationId(data.id);
        await fetchConversations();
      }
    } catch (error) {
      console.error("创建对话失败:", error);
    }
  };

  // 删除对话
  const handleDeleteConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (res.ok) {
        // 如果删除的是当前选中的对话，取消选中
        if (selectedConversationId === id) {
          setSelectedConversationId(null);
        }
        await fetchConversations();
      }
    } catch (error) {
      console.error("删除对话失败:", error);
    }
  };

  // 选择对话
  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
  };

  return (
    <div className="relative flex h-full">
      <Sidebar
        conversations={conversations}
        selectedId={selectedConversationId}
        isLoading={isLoadingConversations}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
      />
      <ChatPanel
        conversationId={selectedConversationId}
        onConversationCreated={(id) => {
          setSelectedConversationId(id);
          fetchConversations();
        }}
      />
    </div>
  );
}
