import { useEffect, useState } from "react";
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

type AssistantCard = {
  id: string;
  name: string;
  description?: string;
  iconPath?: string;
  message?: string;
  color?: string;
};

/**
 * AI コメント
 * @returns
 */
export const AssistantComment: React.FC = () => {
  const assistantData = useAssistantData();
  const { assistantMessages } = useChatMessages();

  const [assistantCards, setAssistantCards] = useState<AssistantCard[]>(
    Object.values(assistantData).map((data) => ({
      id: data.id,
      name: data.name,
      description: data.aiMeta.description,
      iconPath: data.icon,
      color: data.aiMeta.imageColor,
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
    <div className="flex flex-col w-full h-auto md:mt-2 z-5 bg-white border shadow-sm rounded">
      {/* ご意見番 */}
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
            <Card
              style={{
                borderColor: `${data.color}`,
              }}
              className="flex flex-row w-full md:px-4 md:py-2 p-1 border-l-4 hover:bg-blue-50"
            >
              <div className="relative w-12">
                <div className="absolute w-full h-10 rounded-full bg-zinc-200 z-0"></div>
                <AssistantIcon
                  iconSrc={data.iconPath}
                  size={60}
                  className="absolute z-10"
                />
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
  );
};
