"use client";

import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

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

/**
 * T038: Debug 面板组件
 * - 使用 Collapsible 实现展开/折叠
 * - 展示摘要内容、Token 分布、最近更新时间
 * - conversationId 或 refreshKey 变化时重新请求数据
 */
// Why: Next.js replaces process.env.NODE_ENV at build time, so in production
// builds the entire component body becomes dead code that gets tree-shaken
const IS_PRODUCTION = process.env.NODE_ENV === "production";

export function DebugPanel({ conversationId, refreshKey }: DebugPanelProps) {
  // Why: default to expanded in development for convenience;
  // in production we return null below but hooks must be called unconditionally
  const [open, setOpen] = useState(!IS_PRODUCTION);
  const [data, setData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Why: skip fetching in production (panel is hidden) or when closed
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

  // Why: hide the debug panel entirely in production to avoid exposing
  // internal token counts and memory data to end users
  if (IS_PRODUCTION) {
    return null;
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="border-t px-4 py-1">
        <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
          {open ? "▾" : "▸"} Debug 面板
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="py-2 space-y-2 text-xs text-muted-foreground">
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

                {/* 摘要内容 */}
                <div>
                  <span className="font-medium text-foreground">摘要：</span>
                  <p className="mt-0.5 whitespace-pre-wrap">
                    {data.summary?.content ?? "暂无摘要"}
                  </p>
                </div>

                {/* 最近更新 */}
                <div>
                  <span className="font-medium text-foreground">最近更新：</span>
                  <span className="font-mono">
                    {data.summary?.updatedAt ?? "—"}
                  </span>
                </div>

                {/* 检索记忆 */}
                <div>
                  <span className="font-medium text-foreground">检索记忆：</span>
                  {data.memories && data.memories.length > 0 ? (
                    <ul className="mt-0.5 space-y-0.5">
                      {data.memories.map((mem, i) => {
                        // Why: parse optional [hot-path] or [background] tag
                        // prepended by extractMemories to show extraction source
                        const sourceMatch = mem.content.match(
                          /^\[(hot-path|background)\]\s*/
                        );
                        const source = sourceMatch?.[1];
                        const cleanContent = sourceMatch
                          ? mem.content.slice(sourceMatch[0].length)
                          : mem.content;

                        return (
                          <li key={i} className="font-mono">
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
                            {cleanContent}{" "}
                            <span className="text-muted-foreground">
                              ({mem.category})
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-0.5">未检索到相关记忆</p>
                  )}
                </div>

                {/* 检索文档 */}
                <div>
                  <span className="font-medium text-foreground">检索文档：</span>
                  {data.ragChunks && data.ragChunks.length > 0 ? (
                    <ul className="mt-0.5 space-y-0.5">
                      {data.ragChunks.map((chunk, i) => (
                        <li key={i} className="font-mono">
                          [{chunk.similarity.toFixed(3)}]{" "}
                          <span className="text-muted-foreground">
                            [来源: {chunk.filename}]
                          </span>{" "}
                          {chunk.content.length > 100
                            ? chunk.content.slice(0, 100) + "..."
                            : chunk.content}
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
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
