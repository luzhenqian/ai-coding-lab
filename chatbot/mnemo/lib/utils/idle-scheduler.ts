import { IDLE_TIMEOUT_MS } from "@/lib/constants";

/**
 * In-memory map of conversation → idle timer.
 * Why: tracks the last activity for each conversation so we can
 * trigger background memory extraction after a period of inactivity.
 * Timers are lost on process restart — acceptable because background
 * extraction is a supplementary mechanism, not a critical path.
 */
const timers = new Map<string, NodeJS.Timeout>();

/**
 * Schedule a background extraction callback to run after the
 * conversation has been idle for IDLE_TIMEOUT_MS.
 *
 * Why: each new message resets the timer so the callback only
 * fires when the user stops chatting. This avoids extracting
 * mid-conversation and wasting LLM calls.
 */
export function scheduleIdleExtraction(
  conversationId: string,
  callback: () => Promise<void>
): void {
  // Why: clear any existing timer so we always measure idle time
  // from the most recent message, not the first one
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
 * Cancel the idle timer for a conversation.
 * Why: useful when a conversation is deleted or the user
 * explicitly navigates away.
 */
export function clearIdleTimer(conversationId: string): void {
  const existing = timers.get(conversationId);
  if (existing) {
    clearTimeout(existing);
    timers.delete(conversationId);
  }
}
