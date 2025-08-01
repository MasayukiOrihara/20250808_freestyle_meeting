"use client";

import { ChatMessageProvider } from "./provider/ChatMessageProvider";
import { ResponseContainer } from "./response/ResponseContainer";
import { MessageInput } from "./message/MessageInput";
import { AssistantDataProvider } from "./provider/AssistantDataProvider";
import { MessageOutput } from "./message/MessageOutput";

export const MainPage: React.FC = () => {
  return (
    <div className="flex flex-col max-w-[1440px] h-full m-auto bg-white overflow-hidden">
      <AssistantDataProvider>
        <ChatMessageProvider>
          <ResponseContainer />
          <MessageOutput />
          <MessageInput />
        </ChatMessageProvider>
      </AssistantDataProvider>
    </div>
  );
};
