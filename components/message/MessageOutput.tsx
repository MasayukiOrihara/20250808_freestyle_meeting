import { useEffect, useState } from "react";
import { useChatMessages } from "../provider/ChatMessageProvider";

// 定数
const MAX_Y_OFFSET = 160;
const MAX_LENGTH = 5;

/**
 * ユーザーが入力したメッセージを表示する
 * @returns
 */
export const MessageOutput = () => {
  const { userMessages } = useChatMessages();

  const [showMessages, setShowMessages] = useState<string[]>([]);
  const [yOffset, setYOffset] = useState(MAX_Y_OFFSET);

  useEffect(() => {
    if (showMessages.length < MAX_LENGTH) {
      setYOffset(-40 * (showMessages.length + 1) + MAX_Y_OFFSET);
    }

    setShowMessages(userMessages.map((msg) => msg.content).slice(-MAX_LENGTH));
    console.log(showMessages);
  }, [userMessages]);

  return (
    <div className="w-full h-1/2 flex flex-col items-center font-serif">
      {/* 表示エリア */}
      <div className="relative w-[70%] h-full perspective-dramatic overflow-hidden">
        <div
          className="absolute w-full h-screen left-1/2 -translate-x-1/2 transition-all duration-700 ease-out border-4 border-zinc-800 bg-white overflow-hidden"
          style={{
            transformOrigin: "center bottom",
            transform: `rotateX(20deg) translateY(${yOffset}px) translateZ(0px)`,
          }}
        >
          <div className="px-12 py-4 text-2xl text-zinc-800 text-left">
            {showMessages.map((line, i) => {
              const opacity = 1 - (showMessages.length - 1 - i) * 0.1;
              return (
                <div key={i} className="mb-2" style={{ opacity }}>
                  <span>{line}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
