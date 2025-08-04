import { motion } from "framer-motion";
import { useMeasure } from "react-use";

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
import { DUMMY_ICON_PATH } from "@/lib/contents";

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
  const [ref, { width, height }] = useMeasure<HTMLDivElement>();

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
    assistantMessages.forEach((msg) => {
      assistantCards.forEach((card) => {
        if (msg.key == card.id) {
          card.message = msg.content;
        }
        console.log(assistantCards);
      });
    });
  }, [assistantMessages]);

  return (
    <div className="w-full h-1/2">
      {/** ai の反応をもらう */}
      <AssistantResponse />

      {/* 新表示ver.2 */}
      <div className="flex md:flex-row flex-col md:w-[1080px] w-full m-auto">
        {/* 司会者 */}
        <div className="md:w-1/2 w-full">
          <AssistantIcon
            iconSrc={DUMMY_ICON_PATH}
            size={200}
            className="rounded-full border-8 border-double border-zinc-400"
          />
          {assistantMessages.map((msg) => (
            <div key={msg.key}>
              {msg.key === "facilitator" && <div>{msg.content}</div>}
            </div>
          ))}
        </div>

        {/* ご意見番 */}
        <div
          ref={ref}
          className="flex flex-col md:w-1/2 w-full h-full m-auto z-5 border"
        >
          {Object.entries(assistantCards).map(([id, data], i, array) => {
            const cardWidth = 800; // card の幅
            const cardHeight = 60; // card の高さ
            const icon = cardHeight; // アイコンサイズ

            return (
              <Card
                key={id}
                className="flex flex-row w-full md:h-24 h-12"
                style={
                  {
                    //width: `${cardWidth}px`,
                    // height: `${cardHeight}px`,
                  }
                }
              >
                <AssistantIcon iconSrc={data.iconPath} size={60} />
                <div className="ml-1">
                  <CardHeader>
                    <CardTitle>{data.name}</CardTitle>
                    <CardDescription className="ml-1">
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
