import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useChatMessages } from "../provider/ChatMessageProvider";
import { motion } from "framer-motion";

// 定数
const MAX_ROW_LENGTH = 6; // 最大行数
const MAX_TEXT_COUNT = 35; // 最大文字数

/**
 * ユーザーが入力したメッセージを表示する
 * @returns
 */
export const MessageOutput = () => {
  const { userMessages } = useChatMessages();
  const [showMessages, setShowMessages] = useState<string[]>([]);

  // 文字が追加されるたびの処理
  useEffect(() => {
    // これから追加されるメッセージの行数
    const lastMessage = userMessages[userMessages.length - 1];
    const currentUserMessage: string | undefined = lastMessage?.content;
    let count = 1; // 行数

    // 入力文字に空欄を追加する
    if (currentUserMessage && showMessages.length < MAX_ROW_LENGTH) {
      // これから追加されるメッセージの行数
      count += Math.ceil(currentUserMessage.length / MAX_TEXT_COUNT);
    }
    setShowMessages(
      userMessages.map((msg) => msg.content).slice(-MAX_ROW_LENGTH + count)
    );
  }, [userMessages, showMessages.length]);

  return (
    <div className="text-zinc-600 text-sm text-left ">
      {showMessages.map((line, i) => {
        const opacity = 1 - (showMessages.length - i) * 0.2;
        return (
          <motion.div
            key={line + i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div key={i} style={{ opacity }}>
              <span className="flex items-start">
                <div>
                  <ChevronRight className="w-4 h-4" />
                </div>
                <span className="break-all">{line}</span>
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
