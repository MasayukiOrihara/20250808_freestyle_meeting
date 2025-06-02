import { useChat } from "@ai-sdk/react";
import { useUserMessages } from "./message-provider";
import { useEffect } from "react";

export const MessageAi = () => {
  const { userMessages } = useUserMessages();
  const { messages: commentMessages, append: commentAppend } = useChat({
    api: "api/comment",
    onError: (error) => {
      console.log(error);
    },
  });
  const { messages: teacherMessages, append: teacherAppend } = useChat({
    api: "api/teacher",
    onError: (error) => {
      console.log(error);
    },
  });
  const { messages: freestyleMessages, append: freestyleAppend } = useChat({
    api: "api/freestyle",
    onError: (error) => {
      console.log(error);
    },
  });

  // ユーザーメッセージの送信
  useEffect(() => {
    if (userMessages.length === 0) {
      commentAppend({
        role: "system",
        content:
          "userに記入を促してください。出だしは「こんにちは」で始めてください。",
      });
      return;
    }
    const currentUserMessage = userMessages[userMessages.length - 1];

    commentAppend({ role: "user", content: currentUserMessage });
    teacherAppend({ role: "user", content: currentUserMessage });
    freestyleAppend({ role: "user", content: currentUserMessage });
  }, [userMessages]);

  // AI1 コメントAI
  const aiCommentMessages = commentMessages.filter(
    (m) => m.role === "assistant"
  );
  const currentAiCommentMessage =
    aiCommentMessages[aiCommentMessages.length - 1];

  // AI2 情報AI
  const aiTeacherMessages = teacherMessages.filter(
    (m) => m.role === "assistant"
  );
  const currentAiTeacherMessage =
    aiTeacherMessages[aiTeacherMessages.length - 1];

  // AI3 フリースタイル社員AI
  const aiFreestyleMessages = freestyleMessages.filter(
    (m) => m.role === "assistant"
  );
  const currentAiFreestyleMessage =
    aiFreestyleMessages[aiFreestyleMessages.length - 1];

  return (
    <div className="w-full h-full">
      <div className="mb-2 text-blue-300">ここにAI💬</div>
      {currentAiCommentMessage && (
        <div
          className="my-2 py-2 px-6 bg-zinc-800/60 rounded"
          key={currentAiCommentMessage.id}
        >
          <span className="text-white">{currentAiCommentMessage.content}</span>
        </div>
      )}
      {currentAiTeacherMessage && (
        <div
          className="my-2 py-2 px-6 bg-zinc-800/60 rounded"
          key={currentAiTeacherMessage.id}
        >
          <span className="text-white">{currentAiTeacherMessage.content}</span>
        </div>
      )}
      {currentAiFreestyleMessage &&
        currentAiFreestyleMessage.content !== "関連性なし" && (
          <div
            className="my-2 py-2 px-6 bg-zinc-800/60 rounded"
            key={currentAiFreestyleMessage.id}
          >
            <span className="text-white">
              {currentAiFreestyleMessage.content}
            </span>
          </div>
        )}
    </div>
  );
};
