import { NextResponse } from "next/server";
import { streamText, type ModelMessage } from "ai";
import { chatModel } from "@/lib/ai";
import { z } from "zod";
import { retrieveRelevantChunks } from "@/lib/rag/retriever";
import { buildSystemPrompt } from "@/lib/rag/prompt";
import { createConversation, getConversationById } from "@/db/queries/conversations";
import { addMessage } from "@/db/queries/messages";
import type { SourceCitation } from "@/types";

export const dynamic = "force-dynamic";

const messageSchema = z.object({
  role: z.string(),
  content: z.string().optional(),
  parts: z
    .array(
      z.object({
        type: z.string(),
        text: z.string().optional(),
      })
    )
    .optional(),
});

const chatRequestSchema = z.object({
  messages: z.array(messageSchema).min(1, "Messages array must not be empty"),
  conversationId: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Messages array is required and must not be empty" },
      { status: 400 }
    );
  }

  const { messages, conversationId: requestedConversationId } = parsed.data;

  function getMessageText(msg: z.infer<typeof messageSchema>): string {
    if (msg.content) return msg.content;
    if (msg.parts) {
      return msg.parts
        .filter((p) => p.type === "text" && p.text)
        .map((p) => p.text!)
        .join("");
    }
    return "";
  }

  const userMessages = messages.filter((m) => m.role === "user");
  if (userMessages.length === 0) {
    return NextResponse.json(
      { error: "Messages array is required and must not be empty" },
      { status: 400 }
    );
  }

  const latestUserMessage = getMessageText(
    userMessages[userMessages.length - 1]
  );

  // Resolve or create conversation
  let conversationId: string;
  if (requestedConversationId) {
    const existing = await getConversationById(requestedConversationId);
    if (existing) {
      conversationId = existing.id;
    } else {
      const created = await createConversation(
        latestUserMessage.slice(0, 50)
      );
      conversationId = created.id;
    }
  } else {
    const created = await createConversation(latestUserMessage.slice(0, 50));
    conversationId = created.id;
  }

  // Retrieve relevant chunks
  const chunks = await retrieveRelevantChunks(latestUserMessage);

  // Build system prompt
  const systemPrompt = buildSystemPrompt(chunks);

  // Extract deduplicated source citations
  const sourcesMap = new Map<string, SourceCitation>();
  for (const chunk of chunks) {
    const key = `${chunk.documentFilename}:${chunk.metadata.page}:${chunk.metadata.section ?? ""}`;
    if (!sourcesMap.has(key)) {
      sourcesMap.set(key, {
        filename: chunk.documentFilename,
        page: chunk.metadata.page,
        section: chunk.metadata.section,
      });
    }
  }
  const sources: SourceCitation[] = [...sourcesMap.values()];

  // Convert messages to ModelMessage format
  const modelMessages = messages.map((m) => ({
    role: m.role,
    content: getMessageText(m),
  }));

  // Stream response
  const result = streamText({
    model: chatModel,
    system: systemPrompt,
    messages: modelMessages as ModelMessage[],
    async onFinish({ text }) {
      // Persist user message
      await addMessage(conversationId, "user", latestUserMessage);
      // Persist AI response with source citations
      await addMessage(
        conversationId,
        "assistant",
        text,
        sources.length > 0 ? sources : null
      );
    },
  });

  return result.toUIMessageStreamResponse();
}
