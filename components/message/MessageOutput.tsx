import { useEffect, useRef, useState } from "react";
import { useChatMessages } from "../provider/ChatMessageProvider";
import { useMeasure } from "react-use";

// 定数
const MAX_Y_OFFSET = 100;
const MAX_LENGTH = 6;

/**
 * ユーザーが入力したメッセージを表示する
 * @returns
 */
export const MessageOutput = () => {
  const { userMessages } = useChatMessages();

  const [showMessages, setShowMessages] = useState<string[]>([]);
  const [ref, { width, height }] = useMeasure<HTMLDivElement>();
  const [yOffset, setYOffset] = useState(MAX_Y_OFFSET);

  // 文字が追加されるたびの処理
  const countRef = useRef(1);
  useEffect(() => {
    const lastMessage = userMessages[userMessages.length - 1];
    const currentUserMessage: string | undefined = lastMessage?.content;

    // 入力文字に空欄を追加する
    if (currentUserMessage && showMessages.length < MAX_LENGTH) {
      // これから追加されるメッセージの行数
      countRef.current += Math.ceil(currentUserMessage.length / 30);
      setYOffset(-40 * countRef.current + MAX_Y_OFFSET);
    }

    setShowMessages(userMessages.map((msg) => msg.content).slice(-MAX_LENGTH));
  }, [userMessages, showMessages.length]);

  return (
    <div className="text-zinc-800 text-left ">
      {showMessages.map((line, i) => {
        const opacity = 1 - (showMessages.length - 1 - i) * 0.1;
        return (
          <div key={i} className="mb-2" style={{ opacity }}>
            <span>＞ </span>
            <span className="break-all">{line}</span>
          </div>
        );
      })}
    </div>
  );
};
