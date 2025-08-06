import { useAssistantData } from "../provider/AssistantDataProvider";
import { AssistantResponse } from "./AssistantResponse";
import { useChatMessages } from "../provider/ChatMessageProvider";
import { AssistantIcon, FacilitatorIcon } from "./AssistantIcon";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  FACILITATOR_ICON_PATH_01,
  FACILITATOR_ICON_PATH_01_hand,
  FACILITATOR_ICON_PATH_NOHAND,
} from "@/lib/contents";
import { MessageOutput } from "../message/MessageOutput";
import { motion } from "framer-motion";
import { useStreamMessages } from "../provider/StreamMessagesProvider";

type AssistantCard = {
  id: string;
  name: string;
  description?: string;
  iconPath?: string;
  message?: string;
};

/**
 * AI が出力したメッセージを表示する
 * @returns
 */
export const ResponseContainer: React.FC = () => {
  const assistantData = useAssistantData();
  const { assistantMessages } = useChatMessages();
  const { streamMessages } = useStreamMessages();

  const [assistantCards, setAssistantCards] = useState<AssistantCard[]>(
    Object.values(assistantData).map((data) => ({
      id: data.id,
      name: data.name,
      description: data.aiMeta.description,
      iconPath: data.icon,
    }))
  );

  // assistant message が着次第追加
  useEffect(() => {
    // 新しい配列を作成して更新
    setAssistantCards((prevCards) =>
      prevCards.map((card) => {
        const matchedMsg = assistantMessages.find((msg) => msg.key === card.id);
        return matchedMsg
          ? { ...card, message: matchedMsg.content } // メッセージを更新
          : card; // 変更なし
      })
    );
  }, [assistantMessages]);

  // 司会者ロボに文字がないことを判定
  const hasTextFacilitator = !!assistantMessages
    .find((msg) => msg.key === "facilitator")
    ?.content?.trim();

  // カードが何もないことを確認
  const filteredCards = Object.entries(assistantCards).filter(
    ([, data]) => data.message?.trim() // 空・null・スペースだけ を除外
  );

  return (
    <div className="w-full h-2/3 mt-4">
      {/** ai の反応をもらう */}
      <AssistantResponse />

      {/* 新表示ver.2 */}
      <div className="flex md:flex-row flex-col md:w-[1080px] w-full m-auto">
        {/* 司会者 */}
        <div className="md:w-3/5">
          <div className="">
            <div className="flex flex-col w-1/2 mb-1.5 m-auto">
              <h2 className="px-8 py-2 m-auto mb-1 bg-blue-200 text-blue-900 rounded-xl font-bold">
                司会者ロボ
              </h2>
              <FacilitatorIcon />
            </div>
            <div
              className={`md:h-28 h-14 mx-4 md:text-xl text-sm bg-blue-200 rounded`}
            >
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

          {/* ユーザーメッセージ（一時） */}
          <div className="h-1/4 mt-4 mr-4">
            <h3 className="mb-0.5 text-sm text-zinc-400">送信したメッセージ</h3>
            <MessageOutput />
          </div>
        </div>

        {/* ご意見番 */}
        <div className="flex flex-col md:w-1/2 w-full h-full md:mt-2 z-5 border shadow-sm rounded">
          <h2 className="md:p-4 p-1 text-sm font-bold">AI コメント</h2>
          {filteredCards.length > 0 ? (
            filteredCards.map(([id, data]) => (
              <motion.div
                key={id + data.message}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="flex flex-row w-full md:h-30 h-20 md:px-4 md:py-2 p-1">
                  <div className="w-12">
                    <AssistantIcon iconSrc={data.iconPath} size={60} />
                  </div>
                  <div className="w-full ml-4">
                    <CardHeader className="mb-2">
                      <CardTitle>{data.name}</CardTitle>
                      <CardDescription className="ml-2">
                        {data.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>{data.message}</CardContent>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            // ダミーメッセージをここに表示
            <Card className="w-full p-4 text-center text-gray-500">
              ここに AI からのコメントが並びます
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
