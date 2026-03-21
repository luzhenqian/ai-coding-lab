import { createProviderRegistry } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'

const baseURL = process.env.MODEL_BASE_URL?.trim() || undefined

const openai = createOpenAI({ ...(baseURL ? { baseURL } : {}) })
const anthropic = createAnthropic({ ...(baseURL ? { baseURL } : {}) })

export const registry = createProviderRegistry({
  openai,
  anthropic,
})

export function getModelId(): string {
  const provider = process.env.MODEL_PROVIDER || 'anthropic'
  const model = process.env.MODEL_NAME || 'claude-sonnet-4-5-20250514'
  return `${provider}:${model}`
}

export function getModel() {
  const provider = process.env.MODEL_PROVIDER || 'anthropic'
  const modelName = process.env.MODEL_NAME || 'claude-sonnet-4-5-20250514'

  if (provider === 'openai' && baseURL) {
    return openai.chat(modelName)
  }

  const id = getModelId() as Parameters<typeof registry.languageModel>[0]
  return registry.languageModel(id)
}
