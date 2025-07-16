import { useChat } from "@ai-sdk/react";

// useChat共通化
export const commonChatOptions = {
  onError: (error: Error) => {
    console.error("Chat error:", error);
  },
};

/** Reactのルールより静的に追加する必要あり */
export const useAllChats = () => {
  return {
    // コメントAI
    comment: useChat({
      api: "api/persona-ai/comment",
      headers: { id: "comment" },
      ...commonChatOptions,
    }),
    // 先生AI
    teacher: useChat({ api: "api/persona-ai/teacher", ...commonChatOptions }),
    // フリースタイルAI
    freestyle: useChat({
      api: "api/persona-ai/freestyle",
      ...commonChatOptions,
    }),
    // メンターAI
    mentor: useChat({ api: "api/persona-ai/mentor", ...commonChatOptions }),
  };
};
