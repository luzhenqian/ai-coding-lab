"use client";

import { Plus, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { groupByDate } from "@/lib/utils/date-groups";

interface Conversation {
  id: string;
  title: string | null;
  updatedAt: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  isLoading?: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

/**
 * 计算相对时间（简化版）
 */
function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${diffHour}小时前`;
  if (diffDay < 30) return `${diffDay}天前`;
  return date.toLocaleDateString("zh-CN");
}

/**
 * 对话列表组件
 * - 按日期分组（今天、昨天、最近7天、更早）
 * - 显示对话标题和相对时间
 * - 高亮选中的对话
 * - 顶部新建对话按钮（带 Tooltip），每项有删除按钮（带确认对话框）
 * - 加载中显示 Skeleton 骨架屏
 */
export function ConversationList({
  conversations,
  selectedId,
  isLoading,
  onSelect,
  onNew,
  onDelete,
}: ConversationListProps) {
  const groups = groupByDate(conversations);

  return (
    <div className="flex flex-col gap-2">
      {/* 新建对话按钮 */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button onClick={onNew} variant="outline" className="w-full justify-start gap-2" />
          }
        >
          <Plus className="size-4" />
          新建对话
        </TooltipTrigger>
        <TooltipContent>新建对话</TooltipContent>
      </Tooltip>

      {/* 加载骨架屏 */}
      {isLoading && (
        <div className="flex flex-col gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-2">
              <Skeleton className="size-4 rounded" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 按日期分组的对话列表 */}
      {!isLoading && (
        <div className="flex flex-col gap-1">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                {group.label}
              </p>
              {group.items.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => onSelect(conversation.id)}
                  className={cn(
                    "group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                    selectedId === conversation.id && "bg-muted"
                  )}
                >
                  <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 truncate">
                    <p className="truncate font-medium">
                      {conversation.title || "新对话"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getRelativeTime(conversation.updatedAt)}
                    </p>
                  </div>
                  {/* 删除按钮，带确认对话框 */}
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="删除对话"
                        />
                      }
                    >
                      <Trash2 className="size-3.5 text-muted-foreground" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确定要删除这个对话吗？</AlertDialogTitle>
                        <AlertDialogDescription>
                          删除后无法恢复，对话中的所有消息将被永久删除。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => onDelete(conversation.id)}
                        >
                          确认删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
