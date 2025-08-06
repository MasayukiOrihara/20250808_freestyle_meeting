import { AssistantResponse } from "./AssistantResponse";
import { useChatMessages } from "../provider/ChatMessageProvider";
import { FacilitatorIcon } from "./AssistantIcon";
import { MessageOutput } from "../message/MessageOutput";
import { motion } from "framer-motion";
import { useStreamMessages } from "../provider/StreamMessagesProvider";
import { useAiState } from "../provider/AiStateProvider";
import { useState } from "react";

/**
 * AI が出力したメッセージを表示する(司会者ロボ)
 * @returns
 */
export const ResponseContainer: React.FC = () => {
  const { assistantMessages } = useChatMessages();
  const { streamMessages } = useStreamMessages();
  const { aiState } = useAiState();
  const [facilitatorMessage, setFacilitatorMessage] = useState();

  // 司会者ロボに文字がないことを判定
  const hasTextFacilitator = !!assistantMessages
    .find((msg) => msg.key === "facilitator")
    ?.content?.trim();

  return (
    <div className="w-full h-auto">
      {/** ai の反応をもらう */}
      <AssistantResponse />

      {/* 司会者 */}
      <div className="w-full">
        <div className="flex flex-col w-1/2 mb-1.5 m-auto">
          <h2 className="px-8 py-2 m-auto mb-1 bg-blue-200 text-blue-900 rounded-xl font-bold">
            司会者ロボ
          </h2>
          <FacilitatorIcon />
        </div>
        <div className={`mx-4 md:text-xl text-sm bg-blue-200 rounded`}>
          {/* メッセージ */}
          {hasTextFacilitator
            ? assistantMessages
                .filter((msg) => msg.key === "facilitator")
                .map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.25 }}
                    className="px-6 py-4 text-sm font-bold text-blue-900"
                  >
                    {msg.content}
                  </motion.div>
                ))
            : streamMessages && (
                <div className="px-6 py-4 text-sm font-bold text-blue-900">
                  {streamMessages}
                </div>
              )}
        </div>
      </div>

      {/* ユーザーメッセージ */}
      {aiState !== "start" && (
        <div className="h-1/4 mt-4 mr-4">
          <h3 className="mb-0.5 text-sm text-zinc-400">送信したメッセージ</h3>
          <MessageOutput />
        </div>
      )}
    </div>
  );
};
