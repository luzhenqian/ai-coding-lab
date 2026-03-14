/**
 * 日期格式化工具
 *
 * 做什么：提供当前日期的格式化字符串，用于注入到 AI 系统提示词中
 * 为什么：AI 模型不知道当前日期，会把真实日期误判为"未来日期"，
 *        通过在 system prompt 中注入当前日期解决此问题
 */

/**
 * 获取当前日期的格式化字符串
 * 格式：YYYY-MM-DD (时区名称)，例如 "2026-03-14 (Asia/Shanghai)"
 */
export function getCurrentDateString(): string {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return `${dateStr} (${timezone})`
}
