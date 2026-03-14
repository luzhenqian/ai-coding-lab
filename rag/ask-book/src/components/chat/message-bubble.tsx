"use client";

import type { ReactNode } from "react";
import { Streamdown } from "streamdown";
import { SourceCitations } from "./source-citations";
import type { SourceCitation } from "@/types";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  sources?: SourceCitation[];
  children?: ReactNode;
}

export function MessageBubble({
  role,
  content,
  isStreaming,
  sources,
  children,
}: MessageBubbleProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-blue-600 px-4 py-2.5 text-white">
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] space-y-2">
        <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-2.5">
          <div className="prose prose-sm max-w-none">
            <Streamdown mode="streaming" isAnimating={isStreaming}>
              {content}
            </Streamdown>
          </div>
        </div>
        {!isStreaming && sources && sources.length > 0 && (
          <SourceCitations sources={sources} />
        )}
        {children}
      </div>
    </div>
  );
}
