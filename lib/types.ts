import { Dispatch, SetStateAction } from "react";

export type AiMessage = {
  key: string;
  content: string;
  timestamp: number;
};

/** Icon で使うprops */
export type IconProps = {
  iconSrc?: string;
  size?: number;
  title?: string;
};

/** format-timestamp で使うprops */
export type Props = {
  timestamp: string | number; // UNIXミリ秒 or ISO8601文字列想定
};

/** message-ai-provider で使う型 */
export type AiMessageContextType = {
  aiMessages: AiMessage[];
  setAiMessages: Dispatch<SetStateAction<AiMessage[]>>;
  addAiMessage: (msg: Omit<AiMessage, "timestamp">) => void;
};

/** chat message provider で使う型 */
export type ChatMessage = {
  id: string;
  role: string;
  content: string;
  timestamp: string;
  assistantId?: string;
};
export type ChatMessageInput = {
  role: string;
  content: string;
  assistantId?: string;
};
export type ChatMessageContextType = {
  chatMessages: ChatMessage[];
  userMessages: ChatMessage[];
  assistantMessages: AssistantMessages[];
  addChatMessage: ({ content, role, assistantId }: ChatMessageInput) => void;
};
export type AssistantMessages = {
  id: string;
  key: string;
  content: string;
};

// memory で prisma とのやり取りで使う型
export type MessageMemory = {
  role: string;
  content: string;
};
export type ConversationMemory = {
  id: string;
  summary?: string | null;
  messages: MessageMemory[];
};
