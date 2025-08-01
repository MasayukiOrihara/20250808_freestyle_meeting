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
      <div ref={ref} className="relative w-full h-full m-auto border">
        {Object.entries(assistantData).map(([id, data], i, array) => {
          const total = array.length;
          const rx = width / 2; // 楕円x方向の半径（横に広げる）
          const ry = height / 1.5; // 楕円y方向の半径（縦に狭める）
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
                className={`flex ${isRight ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* 個々のAL表示セット */}
                {/* アイコン */}
                <div className="relative">
                  <AssistantIcon iconSrc={data.icon} size={icon} />
                </div>

                {/* 吹き出し（縦書き） */}
                <div className={`max-w-[70%] h-48 mt-4`}>
                  {assistantMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={`bg-white text-sm ${
                        isRight ? "mr-2" : "ml-2"
                      }`}
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "upright",
                      }}
                    >
                      {msg.key === id && (
                        <div className="p-2 border-2 rounded-xl">
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
      </div>
      {/* 旧表示 */}
      {/* <div className="max-w-4xl flex justify-between m-auto">
        {Object.entries(assistantData).map(([id, data]) => (
          <div key={id} className="basis-1/4 border m-2 px-2 py-1"> */}
      {/** 名前 */}
      {/* <div className="h-7.5 overflow-hidden">
              <p className="text-center text-[clamp(1rem,1.2vw,2.5rem)] ">
                {data.name}
              </p>
            </div>
            {/** アイコン */}
      {/* <div className="flex justify-center">
              <AssistantIcon iconSrc={data.icon} size={60} />
            </div>
            <div className="min-h-30 py-2"> */}
      {/* コンテンツ */}
      {/* {assistantMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="mb-2 text-sm"
                >
                  {msg.key === id ? msg.content : ""}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );
};
