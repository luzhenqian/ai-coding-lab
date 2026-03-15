import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import { sanitizeSchema } from "@/lib/sanitize";

type MarkdownRendererProps = {
  content: string;
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-lg max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeHighlight,
          [rehypeSanitize, sanitizeSchema],
        ]}
        components={{
          table: ({ children }) => (
            <div className="not-prose my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b-2 border-gray-300 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-gray-200 px-4 py-3 text-gray-700 dark:border-gray-700 dark:text-gray-300">
              {children}
            </td>
          ),
          pre: ({ children }) => (
            <pre className="not-prose my-6 overflow-x-auto rounded-xl border border-gray-800 bg-gray-950 p-5 text-sm leading-relaxed dark:border-gray-700 dark:bg-gray-900">
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = className?.includes("hljs") || className?.includes("language-");
            if (isBlock) {
              return (
                <code className={`${className || ""} font-mono text-gray-100`} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded-md border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[0.875em] font-medium text-pink-600 dark:border-gray-700 dark:bg-gray-800 dark:text-pink-400" {...props}>
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-4 border-blue-500 bg-blue-50/50 py-3 pl-5 pr-4 text-gray-700 dark:bg-blue-950/30 dark:text-gray-300">
              {children}
            </blockquote>
          ),
          h2: ({ children }) => (
            <h2 className="mb-4 mt-12 border-b border-gray-200 pb-3 text-2xl font-bold tracking-tight text-gray-900 dark:border-gray-700 dark:text-white">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-3 mt-8 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mb-2 mt-6 text-lg font-semibold text-gray-900 dark:text-white">
              {children}
            </h4>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 underline decoration-blue-300 underline-offset-2 transition-colors hover:text-blue-800 hover:decoration-blue-500 dark:text-blue-400 dark:decoration-blue-700 dark:hover:text-blue-300"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="my-4 list-disc space-y-1 pl-6 text-gray-700 dark:text-gray-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 list-decimal space-y-1 pl-6 text-gray-700 dark:text-gray-300">
              {children}
            </ol>
          ),
          p: ({ children }) => (
            <p className="my-4 leading-relaxed text-gray-700 dark:text-gray-300">
              {children}
            </p>
          ),
          hr: () => (
            <hr className="my-10 border-gray-200 dark:border-gray-700" />
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900 dark:text-white">
              {children}
            </strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
