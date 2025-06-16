import { AiMessage, AiMessageContextType } from "@/lib/types";
import React, { createContext, useContext, useState, ReactNode } from "react";

const MessageContext = createContext<AiMessageContextType | undefined>(
  undefined
);

/**
 * aiのメッセージを管理するコンテキストプロバイダー
 * @param param0
 * @returns
 */
export const MessageAiProvider = ({ children }: { children: ReactNode }) => {
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);

  // aiのメッセージを追加する関数
  const addAiMessage = (msg: Omit<AiMessage, "timestamp">) => {
    setAiMessages((prev) => [
      ...prev,
      { ...msg, timestamp: Date.now() }, // 追加時に現在時刻をセット
    ]);
  };

  return (
    <MessageContext.Provider
      value={{ aiMessages, addAiMessage, setAiMessages }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useAiMessages = () => {
  const context = useContext(MessageContext);
  if (!context)
    throw new Error("useMessages must be used within MessageProvider");
  return context;
};
