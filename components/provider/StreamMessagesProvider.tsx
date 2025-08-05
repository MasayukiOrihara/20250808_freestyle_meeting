import React, { createContext, ReactNode, useContext, useState } from "react";

type StreamMessagesContextType = {
  streamMessages: string;
  setStreamMessages: (streamMessages: string) => void;
  addStreamMessages: (chunk: string) => void;
};

const StreamMessagesContext = createContext<
  StreamMessagesContextType | undefined
>(undefined);

/**
 * プロバイダー
 * @param param0
 * @returns
 */

export const StreamMessagesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [streamMessages, setStreamMessages] = useState<string>("");

  const addStreamMessages = (chunk: string) =>
    setStreamMessages((prev) => prev + chunk);

  return (
    <StreamMessagesContext.Provider
      value={{ streamMessages, setStreamMessages, addStreamMessages }}
    >
      {children}
    </StreamMessagesContext.Provider>
  );
};

export const useStreamMessages = () => {
  const context = useContext(StreamMessagesContext);
  if (!context)
    throw new Error(
      "StreamMessagesContext must be used within StreamMessagesProvider"
    );
  return context;
};
