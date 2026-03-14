"use client";

const EXAMPLE_QUESTIONS = [
  "加班费怎么算？",
  "请假审批流程是什么？",
  "试用期有多长？",
  "年假有多少天？",
];

interface ChatWelcomeProps {
  onSendExample: (question: string) => void;
}

export function ChatWelcome({ onSendExample }: ChatWelcomeProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          你好！我是员工手册问答助手
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          你可以问我任何关于员工手册的问题
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {EXAMPLE_QUESTIONS.map((question) => (
            <button
              key={question}
              onClick={() => onSendExample(question)}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
