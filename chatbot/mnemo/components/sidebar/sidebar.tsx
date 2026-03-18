"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Brain, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ConversationList } from "@/components/sidebar/conversation-list";

interface Conversation {
  id: string;
  title: string | null;
  updatedAt: string;
}

interface SidebarProps {
  conversations: Conversation[];
  selectedId: string | null;
  isLoading?: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

/**
 * 侧边栏组件
 * - 桌面端：固定左侧面板（w-72，右边框）
 * - 移动端：使用 Sheet 从左侧滑出，带汉堡菜单按钮
 * - 导航链接带 Tooltip
 */
export function Sidebar({
  conversations,
  selectedId,
  isLoading,
  onSelect,
  onNew,
  onDelete,
}: SidebarProps) {
  const [open, setOpen] = useState(false);

  // 选中对话后关闭移动端 Sheet
  const handleSelect = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  const handleNew = () => {
    onNew();
    setOpen(false);
  };

  const navLinks = (
    <nav className="border-t p-3 space-y-1">
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href="/memories"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            />
          }
        >
          <Brain size={16} />
          记忆管理
        </TooltipTrigger>
        <TooltipContent side="right">记忆管理</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href="/documents"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            />
          }
        >
          <FileText size={16} />
          文档管理
        </TooltipTrigger>
        <TooltipContent side="right">文档管理</TooltipContent>
      </Tooltip>
    </nav>
  );

  const listContent = (
    <ConversationList
      conversations={conversations}
      selectedId={selectedId}
      isLoading={isLoading}
      onSelect={handleSelect}
      onNew={handleNew}
      onDelete={onDelete}
    />
  );

  return (
    <>
      {/* 桌面端：固定左侧面板 */}
      <aside className="hidden w-72 shrink-0 flex-col border-r bg-background md:flex">
        <div className="border-b p-4">
          <h1 className="text-lg font-semibold">Mnemo</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-3">{listContent}</div>
        {navLinks}
      </aside>

      {/* 移动端：汉堡菜单 + Sheet */}
      <div className="absolute left-3 top-3 z-40 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <Tooltip>
            <TooltipTrigger
              render={
                <SheetTrigger
                  render={
                    <Button variant="outline" size="icon" aria-label="打开菜单" />
                  }
                />
              }
            >
              <Menu className="size-4" />
            </TooltipTrigger>
            <TooltipContent>菜单</TooltipContent>
          </Tooltip>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b">
              <SheetTitle>Mnemo</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-3">{listContent}</div>
            {navLinks}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
