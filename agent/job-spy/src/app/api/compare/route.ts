import { streamObject } from 'ai'
import { getModel } from '@/lib/model'
import { comparisonSchema } from '@/lib/schemas'
import { COMPARISON_SYSTEM, COMPARISON_USER } from '@/lib/prompts'

export async function POST(request: Request) {
  const { chainOutputs, singleOutputs, rawJD, resume } = await request.json() as {
    chainOutputs: string
    singleOutputs: string
    rawJD: string
    resume: string
  }

  const result = streamObject({
    model: getModel(),
    schema: comparisonSchema,
    system: COMPARISON_SYSTEM,
    prompt: COMPARISON_USER(chainOutputs, singleOutputs, rawJD, resume),
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
