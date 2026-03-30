import { streamText } from 'ai';
import type { Handler, ConversationContext } from '../types/index.js';
import { CLARIFIER_PROMPT } from '../config/prompts.js';
import { getModel } from '../config/model.js';

export const clarifier: Handler = {
  name: 'Clarifier',
  handle(input: string, context?: ConversationContext) {
    const messages = context?.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })) ?? [];

    const result = streamText({
      model: getModel(),
      system: CLARIFIER_PROMPT,
      messages: [...messages, { role: 'user' as const, content: input }],
      temperature: 0.2,
    });

    return {
      stream: result.textStream,
      fullText: result.text,
    };
  },
};
