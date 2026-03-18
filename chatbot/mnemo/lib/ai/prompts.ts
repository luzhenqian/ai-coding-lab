// ============================================================
// All prompt templates are centralized here for easy review
// and modification. This supports the Teaching First principle
// by making prompt engineering transparent.
// ============================================================

export const SYSTEM_PROMPT = `你是 Mnemo，一个友好且有帮助的 AI 助手。
你的回复应该简洁、准确、有用。
使用 Markdown 格式来组织你的回复（代码块、列表等）。
请用中文回复用户。

当你使用"参考知识"中的内容回答问题时，请在回复中注明来源文件名，例如"根据《filename》..."。
如果参考知识与问题无关，请忽略它，不要强行引用。`;

/**
 * Prompt for progressive conversation summarization.
 * Why: when a conversation exceeds the sliding window, we distill
 * older messages into a compact summary that preserves key facts
 * while staying within a strict token budget.
 */
export const SUMMARY_PROMPT = `你是一个对话摘要助手。请根据以下内容生成一份简洁的对话摘要。

要求：
- 保留关键事实、决策和用户偏好
- 丢弃寒暄、重复内容和无关紧要的闲聊
- 摘要必须控制在 500 tokens 以内
- 使用简洁的要点式格式
- 用中文撰写

{existingSummary}

以下是需要总结的新对话内容：
{newMessages}

请输出更新后的摘要：`;

/**
 * Prompt for auto-generating a conversation title.
 * Why: we generate the title from the first user+assistant exchange
 * to produce a meaningful, concise title.
 */
export const TITLE_GENERATION_PROMPT = `根据以下对话的第一轮交互，生成一个简短的对话标题。
要求：
- 最多 10 个中文字符或 30 个英文字符
- 概括对话的核心主题
- 不要使用引号或标点符号
- 只输出标题文本，不要其他内容

用户消息：{userMessage}
AI 回复：{assistantMessage}`;

/**
 * Prompt for extracting long-term user memories from conversations.
 * Why: we periodically scan recent messages to identify facts about
 * the user that are worth remembering across sessions — preferences,
 * personal facts, and behavioral patterns.
 */
export const MEMORY_EXTRACTION_PROMPT = `你是一个记忆提取助手。请分析以下对话内容，从中提取关于用户的重要长期记忆。

已有的用户记忆：
{existingMemories}

最近的对话内容：
{recentMessages}

请提取值得长期记住的用户信息。注意：
- 只提取真正有用的长期事实，不要提取对话中的临时性内容
- 类别说明：preference（偏好）、fact（事实）、behavior（行为习惯）
- 如果某条新信息与已有记忆重复或是其更新版本，请使用 UPDATE 操作并提供 updateTargetId
- 如果是全新的信息，使用 ADD 操作
- 不要编造信息，只提取对话中明确提到的内容
- 如果没有值得提取的信息，返回空数组`;

/**
 * Prompt for judging whether a single user message contains
 * information worth remembering long-term.
 * Why: replaces the old hardcoded keyword list with an LLM-based
 * check so we can catch implicit personal facts that no keyword
 * list could cover (e.g., "周末我一般都在写代码").
 */
export const MEMORY_WORTHINESS_PROMPT = `判断以下用户消息是否包含值得长期记住的个人信息。

值得记忆的例子：个人身份、职业、偏好、习惯、家庭情况、使用的工具、所在城市等。
不值得记忆的例子：闲聊、提问、请求帮助、天气、打招呼等。

用户消息：
{userMessage}

请判断这条消息是否包含值得长期记忆的用户信息。`;
