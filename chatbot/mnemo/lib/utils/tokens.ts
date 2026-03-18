/**
 * Estimate token count for a string using character-based heuristics.
 *
 * Why: We use simple estimation instead of tiktoken to avoid adding a 4MB
 * WASM dependency. This is accurate within ~10-20% which is sufficient
 * for token budget enforcement in a teaching project.
 *
 * Rules:
 * - English / ASCII characters: ~4 characters per token
 * - Chinese / CJK characters: ~1.5 characters per token
 * - Mixed text: weighted average based on character type detection
 */
export function estimateTokens(text: string): number {
  let cjkChars = 0;
  let otherChars = 0;

  for (const char of text) {
    const code = char.codePointAt(0)!;
    // Why: CJK Unified Ideographs range covers most Chinese characters.
    // We also include CJK Extension A and common punctuation ranges.
    if (
      (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
      (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
      (code >= 0x3000 && code <= 0x303f) || // CJK Punctuation
      (code >= 0xff00 && code <= 0xffef) // Fullwidth Forms
    ) {
      cjkChars++;
    } else {
      otherChars++;
    }
  }

  // Why: separate ratios for each script type, then sum
  const cjkTokens = cjkChars / 1.5;
  const otherTokens = otherChars / 4;

  return Math.ceil(cjkTokens + otherTokens);
}
