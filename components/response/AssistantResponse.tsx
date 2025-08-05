import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { UIMessage } from "ai";

import { useChatMessages } from "../provider/ChatMessageProvider";
import { assistantData } from "@/lib/assistantData";
import { useAssistantData } from "../provider/AssistantDataProvider";
import { useAllChats } from "@/hooks/chathooks";
import { useSendCount } from "@/hooks/useSentCount";
import { useSessionId } from "@/hooks/useSessionId";
import { ChatMessage, ChatMessageInput } from "@/lib/types";
import { useAiState } from "../provider/AiStateProvider";

// 変数
const chatTargets = Object.keys(
  assistantData
) as (keyof typeof assistantData)[];
type ChatKey = (typeof chatTargets)[number];
// AI の状態が待機中かを保存する変数
const chatTargetFlags = chatTargets.reduce((acc, key) => {
  acc[key] = false;
  return acc;
}, {} as Record<(typeof chatTargets)[number], boolean>);

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
  const { chatMessages, userMessages, addChatMessage, assistantMessages } =
    useChatMessages();
  const { setAiState } = useAiState();
  // ご意見番AI のデータを取得
  const assistantData = useAssistantData();
  // 現在のセッション ID
  const sessionId = useSessionId();
  // 現在のセッション中に何回 LLM に送っているか
  const { count, increment } = useSendCount();

  // 最新のチャットメッセージを取得
  const latest = chatMessages[chatMessages.length - 1];
  // ご意見番AI が待機中になったかどうかを判定する
  const isReadyAiRef =
    useRef<Record<(typeof chatTargets)[number], boolean>>(chatTargetFlags);
  // 司会者AI が待機中になったかどうかを判定する
  const isReadyFacilitatorRef = useRef(false);
  // 現在ターンにAPI に送るメッセージ
  const assistantMessagesRef = useRef<ChatMessageInput[]>([]);

  // isReadyAssistantsRef変更用（pasonaAIのみ）
  const changeFlag = (key: string, bool: boolean) => {
    const hasMatch = Object.values(chatTargets).some((v) => v === key);
    if (hasMatch) {
      isReadyAiRef.current[key] = bool;
    }
  };

  // usechat（Reactルールでトップレベルで呼び出さなきゃダメらしい）
  const chatMap = useAllChats(count) as Record<
    ChatKey,
    ReturnType<typeof useChat>
  >;
  // 司会者ロボ
  const facilitator = useChat({
    api: "api/facilitator",
    body: { key: "facilitator", sessionId, count },
    onError: (error: Error) => {
      console.error("Chat error:", error);
    },
  });

  // AIのメッセージを ChatMessage に登録する関数
  async function useChatReadyEffect(key: ChatKey) {
    let chatEntry;
    if (key !== "facilitator") {
      chatEntry = chatMap[key];
    } else {
      chatEntry = facilitator;
    }
    const latestMessage = getLatestAssistantMessage(chatEntry.messages);

    useEffect(() => {
      if (chatEntry.messages.length === 0) return;

      // メッセージが受付状態になった
      if (chatEntry.status === "ready") {
        changeFlag(key, true);
        // console.log(`${key} が ready に到達しました`);

        // 最新AIメッセージの登録
        const chatMessage: ChatMessageInput = {
          content: latestMessage.content,
          role: "assistant",
          assistantId: key,
        };

        // メモリ更新／保存
        const messages = assistantMessagesRef.current;
        const index = messages.findIndex((msg) => msg.assistantId === key);
        if (index !== -1) {
          messages[index] = chatMessage;
        } else {
          messages.push(chatMessage);
        }

        // providor へ
        addChatMessage(chatMessage);
      }
    }, [chatEntry.status, chatEntry.messages.length, latestMessage, key]);
  }

  // ユーザーメッセージの送信
  const chatEntryRef = useRef(chatMap);
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!latest || latest.role !== "user") return;

    // それぞれのAPIにユーザーメッセージを送信
    setAiState("loading");
    chatTargets.forEach((key) => {
      if (assistantData[key]?.isUse) {
        chatEntryRef.current[key].append({
          role: "user",
          content: latest.content,
        });
      }
    });
    isReadyFacilitatorRef.current = false;

    // 送信回数を増やす
    increment();
  }, [latest, assistantData, increment]);

  // 司会者の処理
  useEffect(() => {
    const all = Object.values(isReadyAiRef.current).every((v) => v === true);
    if (all && !isReadyFacilitatorRef.current) {
      // 司会者に送信
      const latestUserMessage = userMessages[userMessages.length - 1];
      if (!latest || !latestUserMessage) return;

      const assistantLog = assistantMessagesRef.current;
      facilitator.append(
        {
          role: "user",
          content: latestUserMessage.content,
        },
        { body: { assistantLog } }
      );
      isReadyFacilitatorRef.current = true;
      chatTargets.forEach((key) => {
        changeFlag(key, false);
      });
      // 使ったら初期化
      assistantMessagesRef.current = [];
      // 全通知
      setAiState("ready");
    }
  }, [latest]);

  // 各APIごとの個別useEffect
  useChatReadyEffect("comment");
  useChatReadyEffect("teacher");
  useChatReadyEffect("freestyle");
  useChatReadyEffect("mentor");
  useChatReadyEffect("facilitator");

  return null;
};
