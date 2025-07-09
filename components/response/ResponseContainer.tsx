import { motion } from "framer-motion";

import { useAssistantData } from "../provider/AssistantDataProvider";
import { AssistantResponse } from "./AssistantResponse";
import { useChatMessages } from "../provider/ChatMessageProvider";
import { AssistantIcon } from "./AssistantIcon";
import { useEffect, useState } from "react";

export const ResponseContainer: React.FC = () => {
  const assistantData = useAssistantData();
  const { assistantMessages } = useChatMessages();

  return (
    <div className="w-full">
      {/** ai の反応をもらう */}
      <AssistantResponse />

      <div className="max-w-4xl flex justify-between m-auto">
        {Object.entries(assistantData).map(([id, data]) => (
          <div key={id} className="basis-1/4 border m-2 px-2 py-1">
            {/** 名前 */}
            <div className="h-7.5 overflow-hidden">
              <p className="text-center text-[clamp(1rem,1.2vw,2.5rem)] ">
                {data.name}
              </p>
            </div>
            {/** アイコン */}
            <div className="flex justify-center">
              <AssistantIcon iconSrc={data.icon} size={60} />
            </div>
            <div className="min-h-30 py-2">
              {/* コンテンツ */}

              {assistantMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="mb-2"
                >
                  {msg.key === id ? msg.content : ""}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
