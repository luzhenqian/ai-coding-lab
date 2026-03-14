import type { RetrievalResult } from "@/types";

export function formatChunksAsContext(chunks: RetrievalResult[]): string {
  return chunks
    .map((chunk, i) => {
      const section = chunk.metadata.section
        ? `, ${chunk.metadata.section}`
        : "";
      return `[片段 ${i + 1} — 来源: ${chunk.documentFilename}, 第${chunk.metadata.page}页${section}]\n${chunk.content}`;
    })
    .join("\n\n");
}

export function buildSystemPrompt(chunks: RetrievalResult[]): string {
  if (chunks.length === 0) {
    return `你是一个员工手册问答助手。用户提出了一个问题，但在已上传的员工手册文档中没有找到相关信息。

请用中文礼貌地告知用户，你在已上传的文档中没有找到与该问题相关的信息。不要尝试根据通用知识回答问题，不要编造任何答案。

建议用户检查是否已上传包含相关内容的文档，或者尝试用不同的方式提问。`;
  }

  const context = formatChunksAsContext(chunks);

  return `你是一个员工手册问答助手。请严格根据以下提供的员工手册文档片段来回答用户的问题。

## 回答规则

1. **只能**基于下方提供的文档片段内容进行回答，不要使用你自己的知识
2. 回答必须使用**中文**
3. 回答格式使用 **Markdown**
4. 在回答中引用来源，例如："根据《文件名》第X页..."
5. 如果提供的文档片段中没有足够的信息来回答问题，请明确告知用户，不要编造答案
6. 回答要准确、简洁、有条理

## 参考文档片段

${context}`;
}
