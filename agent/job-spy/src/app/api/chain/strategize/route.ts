import { streamObject } from 'ai'
import { getModel } from '@/lib/model'
import { strategySchema } from '@/lib/schemas'
import { STRATEGY_SYSTEM, STRATEGY_USER } from '@/lib/prompts'

export async function POST(request: Request) {
  const { parsedJD, skillMatch, competitiveness } = await request.json()

  const result = streamObject({
    model: getModel(),
    schema: strategySchema,
    system: STRATEGY_SYSTEM,
    prompt: STRATEGY_USER(
      JSON.stringify(parsedJD, null, 2),
      JSON.stringify(skillMatch, null, 2),
      JSON.stringify(competitiveness, null, 2),
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
