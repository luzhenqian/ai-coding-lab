/**
 * 多模型提供商配置
 *
 * 做什么：创建 AI 模型注册表，支持通过环境变量在 OpenAI 和 Anthropic 之间切换，
 *        并支持自定义 Base URL（中转站/代理地址）
 * 为什么：教学项目需要展示多模型兼容性，读者可以根据自己拥有的 API Key 选择模型；
 *        中国开发者可能需要通过中转站访问海外 API
 *
 * 注意：AI SDK v5 的 @ai-sdk/openai 默认使用 OpenAI Responses API（/v1/responses），
 *      而大多数中转站和兼容服务（如 DashScope）只支持 Chat Completions API（/v1/chat/completions）。
 *      当配置了 MODEL_BASE_URL 时，自动切换到 Chat Completions 模式。
 */

import { createProviderRegistry } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'

/**
 * 读取中转站地址
 * 通过 MODEL_BASE_URL 环境变量统一配置，同时传给 OpenAI 和 Anthropic provider
 * 未配置时使用各提供商的官方默认地址
 */
const baseURL = process.env.MODEL_BASE_URL?.trim() || undefined

const openai = createOpenAI({ ...(baseURL ? { baseURL } : {}) })
const anthropic = createAnthropic({ ...(baseURL ? { baseURL } : {}) })

/**
 * 模型提供商注册表
 * 注册 OpenAI 和 Anthropic 两个提供商，通过 registry.languageModel('provider:model') 调用
 */
export const registry = createProviderRegistry({
  openai,
  anthropic,
})

/**
 * 获取当前配置的模型 ID
 * 从环境变量 MODEL_PROVIDER 和 MODEL_NAME 组合为 "provider:model" 格式
 * 例如: "openai:gpt-4o" 或 "anthropic:claude-sonnet-4-5"
 */
export function getModelId(): string {
  const provider = process.env.MODEL_PROVIDER || 'openai'
  const model = process.env.MODEL_NAME || 'gpt-4o'
  return `${provider}:${model}`
}

/**
 * 获取当前配置的语言模型实例
 *
 * 当使用 OpenAI provider 且配置了中转站地址时，使用 openai.chat() 创建模型实例，
 * 强制走 Chat Completions API（/v1/chat/completions），因为中转站通常不支持 Responses API。
 * 其他情况通过 registry 正常解析。
 */
export function getModel() {
  const provider = process.env.MODEL_PROVIDER || 'openai'
  const modelName = process.env.MODEL_NAME || 'gpt-4o'

  if (provider === 'openai' && baseURL) {
    return openai.chat(modelName)
  }

  const id = getModelId() as Parameters<typeof registry.languageModel>[0]
  return registry.languageModel(id)
}
