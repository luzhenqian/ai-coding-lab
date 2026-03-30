import { streamText } from 'ai';
import type { Handler, ConversationContext } from '../types/index.js';
import { BUG_DETECTIVE_PROMPT } from '../config/prompts.js';
import { getModel } from '../config/model.js';

export const bugDetective: Handler = {
  name: 'Bug Detective',
  handle(input: string, context?: ConversationContext) {
    const messages = context?.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })) ?? [];

    const result = streamText({
      model: getModel(),
      system: BUG_DETECTIVE_PROMPT,
      messages: [...messages, { role: 'user' as const, content: input }],
      temperature: 0.1,
    });

    return {
      stream: result.textStream,
      fullText: result.text,
    };
  },
};
