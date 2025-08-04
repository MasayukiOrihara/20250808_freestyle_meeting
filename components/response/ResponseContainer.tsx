import { motion } from "framer-motion";
import { useMeasure } from "react-use";
import Image from "next/image";

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
  const { assistantMessages, userMessages } = useChatMessages();
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
    <div className="w-full h-2/3 mt-10">
      {/** ai の反応をもらう */}
      <AssistantResponse />

      {/* 新表示ver.2 */}
      <div className="flex md:flex-row flex-col md:w-[1080px] w-full m-auto">
        {/* 司会者 */}
        <div className="md:w-1/2 w-full border">
          <h2 className="px-2 py-1 font-bold">司会者ロボ</h2>
          <AssistantIcon
            iconSrc={"/facilitator/ai_character01_smile.png"}
            size={200}
            className=" ml-4 rounded-full border-8 border-double border-zinc-400"
          />
          <div className="h-30 mx-10 mt-[-10px] text-xl  bg-blue-300 rounded">
            {assistantMessages
              .filter((msg) => msg.key === "facilitator")
              .map((msg) => (
                <div key={msg.key} className="px-4 py-2">
                  {msg.content}
                </div>
              ))}
          </div>

          {/* ユーザーメッセージ（一時） */}
          <div>
            <p>user message</p>
            <MessageOutput />
          </div>
        </div>

        {/* ご意見番 */}
        <div
          ref={ref}
          className="flex flex-col md:w-1/2 w-full h-full md:mt-[96px] m-auto z-5 border"
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
