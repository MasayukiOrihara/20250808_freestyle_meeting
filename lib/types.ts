import { Dispatch, SetStateAction } from "react";
import { AiDataState } from "./ai-data";

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

/** message-provider で使う型 */
export type UserMessage = {
  id: string;
  content: string;
  isImport?: boolean;
  importMessageId?: string;
};
export type UserMessageInput = {
  content: string;
  isImport?: boolean;
  importMessageId?: string;
};
export type UserMessageContextType = {
  userMessages: UserMessage[];
  addUserMessage: ({
    content,
    isImport,
    importMessageId,
  }: UserMessageInput) => void;
};

/** message-ai-provider で使う型 */
export type AiMessageContextType = {
  aiMessages: AiMessage[];
  setAiMessages: Dispatch<SetStateAction<AiMessage[]>>;
  addAiMessage: (msg: Omit<AiMessage, "timestamp">) => void;
};

/** timeline-provider で使う型 */
export type AiDataContextType = {
  aiDataState: AiDataState;
  setAiDataState: React.Dispatch<React.SetStateAction<AiDataState>>;
};
