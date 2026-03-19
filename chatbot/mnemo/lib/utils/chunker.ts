import { estimateTokens } from "@/lib/utils/tokens";
import {
  CHUNK_MIN_TOKENS,
  CHUNK_MAX_TOKENS,
  CHUNK_OVERLAP_TOKENS,
} from "@/lib/constants";

interface Chunk {
  content: string;
  tokenCount: number;
}

/**
 * 将文档文本拆分为适合嵌入的重叠分块。
 *
 * 策略：
 * 1. 按双换行符拆分以获取自然段落
 * 2. 合并小段落直到达到约 CHUNK_MIN_TOKENS
 * 3. 在句子边界处拆分超大段落
 * 4. 通过前置上一分块的尾部创建重叠窗口
 */
export function chunkDocument(text: string): Chunk[] {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);

  // 原因：第一遍将小段落合并为合理大小的片段
  const mergedSegments = mergeParagraphs(paragraphs);

  // 原因：第二遍拆分任何超出最大 token 限制的片段
  const splitSegments = mergedSegments.flatMap((segment) => {
    const tokens = estimateTokens(segment);
    if (tokens > CHUNK_MAX_TOKENS) {
      return splitAtSentenceBoundaries(segment);
    }
    return [segment];
  });

  // 原因：第三遍从上一分块添加重叠内容，以免在检索时丢失分块边界处的信息
  const chunks: Chunk[] = [];
  for (let i = 0; i < splitSegments.length; i++) {
    let content = splitSegments[i];

    if (i > 0) {
      const prevText = splitSegments[i - 1];
      const overlapText = extractTailTokens(prevText, CHUNK_OVERLAP_TOKENS);
      if (overlapText) {
        content = overlapText + "\n" + content;
      }
    }

    chunks.push({
      content,
      tokenCount: estimateTokens(content),
    });
  }

  return chunks;
}

/** 合并连续的小段落，直到达到最小 token 阈值。 */
function mergeParagraphs(paragraphs: string[]): string[] {
  const segments: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if (!current) {
      current = para;
      continue;
    }

    const combined = current + "\n\n" + para;
    if (estimateTokens(combined) <= CHUNK_MIN_TOKENS) {
      current = combined;
    } else {
      segments.push(current);
      current = para;
    }
  }

  if (current) {
    segments.push(current);
  }

  return segments;
}

/** 在句子边界处拆分大文本块（中文和英文）。 */
function splitAtSentenceBoundaries(text: string): string[] {
  // 原因：匹配中文和英文的句末标点符号
  const sentences = text.split(/(?<=[。！？.!?])\s*/);
  const segments: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (!sentence.trim()) continue;

    const combined = current ? current + " " + sentence : sentence;
    if (estimateTokens(combined) > CHUNK_MAX_TOKENS && current) {
      segments.push(current);
      current = sentence;
    } else {
      current = combined;
    }
  }

  if (current) {
    segments.push(current);
  }

  return segments;
}

/**
 * 从字符串中提取大约最后 N 个 token 的文本。
 * 原因：用于在相邻分块之间创建重叠窗口。
 */
function extractTailTokens(text: string, targetTokens: number): string {
  // 原因：从后向前遍历单词以近似目标 token 数量
  const words = text.split(/\s+/);
  let tail = "";

  for (let i = words.length - 1; i >= 0; i--) {
    const candidate = words[i] + (tail ? " " + tail : "");
    if (estimateTokens(candidate) > targetTokens) break;
    tail = candidate;
  }

  return tail;
}
