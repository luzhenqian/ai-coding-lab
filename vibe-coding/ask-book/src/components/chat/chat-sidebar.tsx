"use client";

import { useState, useRef, useEffect } from "react";
import type { Conversation } from "@/types";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onClose?: () => void;
  onOpenKnowledge: () => void;
  onDelete?: (id: string) => void;
  onRename?: (id: string, title: string) => void;
}

export function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onClose,
  onOpenKnowledge,
  onDelete,
  onRename,
}: ChatSidebarProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    }
    if (menuOpenId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpenId]);

  function handleDelete(id: string) {
    setMenuOpenId(null);
    const confirmed = window.confirm("确定要删除这个会话吗？删除后无法恢复。");
    if (confirmed) {
      onDelete?.(id);
    }
  }

  function handleStartRename(id: string, currentTitle: string) {
    setMenuOpenId(null);
    setRenamingId(id);
    setRenameValue(currentTitle || "");
  }

  function handleSaveRename(id: string) {
    const trimmed = renameValue.trim();
    setRenamingId(null);
    if (trimmed && trimmed.length <= 100) {
      onRename?.(id, trimmed);
    }
  }

  function handleCancelRename() {
    setRenamingId(null);
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-700">会话列表</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={onNew}
            className="rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
          >
            新建会话
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 lg:hidden"
              aria-label="关闭侧边栏"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-gray-400">
            暂无会话记录
          </p>
        ) : (
          <ul className="py-1">
            {conversations.map((conv) => (
              <li key={conv.id} className="group relative">
                {renamingId === conv.id ? (
                  <div className="px-3 py-1.5">
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveRename(conv.id);
                        } else if (e.key === "Escape") {
                          handleCancelRename();
                        }
                      }}
                      onBlur={() => handleSaveRename(conv.id)}
                      maxLength={100}
                      className="w-full rounded border border-blue-400 px-2 py-1.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                ) : (
                  <div className="flex items-center">
                    <button
                      onClick={() => {
                        onSelect(conv.id);
                        onClose?.();
                      }}
                      className={`flex-1 truncate px-4 py-2.5 text-left text-sm transition-colors ${
                        activeId === conv.id
                          ? "bg-blue-100 text-blue-800"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {conv.title || "新会话"}
                    </button>
                    {(onDelete || onRename) && (
                      <div className="relative pr-2 opacity-0 group-hover:opacity-100 lg:opacity-0 max-lg:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(menuOpenId === conv.id ? null : conv.id);
                          }}
                          className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                          aria-label="会话操作"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </button>
                        {menuOpenId === conv.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 top-full z-10 mt-1 w-28 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                          >
                            {onRename && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartRename(conv.id, conv.title || "");
                                }}
                                className="flex w-full items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                重命名
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(conv.id);
                                }}
                                className="flex w-full items-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                              >
                                删除
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-gray-200 px-3 py-3">
        <button
          onClick={onOpenKnowledge}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <svg
            className="h-4 w-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          知识库管理
        </button>
      </div>
    </div>
  );
}
