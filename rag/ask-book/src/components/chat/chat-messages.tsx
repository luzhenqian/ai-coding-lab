"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { MessageBubble } from "./message-bubble";
import type { SourceCitation } from "@/types";

interface ChatMessagesProps {
  messages: UIMessage[];
  status: string;
  sourcesMap: Record<string, SourceCitation[]>;
}

function getTextContent(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function ChatMessages({
  messages,
  status,
  sourcesMap,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-4">
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1;
          const isStreamingThis =
            message.role === "assistant" &&
            isLast &&
            status === "streaming";

          return (
            <MessageBubble
              key={message.id}
              role={message.role as "user" | "assistant"}
              content={getTextContent(message)}
              isStreaming={isStreamingThis}
              sources={sourcesMap[message.id]}
            />
          );
        })}

        {status === "submitted" && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
