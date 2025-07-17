import { useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { UIMessage } from "ai";

import { useChatMessages } from "../provider/ChatMessageProvider";
import { assistantData } from "@/lib/assistantData";
import { useAssistantData } from "../provider/AssistantDataProvider";
import { useAllChats } from "@/hooks/chathooks";
import { useSendCount } from "@/hooks/useSentCount";

// 変数
const chatTargets = Object.keys(
  assistantData
) as (keyof typeof assistantData)[];
type ChatKey = (typeof chatTargets)[number];

// 送ったターン数
let turns = 0;

// 最後のメッセージを取り出す共通化関数
function getLatestAssistantMessage(messages: UIMessage[]) {
  const assistantMessages = messages.filter((m) => m.role === "assistant");
  return assistantMessages[assistantMessages.length - 1];
}

/**
 * LLMとメッセージのやり取りを行う
 * @returns
 */
export const AssistantResponse = () => {
  // プロバイダーから取得
  const { chatMessages, addChatMessage } = useChatMessages();
  const assistantData = useAssistantData();
  const { count, increment } = useSendCount();

  // usechat（Reactルールでトップレベルで呼び出さなきゃダメらしい）
  const chatMap = useAllChats(count) as Record<
    ChatKey,
    ReturnType<typeof useChat>
  >;

  // AIのメッセージを取得する共通関数
  function useChatReadyEffect(key: ChatKey) {
    useEffect(() => {
      if (chatMap[key].messages.length === 0) return;

      // メッセージが受付状態になった
      if (chatMap[key].status === "ready") {
        console.log(`${key} が ready に到達しました`);

        // 最新AIメッセージの送信（関連性なしと返ってきた場合は送信しない）
        const latestMessage = getLatestAssistantMessage(chatMap[key].messages);
        addChatMessage({
          content: latestMessage.content,
          role: "assistant",
          assistantId: key,
        });
      }
    }, [chatMap[key].status]);
  }

  // ユーザーメッセージの送信
  useEffect(() => {
    const currentUserMessage = chatMessages[chatMessages.length - 1];
    if (currentUserMessage && currentUserMessage.role === "user") {
      // それぞれのAPIにユーザーメッセージを送信
      chatTargets.forEach((key) => {
        if (assistantData[key]?.isUse) {
          chatMap[key].append({
            role: "user",
            content: currentUserMessage.content,
          });
        }
      });
      // 送信回数を増やす
      increment();
    }
  }, [chatMessages]);

  // 各APIごとの個別useEffect
  useChatReadyEffect("comment");
  useChatReadyEffect("teacher");
  useChatReadyEffect("freestyle");
  useChatReadyEffect("mentor");

  return null;
};
