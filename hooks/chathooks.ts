import { useChat } from "@ai-sdk/react";

// useChat共通化
const commonChatOptions = {
  onError: (error: Error) => {
    console.error("Chat error:", error);
  },
};

/** Reactのルールより静的に追加する必要あり */
export const useAllChats = () => {
  return {
    // コメントAI
    comment: useChat({
      api: "api/comment",
      headers: { id: "comment" },
      ...commonChatOptions,
    }),
    // 先生AI
    teacher: useChat({ api: "api/teacher", ...commonChatOptions }),
    // フリースタイルAI
    freestyle: useChat({ api: "api/freestyle", ...commonChatOptions }),
    // メンターAI
    mentor: useChat({ api: "api/mentor", ...commonChatOptions }),
    // ロジックAI
    logic: useChat({
      api: "api/comment",
      headers: { id: "logic" },
      ...commonChatOptions,
    }),
    // じいじAI
    story: useChat({
      api: "api/comment",
      headers: { id: "story" },
      ...commonChatOptions,
    }),
    // 中二病AI
    dark: useChat({
      api: "api/comment",
      headers: { id: "dark" },
      ...commonChatOptions,
    }),
    // リピートAI
    repeat: useChat({
      api: "api/comment",
      headers: { id: "repeat" },
      ...commonChatOptions,
    }),

    // 必要なら増やす
  };
};
