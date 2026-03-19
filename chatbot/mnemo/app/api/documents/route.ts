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
// 原因：纯文本格式可以在创建文档记录前验证内容是否为空；
// 二进制格式需要先提取文本（在 after() 中完成）
const PLAIN_TEXT_EXTENSIONS = new Set(["txt", "md"]);

/** GET /api/documents — 列出当前用户的所有文档。 */
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
 * POST /api/documents — 上传文档（.txt、.md、.pdf、.doc、.docx）。
 *
 * 原因：我们立即创建文档记录并以 'processing' 状态返回，
 * 然后使用 after() 异步执行分块和嵌入生成，
 * 这样用户无需等待嵌入生成完成。
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

    // 原因：尽早拒绝过大的文件，避免在文本提取和嵌入生成过程中造成内存压力（10 MB 限制）
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

    // 原因：对于纯文本格式，我们可以低成本地在创建数据库记录前验证内容；
    // 二进制格式需要依赖库提取文本，所以我们将其推迟到 after() 中以保持响应速度
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

    // 原因：二进制格式（PDF、DOC、DOCX）— 先创建记录，然后通过 after() 在后台提取文本并处理
    const fileBuffer = await file.arrayBuffer();
    const document = await createDocument({
      userId: DEFAULT_USER_ID,
      filename,
    });

    after(async () => {
      try {
        // 原因：从 buffer 重新构造 File，因为 extractText() 需要带有 .name 属性的 File 对象来分派文件类型
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
