import { encode } from "gpt-tokenizer";
import type { ParsedPage, ChunkMetadata } from "@/types";

const TARGET_TOKENS = 512;
const MAX_TOKENS = 600;
const OVERLAP_TOKENS = 100;

// Separator hierarchy: coarsest → finest (Microsoft/LangChain CJK pattern)
const SEPARATORS = [
  "\n\n", // paragraph breaks
  "\n", // line breaks
  "。", // Chinese full stop
  "．", // full-width full stop
  ".", // English full stop
  "！", // Chinese exclamation
  "!", // English exclamation
  "？", // Chinese question mark
  "?", // English question mark
  "；", // Chinese semicolon
  ";", // English semicolon
  "，", // Chinese comma
  ",", // English comma
  "、", // Chinese enumeration comma
  " ", // space
  "", // character-level fallback
];

function countTokens(text: string): number {
  if (!text) return 0;
  return encode(text).length;
}

function isHeading(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0 || trimmed.length > 80) return false;
  // Exclude table-like lines
  if (trimmed.includes("|")) return false;

  // Chinese patterns
  if (/^第[一二三四五六七八九十百\d]+[章节条款篇]/.test(trimmed)) return true;
  if (/^[一二三四五六七八九十]+[、.\s]/.test(trimmed)) return true;
  if (/^（[一二三四五六七八九十\d]+）/.test(trimmed)) return true;

  // Numbered sections: "1.1 ", "4.2.3 "
  if (/^\d+(\.\d+)+\s+\S/.test(trimmed)) return true;

  // English patterns
  if (/^(chapter|section|part)\s+\d/i.test(trimmed)) return true;
  if (trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed) && trimmed.length > 2) return true;

  return false;
}

/**
 * Split text at a given separator, keeping the separator attached to the
 * preceding segment (lookbehind behavior).
 */
function splitAtSeparator(text: string, separator: string): string[] {
  if (separator === "") {
    // Character-level fallback
    return Array.from(text);
  }

  const parts: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const idx = remaining.indexOf(separator);
    if (idx === -1) {
      parts.push(remaining);
      break;
    }

    // Keep separator attached to the preceding segment
    const segment = remaining.slice(0, idx + separator.length);
    if (segment.length > 0) {
      parts.push(segment);
    }
    remaining = remaining.slice(idx + separator.length);
  }

  // If remaining is empty string after last separator, ignore it
  return parts.filter((p) => p.length > 0);
}

/**
 * Recursively split text so every piece is under maxTokens.
 * Tries separators from coarsest to finest.
 */
function recursiveSplit(
  text: string,
  maxTokens: number,
  separatorIndex: number = 0
): string[] {
  const trimmed = text.trim();
  if (trimmed.length === 0) return [];

  if (countTokens(trimmed) <= maxTokens) {
    return [trimmed];
  }

  // Try each separator from current index onward
  for (let i = separatorIndex; i < SEPARATORS.length; i++) {
    const separator = SEPARATORS[i];
    const parts = splitAtSeparator(trimmed, separator);

    if (parts.length <= 1) {
      // This separator didn't split anything; try the next one
      continue;
    }

    // Merge adjacent small parts up to maxTokens, then recurse oversized ones
    const result: string[] = [];
    let buffer = "";

    for (const part of parts) {
      const combined = buffer ? buffer + part : part;
      if (countTokens(combined) <= maxTokens) {
        buffer = combined;
      } else {
        // Flush buffer
        if (buffer) {
          result.push(buffer);
        }
        // Check if this single part is still too large
        if (countTokens(part) > maxTokens) {
          // Recurse with finer separators
          result.push(...recursiveSplit(part, maxTokens, i + 1));
        } else {
          buffer = part;
        }
      }
    }

    if (buffer) {
      result.push(buffer);
    }

    if (result.length > 0) {
      return result;
    }
  }

  // Absolute fallback: return as-is (shouldn't happen with character-level split)
  return [trimmed];
}

/**
 * Extract overlap text from the end of a chunk, targeting OVERLAP_TOKENS tokens.
 */
function getOverlapText(text: string, targetTokens: number): string {
  if (countTokens(text) <= targetTokens) return text;
  // Slice characters from the end, measuring tokens to find the right boundary
  let start = Math.max(0, text.length - Math.ceil(targetTokens * 2));
  while (start > 0 && countTokens(text.slice(start)) > targetTokens * 1.5) {
    start += Math.ceil(text.length * 0.05);
  }
  while (start < text.length && countTokens(text.slice(start)) > targetTokens) {
    start++;
  }
  return text.slice(start);
}

interface RawSegment {
  content: string;
  metadata: ChunkMetadata;
}

/**
 * Split pages into raw segments by heading detection,
 * then recursively split oversized segments.
 */
function segmentPages(pages: ParsedPage[]): RawSegment[] {
  const segments: RawSegment[] = [];
  let currentSection: string | null = null;

  for (const page of pages) {
    const lines = page.text.split("\n");
    let buffer = "";

    const flush = () => {
      const text = buffer.trim();
      if (text.length > 0) {
        const pieces = recursiveSplit(text, MAX_TOKENS);
        for (const piece of pieces) {
          segments.push({
            content: piece,
            metadata: { page: page.pageNumber, section: currentSection },
          });
        }
      }
      buffer = "";
    };

    for (const line of lines) {
      if (isHeading(line)) {
        flush();
        currentSection = line.trim();
        continue;
      }
      buffer = buffer ? `${buffer}\n${line}` : line;
    }

    flush();
  }

  return segments;
}

export interface TextChunk {
  content: string;
  metadata: ChunkMetadata;
}

export function chunkText(pages: ParsedPage[]): TextChunk[] {
  if (!pages || pages.length === 0) return [];

  const segments = segmentPages(pages);
  if (segments.length === 0) return [];

  // Merge small segments up to TARGET_TOKENS, then add overlap
  const chunks: TextChunk[] = [];
  let merged = "";
  let mergedMeta: ChunkMetadata = { page: 1, section: null };
  let previousTail = "";

  const flushMerged = () => {
    const text = merged.trim();
    if (text.length === 0) return;

    let content = text;
    if (previousTail && chunks.length > 0) {
      content = `${previousTail}\n${content}`;
    }

    // Safety: if merged + overlap is still over MAX, re-split
    if (countTokens(content) > MAX_TOKENS) {
      const pieces = recursiveSplit(content, MAX_TOKENS);
      for (const piece of pieces) {
        chunks.push({ content: piece, metadata: mergedMeta });
      }
    } else {
      chunks.push({ content, metadata: mergedMeta });
    }

    previousTail = getOverlapText(text, OVERLAP_TOKENS);
    merged = "";
  };

  for (const segment of segments) {
    const combined = merged
      ? `${merged}\n${segment.content}`
      : segment.content;
    const combinedTokens = countTokens(combined);

    if (combinedTokens <= TARGET_TOKENS) {
      if (!merged) {
        mergedMeta = segment.metadata;
      }
      merged = combined;
    } else {
      if (merged) {
        flushMerged();
      }
      merged = segment.content;
      mergedMeta = segment.metadata;

      if (countTokens(merged) > TARGET_TOKENS) {
        flushMerged();
      }
    }
  }

  flushMerged();

  return chunks;
}
