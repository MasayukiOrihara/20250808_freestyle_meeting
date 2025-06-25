import { useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { UIMessage } from "ai";

import { useUserMessages } from "./message-provider";
import { START_MESSAGE } from "@/lib/contents";
import { aiData } from "@/lib/ai-data";
import { useAiData } from "../timelines/timeline-provider";
import { useAiMessages } from "./message-ai-provider";

// 変数
const chatTargets = Object.keys(aiData) as (keyof typeof aiData)[];
type ChatKey = (typeof chatTargets)[number];

// 最後のメッセージを取り出す共通化関数
function getLatestAssistantMessage(messages: UIMessage[]) {
  const assistantMessages = messages.filter((m) => m.role === "assistant");
  return assistantMessages[assistantMessages.length - 1];
}

// useChat共通化
const commonChatOptions = {
  onError: (error: Error) => {
    console.error("Chat error:", error);
  },
};

/**
 * LLMとメッセージのやり取りを行う
 * @returns
 */
export const MessageAi = () => {
  // usechat（Reactルールでトップレベルで呼び出さなきゃダメらしい）
  const comment = useChat({ api: "api/comment", ...commonChatOptions });
  const teacher = useChat({ api: "api/teacher", ...commonChatOptions });
  const freestyle = useChat({ api: "api/freestyle", ...commonChatOptions });
  const mentor = useChat({ api: "api/mentor", ...commonChatOptions });

  // プロバイダーから取得
  const { userMessages } = useUserMessages();
  const { aiDataState } = useAiData();
  const { addAiMessage } = useAiMessages();

  // すべてのusechatをまとめる
  const chatMap = {
    comment: comment,
    teacher: teacher,
    freestyle: freestyle,
    mentor: mentor,
  } as Record<ChatKey, ReturnType<typeof useChat>>;

  // AIのメッセージを取得する共通関数
  const handleChatReady = (key: ChatKey) => {
    if (chatMap[key].messages.length === 0) return;

    // メッセージが受付状態になった
    if (chatMap[key].status === "ready") {
      console.log(`${key} が ready に到達しました`);

      // 最新AIメッセージの送信
      const latestMessage = getLatestAssistantMessage(chatMap[key].messages);
      if (!latestMessage.content.includes("関連性なし")) {
        addAiMessage({ key: key, content: latestMessage.content });
      }
    }
  };

  // ユーザーメッセージの送信
  useEffect(() => {
    if (userMessages.length === 0) {
      // 初期メッセージの取得
      chatMap.comment.append({
        role: "system",
        content: START_MESSAGE,
      });
      return;
    }

    const currentUserMessage = userMessages[userMessages.length - 1];
    if (!currentUserMessage.importMessageId) {
      // それぞれのAPIにユーザーメッセージを送信
      chatTargets.forEach((key) => {
        if (aiDataState[key]?.isUse) {
          chatMap[key].append({
            role: "user",
            content: currentUserMessage.content,
          });
        }
      });
    } else {
      // importがある場合は、AIメッセージなことを明示して送信
      const aiMessagePrompt = "これはAIから取得したメッセージです:\n";
      chatTargets.forEach((key) => {
        if (aiDataState[key]?.isUse) {
          chatMap[key].append({
            role: "user",
            content: aiMessagePrompt + currentUserMessage.content,
          });
        }
      });
    }
  }, [userMessages]);

  // 各APIごとの個別useEffect
  useEffect(() => {
    handleChatReady("comment");
  }, [chatMap.comment.status]);

  useEffect(() => {
    handleChatReady("teacher");
  }, [chatMap.teacher.status]);

  useEffect(() => {
    handleChatReady("freestyle");
  }, [chatMap.freestyle.status]);

  useEffect(() => {
    handleChatReady("mentor");
  }, [chatMap.mentor.status]);

  return null;
};
