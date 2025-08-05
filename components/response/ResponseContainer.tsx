import { useAssistantData } from "../provider/AssistantDataProvider";
import { AssistantResponse } from "./AssistantResponse";
import { useChatMessages } from "../provider/ChatMessageProvider";
import { AssistantIcon } from "./AssistantIcon";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { FACILITATOR_ICON_PATH } from "@/lib/contents";
import { MessageOutput } from "../message/MessageOutput";

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

  return (
    <div className="w-full h-2/3 mt-4">
      {/** ai の反応をもらう */}
      <AssistantResponse />

      {/* 新表示ver.2 */}
      <div className="flex md:flex-row flex-col md:w-[1080px] w-full m-auto">
        {/* 司会者 */}
        <div className="md:w-1/2 md:ml-4">
          <div>
            <div className="flex flex-col w-1/2 mb-1">
              <h2 className="px-2 py-1 m-auto mb-1 bg-blue-200 text-blue-800 rounded font-bold">
                司会者ロボ
              </h2>
              <AssistantIcon
                iconSrc={FACILITATOR_ICON_PATH}
                size={200}
                className="rounded-full border-6 border-double border-blue-200"
              />
            </div>
            <div
              className={`md:h-28 md:mr-10 h-14 md:text-xl text-sm ${
                hasTextFacilitator ? "bg-blue-200" : ""
              } rounded`}
            >
              {assistantMessages
                .filter((msg) => msg.key === "facilitator")
                .map((msg) => (
                  <div key={msg.key} className="px-4 py-2">
                    {msg.content}
                  </div>
                ))}
            </div>
          </div>

          {/* ユーザーメッセージ（一時） */}
          <div className="h-1/4 mt-4 mr-4">
            <h3 className="mb-0.5 text-sm text-zinc-400">送信したメッセージ</h3>
            <div></div>
            <MessageOutput />
          </div>
        </div>

        {/* ご意見番 */}
        <div className="flex flex-col md:w-1/2 w-full h-full md:mt-2 z-5 border shadow-sm rounded">
          <h2 className="md:p-4 p-1 text-sm font-bold">AI コメント</h2>
          {Object.entries(assistantCards).map(([id, data]) => {
            return (
              <Card
                key={id}
                className="flex flex-row w-full md:h-30 h-20 md:px-4 md:py-2 p-1"
              >
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
            );
          })}
        </div>
      </div>
    </div>
  );
};
