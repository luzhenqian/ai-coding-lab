import { IDLE_TIMEOUT_MS } from "@/lib/constants";

/**
 * 对话 → 空闲定时器的内存映射。
 * 原因：跟踪每个对话的最后活动时间，以便在一段时间不活跃后
 * 触发后台记忆提取。进程重启时定时器会丢失——这是可接受的，
 * 因为后台提取是补充机制，不在关键路径上。
 */
const timers = new Map<string, NodeJS.Timeout>();

/**
 * 调度后台提取回调，在对话空闲 IDLE_TIMEOUT_MS 后运行。
 *
 * 原因：每条新消息都会重置定时器，因此回调仅在用户停止聊天时触发。
 * 这避免了在对话进行中提取并浪费 LLM 调用。
 */
export function scheduleIdleExtraction(
  conversationId: string,
  callback: () => Promise<void>
): void {
  // 原因：清除已有的定时器，确保我们始终从最近的消息开始计算空闲时间，而不是从第一条
  const existing = timers.get(conversationId);
  if (existing) {
    clearTimeout(existing);
  }

  const handle = setTimeout(async () => {
    timers.delete(conversationId);
    try {
      await callback();
    } catch (err) {
      console.error(
        `[idle-scheduler] Background extraction failed for ${conversationId}:`,
        err
      );
    }
  }, IDLE_TIMEOUT_MS);

  timers.set(conversationId, handle);
}

/**
 * 取消对话的空闲定时器。
 * 原因：在对话被删除或用户明确离开时使用。
 */
export function clearIdleTimer(conversationId: string): void {
  const existing = timers.get(conversationId);
  if (existing) {
    clearTimeout(existing);
    timers.delete(conversationId);
  }
}
