"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";

interface DebugPanelProps {
  conversationId: string | null;
  refreshKey?: number;
}

interface RetrievedMemory {
  content: string;
  category: string;
  similarity: number;
}

interface RetrievedChunk {
  content: string;
  similarity: number;
  filename: string;
}

// Why: matches the shape returned by GET /api/conversations/[id]/debug
interface DebugData {
  summary: {
    content: string;
    coveredMessageCount: number;
    tokenCount: number;
    updatedAt: string;
  } | null;
  context: {
    totalTokens: number;
    systemPromptTokens: number;
    summaryTokens: number;
    historyTokens: number;
    memoryTokens: number;
    ragTokens?: number;
  };
  memories: RetrievedMemory[];
  ragChunks?: RetrievedChunk[];
}

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const STORAGE_KEY = "debug-panel-height";
const DEFAULT_HEIGHT = 300;
const MIN_HEIGHT = 120;
// Why: max height is computed dynamically as 80% of viewport in the drag handler

function getInitialHeight(): number {
  if (typeof window === "undefined") return DEFAULT_HEIGHT;
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = Number(stored);
    if (!Number.isNaN(parsed) && parsed >= MIN_HEIGHT) return parsed;
  }
  return DEFAULT_HEIGHT;
}

/**
 * Inline markdown renderer for debug panel content.
 * Reuses the same Streamdown + @streamdown/code stack as message-bubble.
 */
function DebugMarkdown({ children }: { children: string }) {
  return (
    <div className="prose prose-xs dark:prose-invert max-w-none break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <Streamdown
        plugins={{ code }}
        shikiTheme={["github-light", "github-dark"]}
        controls={{ code: { copy: true, download: false } }}
      >
        {children}
      </Streamdown>
    </div>
  );
}

const TRUNCATE_LENGTH = 100;

/**
 * Shows truncated text with a clickable "..." to expand full markdown content.
 */
