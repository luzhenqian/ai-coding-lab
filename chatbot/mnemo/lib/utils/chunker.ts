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
 * Split document text into overlapping chunks suitable for embedding.
 *
 * Strategy:
 * 1. Split by double newlines to get natural paragraphs
 * 2. Merge small paragraphs until reaching ~CHUNK_MIN_TOKENS
 * 3. Split oversized paragraphs at sentence boundaries
 * 4. Create overlapping windows by prepending tail of previous chunk
 */
export function chunkDocument(text: string): Chunk[] {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);

  // Why: first pass merges tiny paragraphs into reasonably sized segments
  const mergedSegments = mergeParagraphs(paragraphs);

  // Why: second pass splits any segment that exceeds the max token limit
  const splitSegments = mergedSegments.flatMap((segment) => {
    const tokens = estimateTokens(segment);
    if (tokens > CHUNK_MAX_TOKENS) {
      return splitAtSentenceBoundaries(segment);
    }
    return [segment];
  });

  // Why: third pass adds overlap from the previous chunk so that
  // information at chunk boundaries is not lost during retrieval
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

/** Merge consecutive small paragraphs until they reach the minimum token threshold. */
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

/** Split a large text block at sentence boundaries (Chinese and English). */
function splitAtSentenceBoundaries(text: string): string[] {
  // Why: match sentence-ending punctuation in both Chinese and English
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
 * Extract approximately the last N tokens worth of text from a string.
 * Why: used to create overlapping windows between adjacent chunks.
 */
function extractTailTokens(text: string, targetTokens: number): string {
  // Why: work backwards through words to approximate the desired token count
  const words = text.split(/\s+/);
  let tail = "";

  for (let i = words.length - 1; i >= 0; i--) {
    const candidate = words[i] + (tail ? " " + tail : "");
    if (estimateTokens(candidate) > targetTokens) break;
    tail = candidate;
  }

  return tail;
}
