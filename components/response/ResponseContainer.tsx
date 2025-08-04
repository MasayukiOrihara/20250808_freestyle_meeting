import { motion } from "framer-motion";
import { useMeasure } from "react-use";

import { useAssistantData } from "../provider/AssistantDataProvider";
import { AssistantResponse } from "./AssistantResponse";
import { useChatMessages } from "../provider/ChatMessageProvider";
import { AssistantIcon } from "./AssistantIcon";

/**
 * AI が出力したメッセージを表示する
 * @returns
 */
export const ResponseContainer: React.FC = () => {
  const assistantData = useAssistantData();
  const { assistantMessages } = useChatMessages();
  const [ref, { width, height }] = useMeasure<HTMLDivElement>();

  return (
    <div className="w-full h-1/2">
      {/** ai の反応をもらう */}
      <AssistantResponse />

      {/* 新表示 */}
      <div ref={ref} className="relative w-full h-full m-auto z-6">
        {Object.entries(assistantData).map(([id, data], i, array) => {
          const total = array.length;
          const rx = width / 3; // 楕円x方向の半径（横に広げる）
          const ry = height / 1.8; // 楕円y方向の半径（縦に狭める）
          const mx = rx / 4; // 横幅のマージンサイズ
          const block = width / 5; // ブロックのサイズ
          const icon = block / 3; // アイコンサイズ
          const isRight = i >= total / 2; // 画面の右側にあるかどうか

          const angle = (Math.PI * i) / (total - 1); // 0〜πで均等に分ける
          const x = (rx - mx) * Math.cos(angle); // 中心基準で回転
          const y = ry * Math.sin(angle);

          return (
            <div
              key={id}
              className={`absolute border`}
              style={{
                width: `${block}px`,
                left: `calc(50% - ${x}px)`,
                top: `calc(90% - ${y}px)`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* 表示ゾーン全体表示 */}
              <div
                className={`flex flex-col ${
                  isRight ? "md:flex-row-reverse" : "md:flex-row"
                }`}
              >
                {/* 個々のAL表示セット */}
                {/* アイコン */}
                <div className="relative">
                  <AssistantIcon iconSrc={data.icon} size={icon} />
                </div>

                {/* 吹き出し（縦書き） */}
                <div className={`max-w-[70%] h-48 md:mt-4`}>
                  {assistantMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={`bg-white text-xs md:text-sm ${
                        isRight ? "md:mr-2" : "md:ml-2"
                      }`}
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "upright",
                      }}
                    >
                      {msg.key === id && (
                        <div className="p-2 border-2 rounded-xl break-words whitespace-pre-line">
                          {msg.content}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        <div>
          {assistantMessages.map((msg) => (
            <div key={msg.key}>
              {msg.key === "facilitator" && <div>{msg.content}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
