import { streamObject } from 'ai'
import { getModel } from '@/lib/model'
import { skillMatchSchema } from '@/lib/schemas'
import { SKILL_MATCHER_SYSTEM, SKILL_MATCHER_USER } from '@/lib/prompts'

export async function POST(request: Request) {
  const { parsedJD, resume } = await request.json()

  const result = streamObject({
    model: getModel(),
    schema: skillMatchSchema,
    system: SKILL_MATCHER_SYSTEM,
    prompt: SKILL_MATCHER_USER(
      JSON.stringify(parsedJD, null, 2),
      JSON.stringify(resume, null, 2),
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
