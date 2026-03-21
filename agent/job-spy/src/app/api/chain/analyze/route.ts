import { streamObject } from 'ai'
import { getModel } from '@/lib/model'
import { competitivenessSchema } from '@/lib/schemas'
import { COMPETITIVENESS_SYSTEM, COMPETITIVENESS_USER } from '@/lib/prompts'

export async function POST(request: Request) {
  const { parsedJD, skillMatch } = await request.json()

  const result = streamObject({
    model: getModel(),
    schema: competitivenessSchema,
    system: COMPETITIVENESS_SYSTEM,
    prompt: COMPETITIVENESS_USER(
      JSON.stringify(parsedJD, null, 2),
      JSON.stringify(skillMatch, null, 2),
    ),
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
