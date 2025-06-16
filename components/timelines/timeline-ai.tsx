import { AiMessage } from "@/lib/types";
import { Icon } from "./timeline-icon";
import RelativeTime from "./format-timestamp";
import { Heart, Import } from "lucide-react";
import { AiDataState } from "@/lib/ai-data";
import { motion } from "framer-motion";

type TimelineAiProps = {
  aiMessages: AiMessage[];
  aiDataState: AiDataState;
};

export const TimelineAi = ({ aiMessages, aiDataState }: TimelineAiProps) => {
  return (
    <div className="grow-[5] h-full pt-10 border overflow-y-auto">
      {aiMessages
        .slice()
        .sort((a, b) => b.timestamp - a.timestamp)
        .map((msg, idx) => (
          <motion.div
            key={msg.timestamp + msg.key}
            className="flex items-start border-t px-4 py-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
          >
            {/** アイコン */}
            <Icon iconSrc={aiDataState[msg.key]?.icon} />

            <div className="ml-2">
              <div className="flex justify-between items-center mb-1">
                {/** 名前 */}
                <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                  {aiDataState[msg.key]?.name}
                </span>
                <div className="text-sm text-zinc-400">
                  {/** 時間表記 */}
                  {<RelativeTime timestamp={msg.timestamp} />}
                </div>
              </div>
              {/** コンテンツ */}
              <div className="font-mono  mb-1">{msg.content}</div>
              <ul className="flex mt-2">
                <li className="mr-10">
                  <Heart className="w-4 h-4 text-zinc-400" />
                </li>
                <li>
                  <Import className="w-4 h-4 text-zinc-400" />
                </li>
              </ul>
            </div>
          </motion.div>
        ))}
      <div className="border-t text-center text-sm text-zinc-400">
        <p className="m-4">ここがはじめてのメッセージです</p>
      </div>
    </div>
  );
};
