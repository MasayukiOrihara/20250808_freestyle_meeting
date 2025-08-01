"use client";

import { ChatMessageProvider } from "./provider/ChatMessageProvider";
import { ResponseContainer } from "./response/ResponseContainer";
import { MessageInput } from "./message/MessageInput";
import { AssistantDataProvider } from "./provider/AssistantDataProvider";
import { MessageOutput } from "./message/MessageOutput";

export const MainPage: React.FC = () => {
  return (
    <div className="w-full h-full relative">
      {/* ぼかし背景 */}
      <div className="absolute inset-0 bg-[url('/background/gptlike_blue-and-yello.png')] bg-center bg-cover filter blur-sm opacity-60" />
      <div className="flex flex-col max-w-[1440px] h-full m-auto overflow-hidden">
        <AssistantDataProvider>
          <ChatMessageProvider>
            <ResponseContainer />
            <MessageOutput />
            <MessageInput />
          </ChatMessageProvider>
        </AssistantDataProvider>
      </div>
    </div>
  );
};
