/**
 * 使用基于字符的启发式方法估算字符串的 token 数量。
 *
 * 原因：我们使用简单估算代替 tiktoken，以避免添加 4MB 的 WASM 依赖。
 * 估算精度在 ~10-20% 以内，对于教学项目的 token 预算控制已经足够。
 *
 * 规则：
 * - 英文 / ASCII 字符：约每 4 个字符 1 个 token
 * - 中文 / CJK 字符：约每 1.5 个字符 1 个 token
 * - 混合文本：基于字符类型检测的加权平均
 */
export function estimateTokens(text: string): number {
  let cjkChars = 0;
  let otherChars = 0;

  for (const char of text) {
    const code = char.codePointAt(0)!;
    // 原因：CJK 统一表意文字范围覆盖大多数中文字符。
    // 我们还包括 CJK 扩展 A 和常见标点范围。
    if (
      (code >= 0x4e00 && code <= 0x9fff) || // CJK 统一表意文字
      (code >= 0x3400 && code <= 0x4dbf) || // CJK 扩展 A
      (code >= 0x3000 && code <= 0x303f) || // CJK 标点符号
      (code >= 0xff00 && code <= 0xffef) // 全角字符
    ) {
      cjkChars++;
    } else {
      otherChars++;
    }
  }

  // 原因：对每种文字类型使用不同的比率，然后求和
  const cjkTokens = cjkChars / 1.5;
  const otherTokens = otherChars / 4;

  return Math.ceil(cjkTokens + otherTokens);
}
