import React, { createContext, useContext, useState, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";

import {
  UserMessage,
  UserMessageContextType,
  UserMessageInput,
} from "@/lib/types";

const MessageContext = createContext<UserMessageContextType | undefined>(
  undefined
);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [userMessages, setUserMessages] = useState<UserMessage[]>([]);

  // ユーザー側のメッセージを追加する関数
  const addUserMessage = ({
    content,
    isImport,
    importMessageId,
  }: UserMessageInput) => {
    const msg: UserMessage = {
      id: uuidv4(),
      content: content,
      isImport: isImport,
      importMessageId: importMessageId,
    };
    setUserMessages((prev) => [...prev, msg]);
  };

  return (
    <MessageContext.Provider value={{ userMessages, addUserMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useUserMessages = () => {
  const context = useContext(MessageContext);
  if (!context)
    throw new Error("useMessages must be used within MessageProvider");
  return context;
};
