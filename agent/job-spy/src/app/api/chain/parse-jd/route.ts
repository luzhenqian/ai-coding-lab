import { streamObject } from 'ai'
import { getModel } from '@/lib/model'
import { parsedJDSchema } from '@/lib/schemas'
import { JD_PARSER_SYSTEM, JD_PARSER_USER } from '@/lib/prompts'

export async function POST(request: Request) {
  const { rawJD } = await request.json() as { rawJD: string }

  const result = streamObject({
    model: getModel(),
    schema: parsedJDSchema,
    system: JD_PARSER_SYSTEM,
    prompt: JD_PARSER_USER(rawJD),
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
