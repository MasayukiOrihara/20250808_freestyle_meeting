import { useEffect, useState } from "react";
import { AssistantResponse } from "./AssistantResponse";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { AssistantIcon } from "./AssistantIcon";
import { useAssistantData } from "../provider/AssistantDataProvider";
import { useChatMessages } from "../provider/ChatMessageProvider";
import { useAiState } from "../provider/AiStateProvider";

type AssistantCard = {
  id: string;
  name: string;
  description?: string;
  iconPath?: string;
  message?: string;
};

export const AssistantComment: React.FC = () => {
  const assistantData = useAssistantData();
  const { assistantMessages } = useChatMessages();

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

  // カードが何もないことを確認
  const filteredCards = Object.entries(assistantCards).filter(
    ([, data]) => data.message?.trim() // 空・null・スペースだけ を除外
  );

  return (
    <div className="w-full h-full">
      {/** ai の反応をもらう */}
      <AssistantResponse />

      {/* ご意見番 */}
      <div className="flex flex-col w-full h-full md:mt-2 z-5 border shadow-sm rounded">
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
  );
};
