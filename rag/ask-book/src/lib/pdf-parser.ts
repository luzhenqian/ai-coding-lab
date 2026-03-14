import { PDFParse } from "pdf-parse";
import type { ParsedPage } from "@/types";

export async function parsePdf(
  buffer: Buffer
): Promise<{ pages: ParsedPage[] }> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });

  const result = await parser.getText();

  if (!result.text || result.text.trim().length === 0) {
    await parser.destroy();
    throw new Error(
      "No text content found — PDF may be image-only or corrupted"
    );
  }

  const pages: ParsedPage[] = [];

  for (const page of result.pages) {
    // Remove null bytes (PostgreSQL rejects \x00 in text columns) and
    // other non-printable control characters common in PDF extraction,
    // while preserving newlines (\x0A), carriage returns (\x0D), and tabs (\x09).
    const text = page.text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
    if (text.length > 0) {
      pages.push({ pageNumber: page.num, text });
    }
  }

  await parser.destroy();

  if (pages.length === 0) {
    throw new Error(
      "No text content found — PDF may be image-only or corrupted"
    );
  }

  return { pages };
}
