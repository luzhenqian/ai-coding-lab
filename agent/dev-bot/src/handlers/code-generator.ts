import { streamText } from 'ai';
import type { Handler, ConversationContext } from '../types/index.js';
import { CODE_GENERATOR_PROMPT } from '../config/prompts.js';
import { getModel } from '../config/model.js';

export const codeGenerator: Handler = {
  name: 'Code Generator',
  handle(input: string, context?: ConversationContext) {
    const messages = context?.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })) ?? [];

    const result = streamText({
      model: getModel(),
      system: CODE_GENERATOR_PROMPT,
      messages: [...messages, { role: 'user' as const, content: input }],
      temperature: 0.4,
    });

    return {
      stream: result.textStream,
      fullText: result.text,
    };
  },
};
