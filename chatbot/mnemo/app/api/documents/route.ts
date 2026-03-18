import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import {
  createDocument,
  listDocumentsByUser,
  updateDocumentStatus,
} from "@/lib/db/queries/documents";
import { processDocument } from "@/lib/ai/document-processor";
import { extractText } from "@/lib/utils/text-extractor";
import { DEFAULT_USER_ID } from "@/lib/constants";

const SUPPORTED_EXTENSIONS = new Set(["txt", "md", "pdf", "doc", "docx"]);
// Why: plain text formats can be validated for empty content before creating
// the document record; binary formats need extraction first (done in after())
const PLAIN_TEXT_EXTENSIONS = new Set(["txt", "md"]);

/** GET /api/documents — list all documents for the current user. */
export async function GET() {
  try {
    const docs = await listDocumentsByUser(DEFAULT_USER_ID);
    return NextResponse.json(docs);
  } catch (err) {
    console.error("[documents/GET] Failed to list documents:", err);
    return NextResponse.json(
      { error: "获取文档列表失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents — upload a document (.txt, .md, .pdf, .doc, .docx).
 *
 * Why: we create the document record immediately and return it
 * in 'processing' state, then use after() to chunk and embed
 * asynchronously so the user doesn't wait for embedding generation.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "请上传一个文件" },
        { status: 400 }
      );
    }

    // Why: reject oversized files early to avoid memory pressure
    // during text extraction and embedding generation (10 MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "文件大小不能超过 10MB" },
        { status: 400 }
      );
    }

    const filename = file.name;
    const ext = filename.split(".").pop()?.toLowerCase();
    if (!ext || !SUPPORTED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "仅支持 .txt、.md、.pdf、.doc 和 .docx 文件" },
        { status: 400 }
      );
    }

    // Why: for plain text formats we can cheaply validate content before
    // creating a DB record; binary formats need library extraction so we
    // defer that to the after() block to keep the response fast
    if (PLAIN_TEXT_EXTENSIONS.has(ext)) {
      const text = await file.text();
      if (!text.trim()) {
        return NextResponse.json(
          { error: "文件内容为空" },
          { status: 400 }
        );
      }

      const document = await createDocument({
        userId: DEFAULT_USER_ID,
        filename,
      });

      after(async () => {
        await processDocument(document.id, text);
      });

      return NextResponse.json(document, { status: 201 });
    }

    // Why: binary formats (PDF, DOC, DOCX) — create record first, then
    // extract text + process in the background via after()
    const fileBuffer = await file.arrayBuffer();
    const document = await createDocument({
      userId: DEFAULT_USER_ID,
      filename,
    });

    after(async () => {
      try {
        // Why: reconstruct a File from the buffer because extractText()
        // expects a File object with a .name property for extension dispatch
        const reconstructed = new File([fileBuffer], filename);
        const text = await extractText(reconstructed);
        if (!text.trim()) {
          await updateDocumentStatus(document.id, "error");
          return;
        }
        await processDocument(document.id, text);
      } catch (err) {
        console.error("[documents/POST] Text extraction failed:", err);
        await updateDocumentStatus(document.id, "error");
      }
    });

    return NextResponse.json(document, { status: 201 });
  } catch (err) {
    console.error("[documents/POST] Failed to upload document:", err);
    return NextResponse.json(
      { error: "文档上传失败" },
      { status: 500 }
    );
  }
}