function CollapsibleChunk({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = content.length > TRUNCATE_LENGTH;

  if (!needsTruncation) {
    return <DebugMarkdown>{content}</DebugMarkdown>;
  }

  if (!expanded) {
    return (
      <div>
        <DebugMarkdown>{content.slice(0, TRUNCATE_LENGTH)}</DebugMarkdown>
        <button
          onClick={() => setExpanded(true)}
          className="text-blue-500 hover:text-blue-400 cursor-pointer text-xs mt-0.5"
        >
          ...展开
        </button>
      </div>
    );
  }

  return (
    <div>
      <DebugMarkdown>{content}</DebugMarkdown>
      <button
        onClick={() => setExpanded(false)}
        className="text-blue-500 hover:text-blue-400 cursor-pointer text-xs mt-0.5"
      >
        收起
      </button>
    </div>
  );
}

export function DebugPanel({ conversationId, refreshKey }: DebugPanelProps) {
  const [open, setOpen] = useState(!IS_PRODUCTION);
  const [data, setData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(false);
  const [height, setHeight] = useState(getInitialHeight);

  // Why: refs for drag state to avoid re-renders during pointer move
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  // Persist height to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, String(height));
  }, [height]);

  useEffect(() => {
    if (IS_PRODUCTION || !open || !conversationId) {
      setData(null);
      return;
    }

    const fetchDebug = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/conversations/${conversationId}/debug`
        );
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("获取 debug 信息失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDebug();
  }, [conversationId, open, refreshKey]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      startY.current = e.clientY;
      startHeight.current = height;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [height]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    // Why: dragging up (negative deltaY) should increase height
    const deltaY = startY.current - e.clientY;
    const maxHeight = window.innerHeight * 0.8;
    const newHeight = Math.min(
      maxHeight,
      Math.max(MIN_HEIGHT, startHeight.current + deltaY)
    );
    setHeight(newHeight);
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  if (IS_PRODUCTION) {
    return null;
  }

  return (
    <div className="border-t">
      {/* Toggle trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-4 py-1 text-left text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
      >
        {open ? "▾" : "▸"} Debug 面板
      </button>

      {open && (
        <>
          {/* Resize handle */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="h-1.5 cursor-ns-resize bg-transparent hover:bg-muted-foreground/20 transition-colors border-t border-b border-transparent hover:border-muted-foreground/10"
          />

          {/* Scrollable content area with controlled height */}
          <div
            className="overflow-y-auto px-4 pb-2"
            style={{ height }}
          >
            <div className="space-y-2 text-xs text-muted-foreground">
              {!conversationId && <p>未选择对话</p>}

              {conversationId && loading && <p>加载中…</p>}

              {conversationId && !loading && data && (
                <>
                  {/* Token 分布 */}
                  <div>
                    <span className="font-medium text-foreground">Token 分布：</span>
                    <div className="mt-0.5 grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 font-mono w-fit">
                      <span>总 Token</span>
                      <span className="text-right">{data.context.totalTokens}</span>
                      <span>系统提示词</span>
                      <span className="text-right">{data.context.systemPromptTokens}</span>
                      <span>摘要</span>
                      <span className="text-right">{data.context.summaryTokens}</span>
                      <span>历史消息</span>
                      <span className="text-right">{data.context.historyTokens}</span>
                      <span>记忆</span>
                      <span className="text-right">{data.context.memoryTokens ?? 0}</span>
                      <span>RAG 文档</span>
                      <span className="text-right">{data.context.ragTokens ?? 0}</span>
                    </div>
                  </div>

                  {/* 摘要内容 — markdown rendered */}
                  <div>
                    <span className="font-medium text-foreground">摘要：</span>
                    <div className="mt-0.5">
                      {data.summary?.content ? (
                        <DebugMarkdown>{data.summary.content}</DebugMarkdown>
                      ) : (
                        <p>暂无摘要</p>
                      )}
                    </div>
                  </div>

                  {/* 最近更新 */}
                  <div>
                    <span className="font-medium text-foreground">最近更新：</span>
                    <span className="font-mono">
                      {data.summary?.updatedAt ?? "—"}
                    </span>
                  </div>

                  {/* 检索记忆 — markdown rendered */}
                  <div>
                    <span className="font-medium text-foreground">检索记忆：</span>
                    {data.memories && data.memories.length > 0 ? (
                      <ul className="mt-0.5 space-y-1.5">
                        {data.memories.map((mem, i) => {
                          const sourceMatch = mem.content.match(
                            /^\[(hot-path|background)\]\s*/
                          );
                          const source = sourceMatch?.[1];
                          const cleanContent = sourceMatch
                            ? mem.content.slice(sourceMatch[0].length)
                            : mem.content;

                          return (
                            <li key={i}>
                              <div className="font-mono text-xs">
                                [{mem.similarity.toFixed(3)}]{" "}
                                {source && (
                                  <span
                                    className={
                                      source === "hot-path"
                                        ? "text-orange-500"
                                        : "text-blue-500"
                                    }
                                  >
                                    [{source === "hot-path" ? "实时" : "后台"}]
                                  </span>
                                )}{" "}
                                <span className="text-muted-foreground">
                                  ({mem.category})
                                </span>
                              </div>
                              <div className="mt-0.5 ml-2">
                                <DebugMarkdown>{cleanContent}</DebugMarkdown>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="mt-0.5">未检索到相关记忆</p>
                    )}
                  </div>

                  {/* 检索文档 — markdown rendered */}
                  <div>
                    <span className="font-medium text-foreground">检索文档：</span>
                    {data.ragChunks && data.ragChunks.length > 0 ? (
                      <ul className="mt-0.5 space-y-1.5">
                        {data.ragChunks.map((chunk, i) => (
                          <li key={i}>
                            <div className="font-mono text-xs">
                              [{chunk.similarity.toFixed(3)}]{" "}
                              <span className="text-muted-foreground">
                                [来源: {chunk.filename}]
                              </span>
                            </div>
                            <div className="mt-0.5 ml-2">
                              <CollapsibleChunk content={chunk.content} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-0.5">未检索到相关文档</p>
                    )}
                  </div>
                </>
              )}

              {conversationId && !loading && !data && (
                <p>暂无数据</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
