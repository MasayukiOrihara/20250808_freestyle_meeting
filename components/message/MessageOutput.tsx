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
    <div
      ref={ref}
      className="relative w-full h-1/2 flex flex-col items-center perspective-dramatic overflow-hidden font-serif"
    >
      {/* 斜めにする要素 */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 transition-all duration-700 ease-out overflow-hidden`}
        style={{
          width: `${width * 3}px`,
          height: `${height * 2}px`,
          transformOrigin: "center bottom",
          transform: `rotateX(10deg) translateY(${yOffset}px)`,
        }}
      >
        {/* 表示エリア */}
        <div className="w-2xl md:w-7xl h-full border-4 border-zinc-800 bg-white m-auto ">
          <div className="px-6 py-4 text-2xl md:px-12 md:py-8 md:text-4xl text-zinc-800 text-left ">
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
        </div>
      </div>
    </div>
  );
};
