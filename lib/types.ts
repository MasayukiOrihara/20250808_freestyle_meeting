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
