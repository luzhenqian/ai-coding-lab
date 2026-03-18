import { extractText as extractPdfText } from "unpdf";
import mammoth from "mammoth";
import WordExtractor from "word-extractor";

/**
 * Extract plain text from an uploaded file based on its extension.
 *
 * Why: PDF, DOC, and DOCX are binary formats that cannot be read with
 * file.text(). Each format needs a dedicated library to parse the binary
 * content and return plain text for the downstream chunking + embedding
 * pipeline.
 */
export async function extractText(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "txt" || ext === "md") {
    return file.text();
  }

  // Why: binary formats need an ArrayBuffer, not a text stream
  const buffer = Buffer.from(await file.arrayBuffer());

  if (ext === "pdf") {
    return extractFromPdf(buffer);
  }

  if (ext === "docx") {
    return extractFromDocx(buffer);
  }

  if (ext === "doc") {
    return extractFromDoc(buffer);
  }

  throw new Error("不支持的文件格式");
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  try {
    const { text } = await extractPdfText(new Uint8Array(buffer), {
      mergePages: true,
    });
    return text;
  } catch (err) {
    console.error("[text-extractor] PDF extraction failed:", err);
    throw new Error("PDF 文本提取失败，文件可能已损坏或受密码保护");
  }
}

async function extractFromDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (err) {
    console.error("[text-extractor] DOCX extraction failed:", err);
    throw new Error("DOCX 文本提取失败，文件可能已损坏");
  }
}

async function extractFromDoc(buffer: Buffer): Promise<string> {
  try {
    const extractor = new WordExtractor();
    const doc = await extractor.extract(buffer);
    return doc.getBody();
  } catch (err) {
    console.error("[text-extractor] DOC extraction failed:", err);
    throw new Error("DOC 文本提取失败，文件可能已损坏");
  }
}
