"use client";

import { ChatMessageProvider } from "./provider/ChatMessageProvider";
import { ResponseContainer } from "./response/ResponseContainer";
import { MessageInput } from "./message/MessageInput";
import { AssistantDataProvider } from "./provider/AssistantDataProvider";
import { MessageOutput } from "./message/MessageOutput";
import { MetaAssistant } from "./response/MetaAssistant";

export const MainPage: React.FC = () => {
  return (
    <div className="w-full h-screen overflow-hidden bg-white">
      <AssistantDataProvider>
        <ChatMessageProvider>
          <ResponseContainer />
          <MetaAssistant />
          <MessageOutput />
          <MessageInput />
        </ChatMessageProvider>
      </AssistantDataProvider>
    </div>
  );
};
