import { useChat } from "@ai-sdk/react";
import { useSessionId } from "./useSessionId";

/** Reactのルールより静的に追加する必要あり */
export const useAllChats = (count: number) => {
  const sessionId = useSessionId();

  // useChat共通化
  function commonChatOptions(key: string) {
    return {
      body: { key, sessionId, count },
      onError: (error: Error) => {
        console.error("Chat error:", error);
      },
    };
  }

  return {
    // コメントAI
    comment: useChat({
      api: "api/persona-ai/comment",
      ...commonChatOptions("comment"),
    }),
    // 先生AI
    teacher: useChat({
      api: "api/persona-ai/teacher",
      ...commonChatOptions("teacher"),
    }),
    // フリースタイルAI
    freestyle: useChat({
      api: "api/persona-ai/freestyle",
      ...commonChatOptions("freestyle"),
    }),
    // メンターAI
    mentor: useChat({
      api: "api/persona-ai/mentor",
      ...commonChatOptions("mentor"),
    }),
  };
};
