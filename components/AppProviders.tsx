import { AiStateProvider } from "./provider/AiStateProvider";
import { AssistantDataProvider } from "./provider/AssistantDataProvider";
import { ChatMessageProvider } from "./provider/ChatMessageProvider";
import { StreamMessagesProvider } from "./provider/StreamMessagesProvider";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AssistantDataProvider>
      <ChatMessageProvider>
        <StreamMessagesProvider>
          <AiStateProvider>{children}</AiStateProvider>
        </StreamMessagesProvider>
      </ChatMessageProvider>
    </AssistantDataProvider>
  );
};
