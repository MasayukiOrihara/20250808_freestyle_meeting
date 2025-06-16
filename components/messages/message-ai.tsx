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

export const MessageAi = () => {
  const { userMessages } = useUserMessages();
  const { aiDataState } = useAiData();
  const { addAiMessage } = useAiMessages();

  // API別にuseChatを定義
  const chatMap = Object.fromEntries(
    chatTargets.map((key) => [
      key,
      useChat({
        api: `api/${key}`,
        onError: (error) => {
          console.log(error);
        },
      }),
    ])
  ) as Record<ChatKey, ReturnType<typeof useChat>>;

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
    const currentUserMessage = userMessages[userMessages.length - 1].content;

    // それぞれのAPIにユーザーメッセージを送信
    chatTargets.forEach((key) => {
      if (aiDataState[key]?.isUse) {
        chatMap[key].append({ role: "user", content: currentUserMessage });
      }
    });
  }, [userMessages]);

  // メッセージ送信
  chatTargets.forEach((key) => {
    useEffect(() => {
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
    }, [chatMap[key].status]);
  });

  return null;
};
