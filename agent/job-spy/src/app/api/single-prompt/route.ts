import { streamObject } from 'ai'
import { getModel } from '@/lib/model'
import { combinedAnalysisSchema } from '@/lib/schemas'
import { SINGLE_PROMPT_SYSTEM, SINGLE_PROMPT_USER } from '@/lib/prompts'

export async function POST(request: Request) {
  const { rawJD, resume } = await request.json() as { rawJD: string; resume: string }

  const result = streamObject({
    model: getModel(),
    schema: combinedAnalysisSchema,
    system: SINGLE_PROMPT_SYSTEM,
    prompt: SINGLE_PROMPT_USER(rawJD, resume),
  })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      for await (const partial of result.partialObjectStream) {
        controller.enqueue(encoder.encode(JSON.stringify(partial) + '\n'))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson' },
  })
}
