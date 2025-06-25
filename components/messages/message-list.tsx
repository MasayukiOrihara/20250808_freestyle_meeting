import { useChat } from "@ai-sdk/react";
import { Icon } from "../timelines/timeline-icon";
import { useAiData } from "../timelines/timeline-provider";
import { useUserMessages } from "./message-provider";
import { useEffect } from "react";

export const MessageList = () => {
  const { userMessages } = useUserMessages();
  const { aiDataState } = useAiData();
  const { messages, append } = useChat({
    api: `api/analysis`,
    onError: (error) => {
      console.log(error);
    },
  });

  // ユーザーメッセージの解析
  useEffect(() => {
    if (userMessages.length === 0) return;

    append({ role: "user", content: "初期メッセージ" });
  }, [userMessages]);

  return (
    <div className="mb-2">
      {userMessages.map((msg, idx) => (
        <div key={idx}>
          {/** AIメッセージを取り込んだとき */}
          {msg.importMessageId && (
            <div className="flex items-center py-4 px-2 my-4 mx-2 bg-white rounded shadow-lg ">
              <Icon
                iconSrc={aiDataState[msg.importMessageId]?.icon}
                size={36}
              />
              <span className="ml-4 text-sm text-zinc-600">{msg.content}</span>
            </div>
          )}

          {/** 通常のユーザーメッセージ */}
          {!msg.importMessageId && <div>{msg.content}</div>}
        </div>
      ))}
    </div>
  );
};
