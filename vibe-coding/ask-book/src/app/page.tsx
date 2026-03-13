import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-900">AskBook</h1>
        <p className="mt-2 text-gray-500">员工手册智能问答系统</p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/chat"
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            开始聊天
          </Link>
          <Link
            href="/upload"
            className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            上传文档
          </Link>
        </div>
      </div>
    </div>
  );
}
