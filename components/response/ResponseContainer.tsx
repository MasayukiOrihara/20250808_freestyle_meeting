import { useChatMessages } from "../provider/ChatMessageProvider";
import { FacilitatorIcon } from "./AssistantIcon";
import { MessageOutput } from "../message/MessageOutput";
import { motion } from "framer-motion";
import { useStreamMessages } from "../provider/StreamMessagesProvider";
import { useAiState } from "../provider/AiStateProvider";
import { useEffect, useRef, useState } from "react";

/**
 * AI が出力したメッセージを表示する(司会者ロボ)
 * @returns
 */
export const ResponseContainer: React.FC = () => {
  const { assistantMessages } = useChatMessages();
  const { streamMessages } = useStreamMessages();
  const { aiState } = useAiState();
  const [facilitatorMessage, setFacilitatorMessage] = useState("");

  // 司会者ロボに文字がないことを判定
  const hasTextFacilitatorRef = useRef(
    !!assistantMessages
      .find((msg) => msg.key === "facilitator")
      ?.content?.trim()
  );

  // 司会者の喋る文字を管理
  const oldRef = useRef("");
  useEffect(() => {
    // 初期メッセージ
    if (!hasTextFacilitatorRef.current && aiState === "start") {
      const message = streamMessages ?? "";

      setFacilitatorMessage(message);
      oldRef.current = message;
      return;
    }

    // 通常返答
    if (aiState === "ready") {
      const message = assistantMessages
        .filter((msg) => msg.key === "facilitator")
        .map((msg) => msg.content);

      // 前のメッセージと同じ
      if (oldRef.current !== message[message.length - 1]) {
        setFacilitatorMessage(message[message.length - 1]);
        oldRef.current = message[message.length - 1];
        return;
      }
    } else {
      // 読み込み中の文字
      setFacilitatorMessage("...");
    }
  }, [streamMessages, assistantMessages, aiState]);

  return (
    <div className="w-full h-auto">
      {/* 司会者 */}
      <div className="w-full">
        <div className="flex flex-col w-1/2 mb-1.5 m-auto">
          <h2 className="px-8 py-2 m-auto mb-1 bg-blue-200 text-blue-900 border-blue-300/opacity-50 shadow-sm rounded-xl font-bold">
            司会者ロボ
          </h2>
          <FacilitatorIcon />
        </div>
        <div
          className={`mx-4 md:text-xl text-sm bg-blue-200 border-blue-300/opacity-50 shadow-sm rounded-md`}
        >
          {/* メッセージ */}
          <motion.div
            key={facilitatorMessage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="px-6 py-4 text-sm font-bold text-blue-900"
          >
            {facilitatorMessage}
          </motion.div>
        </div>
      </div>

      {/* ユーザーメッセージ */}
      {aiState !== "start" && (
        <div className="h-1/4 mt-4 mr-4 mx-4">
          <h3 className="mb-0.5 text-sm text-zinc-400">送信したメッセージ</h3>
          <MessageOutput />
        </div>
      )}
    </div>
  );
};
