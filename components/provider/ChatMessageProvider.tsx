import React, { createContext, useContext, useState, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";

/** chat message provider で使う型 */
type ChatMessage = {
  id: string;
  role: string;
  content: string;
  timestamp: string;
  assistantId?: string;
};
type ChatMessageInput = {
  role: string;
  content: string;
  assistantId?: string;
};
type ChatMessageContextType = {
  chatMessages: ChatMessage[];
  userMessages: ChatMessage[];
  assistantMessages: AssistantMessages[];
  addChatMessage: ({ content, role, assistantId }: ChatMessageInput) => void;
};

type AssistantMessages = {
  id: string;
  key: string;
  content: string;
};

const ChatMessageContext = createContext<ChatMessageContextType | undefined>(
  undefined
);
/**
 * メッセージプロバイダー
 * @param param0
 * @returns
 */
export const ChatMessageProvider = ({ children }: { children: ReactNode }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [assistantMessages, setAssistantMessages] = useState<
    AssistantMessages[]
  >([]);
  const [userMessages, setUserMessages] = useState<ChatMessage[]>([]);

  // asistant のメッセージを追加する
  const addAssistantMessages = (message: AssistantMessages) => {
    setAssistantMessages((prev) => [...prev, message]);
  };

  // assistant のメッセージを削除する
  const removeMessagesByKey = (targetKey: string) => {
    setAssistantMessages((prev) => prev.filter((msg) => msg.key !== targetKey));
  };

  // メッセージを追加する関数
  const addChatMessage = ({ content, role, assistantId }: ChatMessageInput) => {
    const id = uuidv4();
    const msg: ChatMessage = {
      id: id,
      role: role,
      content: content,
      timestamp: new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
      assistantId: assistantId,
    };
    console.log(msg);

    // assistant の最新メッセージのみ蓄積
    if (role === "assistant") {
      removeMessagesByKey(assistantId!);
      addAssistantMessages({ id: id, key: assistantId!, content: content });
    } else if (role === "user") {
      // user の最新メッセージのみ蓄積
      setUserMessages((prev) => [...prev, msg]);
    }
    setChatMessages((prev) => [...prev, msg]);
  };

  return (
    <ChatMessageContext.Provider
      value={{ chatMessages, userMessages, assistantMessages, addChatMessage }}
    >
      {children}
    </ChatMessageContext.Provider>
  );
};

export const useChatMessages = () => {
  const context = useContext(ChatMessageContext);
  if (!context)
    throw new Error("useChatMessages must be used within ChatMessageProvider");
  return context;
};
