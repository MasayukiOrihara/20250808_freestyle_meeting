"use client";

import { MessageProvider } from "./messages/message-provider";
import { MessageList } from "./messages/message-list";
import { MessageInput } from "./messages/message-input";
import { MessageAi } from "./messages/message-ai";
import { Dispatch, SetStateAction } from "react";
import { AiMessage } from "@/lib/types";
import { AiDataState } from "../lib/ai-data";

type SubpageProps = {
  setAiMessages: (v: SetStateAction<AiMessage[]>) => void;
  aiDataState: AiDataState;
};

export const SubPage: React.FC<SubpageProps> = ({
  setAiMessages,
  aiDataState,
}) => (
  <MessageProvider>
    <div className="w-full h-full px-4 py-2 bg-white dark:bg-zinc-900 bg-[length:20px_20px] bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)]">
      <MessageAi setAiMessages={setAiMessages} aiDataState={aiDataState} />
      <MessageList />
      <MessageInput />
    </div>
  </MessageProvider>
);
