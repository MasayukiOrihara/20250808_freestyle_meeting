import React, { createContext, useContext, useState, ReactNode } from "react";

type MessageContextType = {
  messages: string[];
  addMessage: (msg: string) => void;
};

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<string[]>([]);

  const addMessage = (msg: string) => {
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <MessageContext.Provider value={{ messages, addMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context)
    throw new Error("useMessages must be used within MessageProvider");
  return context;
};
